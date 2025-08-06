import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';

import { AdminService } from '../../services/admin.service';
import { DashboardStats, ProductSalesStats, RecentOrderInfo } from '../../models/admin.model';

interface DashboardState {
  readonly stats: DashboardStats | null;
  readonly loading: boolean;
  readonly error: string | null;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatGridListModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  private readonly state = signal<DashboardState>({
    stats: null,
    loading: true,
    error: null
  });

  readonly stats = computed(() => this.state().stats);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly hasStats = computed(() => this.stats() !== null);

  // Table columns for recent orders
  readonly recentOrdersColumns = ['orderId', 'customerName', 'totalAmount', 'status', 'createdAt'];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.updateState({ loading: true, error: null });

    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.updateState({
          stats,
          loading: false,
          error: null
        });
      },
      error: (error) => {
        console.error('خطا در بارگذاری آمار داشبورد:', error);
        this.updateState({
          loading: false,
          error: 'خطا در بارگذاری اطلاعات داشبورد'
        });
      }
    });
  }

  private updateState(partial: Partial<DashboardState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('fa-IR').format(num);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'warn';
      case 'confirmed': return 'primary';
      case 'shipped': return 'accent';
      case 'delivered': return 'primary';
      case 'cancelled': return 'warn';
      default: return 'primary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'در انتظار';
      case 'confirmed': return 'تایید شده';
      case 'shipped': return 'ارسال شده';
      case 'delivered': return 'تحویل داده شده';
      case 'cancelled': return 'لغو شده';
      default: return status;
    }
  }

  retryLoad(): void {
    this.loadDashboardData();
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}