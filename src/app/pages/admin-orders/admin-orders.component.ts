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
import { FormsModule } from '@angular/forms';

import { Order, OrderStatus } from '../../models/order.model';
import { AdminService } from '../../services/admin.service';

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
    'totalAmount',
    'status',
    'createdAt',
    'actions'
  ];

  // Filter options
  readonly selectedStatus = signal('');
  readonly statusOptions = [
    { value: '', label: 'همه سفارشات' },
    { value: OrderStatus.PENDING, label: 'در انتظار' },
    { value: OrderStatus.CONFIRMED, label: 'تایید شده' },
    { value: OrderStatus.SHIPPED, label: 'ارسال شده' },
    { value: OrderStatus.DELIVERED, label: 'تحویل داده شده' },
    { value: OrderStatus.CANCELLED, label: 'لغو شده' }
  ];

  // Mock orders data
  private readonly mockOrders: Order[] = [
    {
      id: 'ORD-001',
      userId: 'user-1',
      items: [
        {
          productId: '1',
          productName: 'لگو آموزشی ریاضی',
          productImage: 'assets/images/lego-math.jpg',
          quantity: 2,
          price: 250000,
          totalPrice: 500000
        }
      ],
      totalAmount: 500000,
      status: OrderStatus.PENDING,
      shippingAddress: {
        street: 'خیابان آزادی، پلاک 123',
        city: 'تهران',
        state: 'تهران',
        zipCode: '1234567890',
        country: 'ایران'
      },
      paymentMethod: 'online' as any,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ORD-002',
      userId: 'user-2',
      items: [
        {
          productId: '2',
          productName: 'عروسک باربی',
          productImage: 'assets/images/barbie.jpg',
          quantity: 1,
          price: 180000,
          totalPrice: 180000
        }
      ],
      totalAmount: 180000,
      status: OrderStatus.CONFIRMED,
      shippingAddress: {
        street: 'خیابان ولیعصر، پلاک 456',
        city: 'تهران',
        state: 'تهران',
        zipCode: '0987654321',
        country: 'ایران'
      },
      paymentMethod: 'cash_on_delivery' as any,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000)
    }
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.updateState({ loading: true, error: null });

    // Mock loading - in real app, call service
    setTimeout(() => {
      this.updateState({
        orders: this.mockOrders,
        filteredOrders: this.mockOrders,
        loading: false,
        error: null
      });
    }, 1000);
  }

  applyStatusFilter(): void {
    const selectedStatus = this.selectedStatus();
    
    let filtered = [...this.orders()];
    
    if (selectedStatus) {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }
    
    this.updateState({ filteredOrders: filtered });
  }

  clearFilters(): void {
    this.selectedStatus.set('');
    this.updateState({ filteredOrders: this.orders() });
  }

  updateOrderStatus(order: Order, newStatus: any): void {
    // Mock update - in real app, call service
    const updatedOrders = this.orders().map(o =>
      o.id === order.id 
        ? { ...o, status: newStatus, updatedAt: new Date() }
        : o
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

  private updateState(partial: Partial<OrdersState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }
}