import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { AdminService } from '../../services/admin.service';
import { 
  AnalyticsSummary, 
  AnalyticsFilter, 
  TimeRange, 
  AnalyticsOverview,
  RevenueAnalytics,
  SalesAnalytics,
  CustomerAnalytics,
  ProductAnalytics,
  OrderAnalytics,
  GeographicAnalytics
} from '../../../models/analytics.model';

interface AnalyticsState {
  readonly summary: AnalyticsSummary | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly selectedTab: number;
  readonly timeRange: TimeRange;
}

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatExpansionModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.scss'
})
export class AdminAnalyticsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  private readonly state = signal<AnalyticsState>({
    summary: null,
    loading: true,
    error: null,
    selectedTab: 0,
    timeRange: this.getDefaultTimeRange()
  });

  readonly summary = computed(() => this.state().summary);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly selectedTab = computed(() => this.state().selectedTab);
  readonly timeRange = computed(() => this.state().timeRange);

  readonly hasData = computed(() => this.summary() !== null);

  readonly filterForm: FormGroup = this.fb.group({
    timeRange: ['last30days'],
    categories: [[]],
    regions: [[]],
    statuses: [[]]
  });

  readonly timeRangeOptions = [
    { value: 'today', label: 'امروز' },
    { value: 'yesterday', label: 'دیروز' },
    { value: 'last7days', label: 'هفته گذشته' },
    { value: 'last30days', label: 'ماه گذشته' },
    { value: 'last90days', label: '۳ ماه گذشته' },
    { value: 'lastYear', label: 'سال گذشته' },
    { value: 'custom', label: 'سفارشی' }
  ];

  readonly tabLabels = [
    'نمای کلی',
    'درآمد',
    'فروش',
    'مشتریان',
    'محصولات',
    'سفارشات',
    'جغرافیایی'
  ];

  ngOnInit(): void {
    this.loadAnalytics();
  }

  private getDefaultTimeRange(): TimeRange {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    return {
      start,
      end,
      label: 'ماه گذشته'
    };
  }

  private loadAnalytics(): void {
    this.updateState({ loading: true, error: null });

    // Mock analytics data - in real app, this would come from API
    setTimeout(() => {
      const mockSummary: AnalyticsSummary = {
        overview: {
          totalRevenue: 125000000,
          totalOrders: 1250,
          totalProducts: 450,
          totalUsers: 3200,
          averageOrderValue: 100000,
          conversionRate: 3.2,
          monthlyGrowth: 15.5,
          yearOverYearGrowth: 28.3
        },
        revenue: {
          totalRevenue: 125000000,
          monthlyRevenue: 8500000,
          dailyRevenue: 280000,
          revenueByPeriod: [
            { period: 'فروردین', revenue: 8500000, orders: 85, growth: 12.5 },
            { period: 'اردیبهشت', revenue: 9200000, orders: 92, growth: 8.2 },
            { period: 'خرداد', revenue: 8800000, orders: 88, growth: -4.3 },
            { period: 'تیر', revenue: 9500000, orders: 95, growth: 8.0 },
            { period: 'مرداد', revenue: 10200000, orders: 102, growth: 7.4 },
            { period: 'شهریور', revenue: 9800000, orders: 98, growth: -3.9 }
          ],
          topRevenueSources: [
            { source: 'اسباب بازی آموزشی', revenue: 45000000, percentage: 36, orders: 450 },
            { source: 'اسباب بازی خلاقانه', revenue: 38000000, percentage: 30.4, orders: 380 },
            { source: 'اسباب بازی حرکتی', revenue: 25000000, percentage: 20, orders: 250 },
            { source: 'اسباب بازی الکترونیکی', revenue: 17000000, percentage: 13.6, orders: 170 }
          ],
          revenueTrend: this.generateRevenueTrend()
        },
        sales: {
          totalSales: 125000000,
          totalUnits: 8500,
          averageOrderValue: 100000,
          salesByCategory: [
            { categoryId: '1', categoryName: 'اسباب بازی آموزشی', sales: 45000000, units: 3000, percentage: 36 },
            { categoryId: '2', categoryName: 'اسباب بازی خلاقانه', sales: 38000000, units: 2500, percentage: 30.4 },
            { categoryId: '3', categoryName: 'اسباب بازی حرکتی', sales: 25000000, units: 1800, percentage: 20 },
            { categoryId: '4', categoryName: 'اسباب بازی الکترونیکی', sales: 17000000, units: 1200, percentage: 13.6 }
          ],
          topSellingProducts: [
            { productId: '1', productName: 'لگو آموزشی ریاضی', category: 'اسباب بازی آموزشی', unitsSold: 850, revenue: 8500000, image: 'https://via.placeholder.com/60', growth: 15.2 },
            { productId: '2', productName: 'پازل سه بعدی', category: 'اسباب بازی خلاقانه', unitsSold: 720, revenue: 7200000, image: 'https://via.placeholder.com/60', growth: 8.5 },
            { productId: '3', productName: 'توپ تعادلی', category: 'اسباب بازی حرکتی', unitsSold: 650, revenue: 6500000, image: 'https://via.placeholder.com/60', growth: 12.3 },
            { productId: '4', productName: 'ربات هوشمند', category: 'اسباب بازی الکترونیکی', unitsSold: 480, revenue: 4800000, image: 'https://via.placeholder.com/60', growth: 5.8 }
          ],
          salesTrend: this.generateSalesTrend()
        },
        customers: {
          totalCustomers: 3200,
          newCustomers: 280,
          activeCustomers: 2100,
          customerRetentionRate: 78.5,
          averageCustomerValue: 39000,
          customerSegments: [
            { segment: 'VIP', count: 320, percentage: 10, averageValue: 150000 },
            { segment: 'عادی', count: 2240, percentage: 70, averageValue: 25000 },
            { segment: 'جدید', count: 640, percentage: 20, averageValue: 15000 }
          ],
          customerGrowth: this.generateCustomerGrowth()
        },
        products: {
          totalProducts: 450,
          activeProducts: 420,
          lowStockProducts: 25,
          outOfStockProducts: 5,
          productsByCategory: [
            { categoryId: '1', categoryName: 'اسباب بازی آموزشی', productCount: 120, totalValue: 45000000, averagePrice: 375000 },
            { categoryId: '2', categoryName: 'اسباب بازی خلاقانه', productCount: 100, totalValue: 38000000, averagePrice: 380000 },
            { categoryId: '3', categoryName: 'اسباب بازی حرکتی', productCount: 80, totalValue: 25000000, averagePrice: 312500 },
            { categoryId: '4', categoryName: 'اسباب بازی الکترونیکی', productCount: 60, totalValue: 17000000, averagePrice: 283333 }
          ],
          inventoryValue: 125000000,
          averageProductRating: 4.2
        },
        orders: {
          totalOrders: 1250,
          pendingOrders: 45,
          completedOrders: 1150,
          cancelledOrders: 55,
          averageOrderValue: 100000,
          ordersByStatus: [
            { status: 'تکمیل شده', count: 1150, percentage: 92, totalValue: 115000000 },
            { status: 'در انتظار', count: 45, percentage: 3.6, totalValue: 4500000 },
            { status: 'لغو شده', count: 55, percentage: 4.4, totalValue: 5500000 }
          ],
          orderTrend: this.generateOrderTrend()
        },
        geographic: {
          topRegions: [
            { region: 'تهران', sales: 45000000, orders: 450, customers: 1200, growth: 18.5 },
            { region: 'اصفهان', sales: 28000000, orders: 280, customers: 750, growth: 12.3 },
            { region: 'شیراز', sales: 22000000, orders: 220, customers: 580, growth: 8.7 },
            { region: 'تبریز', sales: 18000000, orders: 180, customers: 480, growth: 15.2 },
            { region: 'مشهد', sales: 12000000, orders: 120, customers: 320, growth: 6.8 }
          ],
          salesByRegion: [
            { region: 'تهران', sales: 45000000, percentage: 36, growth: 18.5 },
            { region: 'اصفهان', sales: 28000000, percentage: 22.4, growth: 12.3 },
            { region: 'شیراز', sales: 22000000, percentage: 17.6, growth: 8.7 },
            { region: 'تبریز', sales: 18000000, percentage: 14.4, growth: 15.2 },
            { region: 'مشهد', sales: 12000000, percentage: 9.6, growth: 6.8 }
          ],
          customerDistribution: [
            { region: 'تهران', customers: 1200, percentage: 37.5 },
            { region: 'اصفهان', customers: 750, percentage: 23.4 },
            { region: 'شیراز', customers: 580, percentage: 18.1 },
            { region: 'تبریز', customers: 480, percentage: 15 },
            { region: 'مشهد', customers: 320, percentage: 6 }
          ]
        }
      };

      this.updateState({
        summary: mockSummary,
        loading: false,
        error: null
      });
    }, 1500);
  }

  private generateRevenueTrend() {
    const trend = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trend.push({
        date,
        revenue: Math.floor(Math.random() * 500000) + 200000,
        orders: Math.floor(Math.random() * 50) + 20
      });
    }
    return trend;
  }

  private generateSalesTrend() {
    const trend = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trend.push({
        date,
        sales: Math.floor(Math.random() * 500000) + 200000,
        units: Math.floor(Math.random() * 300) + 100,
        orders: Math.floor(Math.random() * 50) + 20
      });
    }
    return trend;
  }

  private generateCustomerGrowth() {
    const growth = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      growth.push({
        date,
        totalCustomers: 3200 + Math.floor(Math.random() * 100),
        newCustomers: Math.floor(Math.random() * 20) + 5,
        activeCustomers: 2100 + Math.floor(Math.random() * 200)
      });
    }
    return growth;
  }

  private generateOrderTrend() {
    const trend = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trend.push({
        date,
        orders: Math.floor(Math.random() * 50) + 20,
        revenue: Math.floor(Math.random() * 500000) + 200000,
        averageValue: Math.floor(Math.random() * 50000) + 80000
      });
    }
    return trend;
  }

  onTabChange(index: number): void {
    this.updateState({ selectedTab: index });
  }

  onFilterChange(): void {
    this.loadAnalytics();
  }

  onTimeRangeChange(): void {
    const timeRangeValue = this.filterForm.get('timeRange')?.value;
    const newTimeRange = this.calculateTimeRange(timeRangeValue);
    this.updateState({ timeRange: newTimeRange });
    this.loadAnalytics();
  }

  private calculateTimeRange(range: string): TimeRange {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        return { start, end, label: 'امروز' };
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        return { start, end, label: 'دیروز' };
      case 'last7days':
        start.setDate(start.getDate() - 7);
        return { start, end, label: 'هفته گذشته' };
      case 'last30days':
        start.setDate(start.getDate() - 30);
        return { start, end, label: 'ماه گذشته' };
      case 'last90days':
        start.setDate(start.getDate() - 90);
        return { start, end, label: '۳ ماه گذشته' };
      case 'lastYear':
        start.setFullYear(start.getFullYear() - 1);
        return { start, end, label: 'سال گذشته' };
      default:
        return this.getDefaultTimeRange();
    }
  }

  exportReport(type: 'pdf' | 'excel' | 'csv'): void {
    this.snackBar.open(`گزارش ${type.toUpperCase()} در حال آماده‌سازی است...`, 'بستن', {
      duration: 3000
    });
    // In real app, this would trigger report generation
  }

  refreshData(): void {
    this.loadAnalytics();
  }

  private updateState(partial: Partial<AnalyticsState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fa-IR').format(value);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getGrowthColor(growth: number): string {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  }

  getGrowthIcon(growth: number): string {
    return growth >= 0 ? 'trending_up' : 'trending_down';
  }
} 