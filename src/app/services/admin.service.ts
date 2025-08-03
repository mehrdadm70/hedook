import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, shareReplay, tap } from 'rxjs/operators';

import { 
  Admin, 
  AdminLoginDto, 
  AdminAuthResponse, 
  DashboardStats, 
  CreateAdminDto, 
  UpdateAdminDto,
  AdminRole,
  AdminPermission
} from '../models/admin.model';
import { Product, CreateProductDto, UpdateProductDto } from '../models/product.model';
import { Order, OrderStatus } from '../models/order.model';
import { User } from '../models/user.model';

interface AdminServiceState {
  readonly currentAdmin: Admin | null;
  readonly isAuthenticated: boolean;
  readonly loading: boolean;
  readonly error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin';
  private readonly TOKEN_KEY = 'hedook_admin_token';

  private readonly state = signal<AdminServiceState>({
    currentAdmin: null,
    isAuthenticated: false,
    loading: false,
    error: null
  });

  readonly currentAdmin = computed(() => this.state().currentAdmin);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // Mock admin for development
  private readonly mockAdmin: Admin = {
    id: 'admin-1',
    firstName: 'مدیر',
    lastName: 'سیستم',
    email: 'admin@hedook.com',
    role: AdminRole.SUPER_ADMIN,
    permissions: Object.values(AdminPermission),
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  };

  // Mock dashboard stats
  private readonly mockDashboardStats: DashboardStats = {
    totalProducts: 156,
    totalOrders: 324,
    totalUsers: 1248,
    totalRevenue: 45670000,
    pendingOrders: 23,
    lowStockProducts: 8,
    monthlyRevenue: 12450000,
    monthlyOrders: 89,
    topSellingProducts: [
      {
        productId: '1',
        productName: 'لگو آموزشی ریاضی',
        totalSold: 45,
        revenue: 11250000,
        image: 'assets/images/lego-math.jpg'
      },
      {
        productId: '2',
        productName: 'عروسک باربی',
        totalSold: 38,
        revenue: 6840000,
        image: 'assets/images/barbie.jpg'
      }
    ],
    recentOrders: [
      {
        orderId: 'ORD-001',
        customerName: 'علی احمدی',
        totalAmount: 450000,
        status: 'pending',
        createdAt: new Date()
      },
      {
        orderId: 'ORD-002',
        customerName: 'فاطمه محمدی',
        totalAmount: 320000,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 3600000)
      }
    ]
  };

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      // In a real app, validate token with server
      this.updateState({
        currentAdmin: this.mockAdmin,
        isAuthenticated: true
      });
    }
  }

      login(credentials: AdminLoginDto): Observable<AdminAuthResponse> {
    this.updateState({ loading: true, error: null });

    // Mock login - in real app, send to server
    return new Observable<AdminAuthResponse>(observer => {
      setTimeout(() => {
        if (credentials.email === 'admin@hedook.com' && credentials.password === 'admin123') {
          const response: AdminAuthResponse = {
            admin: this.mockAdmin,
            token: 'mock-jwt-token-' + Date.now(),
            expiresIn: 3600
          };
          
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.updateState({
            currentAdmin: response.admin,
            isAuthenticated: true,
            loading: false,
            error: null
          });
          
          observer.next(response);
          observer.complete();
        } else {
          this.updateState({
            loading: false,
            error: 'ایمیل یا رمز عبور اشتباه است'
          });
          observer.error(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.updateState({
      currentAdmin: null,
      isAuthenticated: false,
      error: null
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return of(this.mockDashboardStats).pipe(
      catchError(this.handleError<DashboardStats>('getDashboardStats'))
    );
  }

  // Product Management
  getAllProducts(): Observable<Product[]> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  createProduct(productDto: CreateProductDto): Observable<Product> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  updateProduct(productDto: UpdateProductDto): Observable<Product> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  deleteProduct(id: string): Observable<void> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  // Order Management
  getAllOrders(): Observable<Order[]> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  getOrderById(id: string): Observable<Order | null> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  // User Management
  getAllUsers(): Observable<User[]> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  getUserById(id: string): Observable<User | null> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  // Admin Management
  getAllAdmins(): Observable<Admin[]> {
    return of([this.mockAdmin]).pipe(
      catchError(this.handleError<Admin[]>('getAllAdmins', []))
    );
  }

  createAdmin(adminDto: CreateAdminDto): Observable<Admin> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  updateAdmin(adminDto: UpdateAdminDto): Observable<Admin> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  deleteAdmin(id: string): Observable<void> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  hasPermission(permission: AdminPermission): boolean {
    const admin = this.currentAdmin();
    return admin ? admin.permissions.includes(permission) : false;
  }

  hasRole(role: AdminRole): boolean {
    const admin = this.currentAdmin();
    return admin ? admin.role === role : false;
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  private updateState(partial: Partial<AdminServiceState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      let errorMessage = 'خطایی رخ داده است';
      
      if (error.error instanceof ErrorEvent) {
        errorMessage = `خطا: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 401:
            errorMessage = 'دسترسی غیرمجاز';
            this.logout();
            break;
          case 403:
            errorMessage = 'عدم دسترسی کافی';
            break;
          case 404:
            errorMessage = 'یافت نشد';
            break;
          case 500:
            errorMessage = 'خطای سرور';
            break;
          default:
            errorMessage = `خطا ${error.status}: ${error.message}`;
        }
      }

      this.updateState({ error: errorMessage, loading: false });
      return of(result as T);
    };
  }
}