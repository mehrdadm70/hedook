import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

import { Order, OrderStatus } from '../../models/order.model';
import { AdminService } from '../../services/admin.service';
import { OrderDetailDialogComponent } from '../../components/order-detail-dialog/order-detail-dialog.component';

interface OrdersState {
  readonly orders: ReadonlyArray<Order>;
  readonly filteredOrders: ReadonlyArray<Order>;
  readonly loading: boolean;
  readonly error: string | null;
}

@Component({
  selector: 'app-admin-orders',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  private readonly state = signal<OrdersState>({
    orders: [],
    filteredOrders: [],
    loading: true,
    error: null
  });

  readonly orders = computed(() => this.state().orders);
  readonly filteredOrders = computed(() => this.state().filteredOrders);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly hasOrders = computed(() => this.orders().length > 0);
  readonly hasFilteredOrders = computed(() => this.filteredOrders().length > 0);

  // Table configuration
  readonly displayedColumns = [
    'orderId',
    'userId', 
    'itemsCount',
    'totalAmount',
    'paymentMethod',
    'status',
    'createdAt',
    'actions'
  ];

  // Filter options
  readonly selectedStatus = signal('');
  readonly searchTerm = signal('');
  readonly selectedDateRange = signal('');
  
  readonly statusOptions = [
    { value: '', label: 'همه سفارشات' },
    { value: OrderStatus.PENDING, label: 'در انتظار' },
    { value: OrderStatus.CONFIRMED, label: 'تایید شده' },
    { value: OrderStatus.SHIPPED, label: 'ارسال شده' },
    { value: OrderStatus.DELIVERED, label: 'تحویل داده شده' },
    { value: OrderStatus.CANCELLED, label: 'لغو شده' }
  ];

  readonly dateRangeOptions = [
    { value: '', label: 'همه تاریخ‌ها' },
    { value: 'today', label: 'امروز' },
    { value: 'yesterday', label: 'دیروز' },
    { value: 'week', label: 'هفته گذشته' },
    { value: 'month', label: 'ماه گذشته' }
  ];

  // Expose OrderStatus for template
  readonly OrderStatus = OrderStatus;



  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.updateState({ loading: true, error: null });

    this.adminService.getAllOrders().pipe(
      timeout(10000), // 10 second timeout
      catchError((error) => {
        console.error('Error loading orders:', error);
        return throwError(() => new Error('خطا در بارگذاری سفارشات. لطفاً دوباره تلاش کنید.'));
      })
    ).subscribe({
      next: (orders) => {
        this.updateState({
          orders,
          filteredOrders: orders,
          loading: false,
          error: null
        });
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        // Fallback to empty orders if service fails
        this.updateState({
          orders: [],
          filteredOrders: [],
          loading: false,
          error: error?.message || 'خطا در بارگذاری سفارشات. لطفاً دوباره تلاش کنید.'
        });
      }
    });
  }

  applyFilters(): void {
    const selectedStatus = this.selectedStatus();
    const searchTerm = this.searchTerm().toLowerCase();
    const selectedDateRange = this.selectedDateRange();
    
    let filtered = [...this.orders()];
    
    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.userId.toLowerCase().includes(searchTerm) ||
        order.items.some(item => 
          item.productName.toLowerCase().includes(searchTerm)
        )
      );
    }
    
    // Date range filter
    if (selectedDateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        
        switch (selectedDateRange) {
          case 'today':
            return orderDateOnly.getTime() === today.getTime();
          case 'yesterday':
            const yesterday = new Date(today.getTime() - 86400000);
            return orderDateOnly.getTime() === yesterday.getTime();
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 86400000);
            return orderDateOnly >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 86400000);
            return orderDateOnly >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    this.updateState({ filteredOrders: filtered });
  }

  clearFilters(): void {
    this.selectedStatus.set('');
    this.searchTerm.set('');
    this.selectedDateRange.set('');
    this.updateState({ filteredOrders: this.orders() });
  }

  updateOrderStatus(order: Order, newStatus: OrderStatus): void {
    this.adminService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        const updatedOrders = this.orders().map(o =>
          o.id === order.id ? updatedOrder : o
        );

        this.updateState({ 
          orders: updatedOrders,
          filteredOrders: updatedOrders
        });

        this.snackBar.open(`وضعیت سفارش به "${this.getStatusLabel(newStatus)}" تغییر یافت`, 'بستن', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        this.snackBar.open(error.message || 'خطا در به‌روزرسانی وضعیت سفارش', 'بستن', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING: return 'در انتظار';
      case OrderStatus.CONFIRMED: return 'تایید شده';
      case OrderStatus.SHIPPED: return 'ارسال شده';
      case OrderStatus.DELIVERED: return 'تحویل داده شده';
      case OrderStatus.CANCELLED: return 'لغو شده';
      default: return status;
    }
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING: return 'warn';
      case OrderStatus.CONFIRMED: return 'primary';
      case OrderStatus.SHIPPED: return 'accent';
      case OrderStatus.DELIVERED: return 'primary';
      case OrderStatus.CANCELLED: return 'warn';
      default: return 'primary';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  retryLoad(): void {
    this.loadOrders();
  }

  viewOrderDetails(order: Order): void {
    this.dialog.open(OrderDetailDialogComponent, {
      data: { order },
      width: '700px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'online': return 'آنلاین';
      case 'cash_on_delivery': return 'پرداخت در محل';
      default: return method;
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  private updateState(partial: Partial<OrdersState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }
}