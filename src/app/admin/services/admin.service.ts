import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, shareReplay, tap, delay } from 'rxjs/operators';

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
import { Product, CreateProductDto, UpdateProductDto } from '../../models/product.model';
import { Order, OrderStatus } from '../../models/order.model';
import { Category, CreateCategoryDto, UpdateCategoryDto, CategoryStatus } from '../../models/category.model';
import { User, CreateUserDto, UpdateUserDto, UserRole, UserStats } from '../../models/user-management.model';

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

  // Mock categories data
  private readonly mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'اسباب بازی',
      description: 'انواع اسباب بازی برای کودکان',
      slug: 'toys',
      image: 'assets/images/categories/toys.jpg',
      level: 0,
      sortOrder: 1,
      isActive: true,
      productCount: 45,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'cat-2',
      name: 'کتاب و آموزش',
      description: 'کتاب‌های آموزشی و داستانی',
      slug: 'books-education',
      image: 'assets/images/categories/books.jpg',
      level: 0,
      sortOrder: 2,
      isActive: true,
      productCount: 32,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'cat-3',
      name: 'لگو و ساختنی',
      description: 'لگو و اسباب بازی‌های ساختنی',
      slug: 'lego-construction',
      image: 'assets/images/categories/lego.jpg',
      parentId: 'cat-1',
      level: 1,
      sortOrder: 1,
      isActive: true,
      productCount: 18,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'cat-4',
      name: 'عروسک و شخصیت‌ها',
      description: 'عروسک‌ها و شخصیت‌های کارتونی',
      slug: 'dolls-characters',
      image: 'assets/images/categories/dolls.jpg',
      parentId: 'cat-1',
      level: 1,
      sortOrder: 2,
      isActive: true,
      productCount: 22,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'cat-5',
      name: 'کتاب داستان',
      description: 'کتاب‌های داستانی برای کودکان',
      slug: 'story-books',
      image: 'assets/images/categories/story-books.jpg',
      parentId: 'cat-2',
      level: 1,
      sortOrder: 1,
      isActive: true,
      productCount: 15,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'cat-6',
      name: 'کتاب آموزشی',
      description: 'کتاب‌های آموزشی و درسی',
      slug: 'educational-books',
      image: 'assets/images/categories/educational-books.jpg',
      parentId: 'cat-2',
      level: 1,
      sortOrder: 2,
      isActive: true,
      productCount: 17,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }
  ];

  // Mock users data
  private readonly mockUsers: User[] = [
    {
      id: 'user-1',
      firstName: 'علی',
      lastName: 'احمدی',
      email: 'ali.ahmadi@example.com',
      phone: '09123456789',
      avatar: 'assets/images/avatars/user1.jpg',
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      role: UserRole.CUSTOMER,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      lastLogin: new Date(Date.now() - 86400000),
      totalOrders: 8,
      totalSpent: 2450000
    },
    {
      id: 'user-2',
      firstName: 'فاطمه',
      lastName: 'محمدی',
      email: 'fateme.mohammadi@example.com',
      phone: '09987654321',
      avatar: 'assets/images/avatars/user2.jpg',
      isActive: true,
      emailVerified: true,
      phoneVerified: false,
      role: UserRole.VIP_CUSTOMER,
      createdAt: new Date('2023-12-20'),
      updatedAt: new Date(),
      lastLogin: new Date(Date.now() - 172800000),
      totalOrders: 15,
      totalSpent: 5670000
    },
    {
      id: 'user-3',
      firstName: 'محمد',
      lastName: 'رضایی',
      email: 'mohammad.rezaei@example.com',
      phone: '09351234567',
      avatar: 'assets/images/avatars/user3.jpg',
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      role: UserRole.CUSTOMER,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date(),
      lastLogin: new Date(Date.now() - 259200000),
      totalOrders: 3,
      totalSpent: 890000
    },
    {
      id: 'user-4',
      firstName: 'زهرا',
      lastName: 'حسینی',
      email: 'zahra.hosseini@example.com',
      phone: '09111111111',
      avatar: 'assets/images/avatars/user4.jpg',
      isActive: false,
      emailVerified: false,
      phoneVerified: false,
      role: UserRole.CUSTOMER,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date(),
      lastLogin: undefined as any,
      totalOrders: 0,
      totalSpent: 0
    },
    {
      id: 'user-5',
      firstName: 'حسن',
      lastName: 'کریمی',
      email: 'hasan.karimi@example.com',
      phone: '09222222222',
      avatar: 'assets/images/avatars/user5.jpg',
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      role: UserRole.MODERATOR,
      createdAt: new Date('2023-11-15'),
      updatedAt: new Date(),
      lastLogin: new Date(Date.now() - 3600000),
      totalOrders: 0,
      totalSpent: 0
    }
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
        },
        {
          productId: '3',
          productName: 'پازل حیوانات',
          productImage: 'assets/images/animal-puzzle.jpg',
          quantity: 1,
          price: 120000,
          totalPrice: 120000
        }
      ],
      totalAmount: 620000,
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
    },
    {
      id: 'ORD-003',
      userId: 'user-3',
      items: [
        {
          productId: '4',
          productName: 'ماشین کنترلی',
          productImage: 'assets/images/rc-car.jpg',
          quantity: 1,
          price: 350000,
          totalPrice: 350000
        },
        {
          productId: '5',
          productName: 'کتاب داستان',
          productImage: 'assets/images/story-book.jpg',
          quantity: 3,
          price: 45000,
          totalPrice: 135000
        }
      ],
      totalAmount: 485000,
      status: OrderStatus.SHIPPED,
      shippingAddress: {
        street: 'خیابان انقلاب، پلاک 789',
        city: 'تهران',
        state: 'تهران',
        zipCode: '1122334455',
        country: 'ایران'
      },
      paymentMethod: 'online' as any,
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 86400000)
    },
    {
      id: 'ORD-004',
      userId: 'user-4',
      items: [
        {
          productId: '6',
          productName: 'اسباب بازی موسیقی',
          productImage: 'assets/images/music-toy.jpg',
          quantity: 1,
          price: 220000,
          totalPrice: 220000
        }
      ],
      totalAmount: 220000,
      status: OrderStatus.DELIVERED,
      shippingAddress: {
        street: 'خیابان جمهوری، پلاک 321',
        city: 'تهران',
        state: 'تهران',
        zipCode: '5544332211',
        country: 'ایران'
      },
      paymentMethod: 'cash_on_delivery' as any,
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 172800000)
    }
  ];

  // Order Management
  getAllOrders(): Observable<Order[]> {
    // Simulate network delay
    return of([...this.mockOrders]).pipe(
      delay(500),
      catchError(this.handleError<Order[]>('getAllOrders', []))
    );
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    const orderIndex = this.mockOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
      return throwError(() => new Error('سفارش یافت نشد'));
    }

    const updatedOrder = {
      ...this.mockOrders[orderIndex],
      status,
      updatedAt: new Date()
    };

    this.mockOrders[orderIndex] = updatedOrder;

    return of(updatedOrder).pipe(
      catchError(this.handleError<Order>('updateOrderStatus'))
    );
  }

  getOrderById(id: string): Observable<Order | null> {
    const order = this.mockOrders.find(order => order.id === id);
    return of(order || null).pipe(
      catchError(this.handleError<Order | null>('getOrderById', null))
    );
  }

  // Category Management
  getAllCategories(): Observable<Category[]> {
    return of([...this.mockCategories]).pipe(
      delay(500),
      catchError(this.handleError<Category[]>('getAllCategories', []))
    );
  }

  getCategoryById(id: string): Observable<Category | null> {
    const category = this.mockCategories.find(cat => cat.id === id);
    return of(category || null).pipe(
      catchError(this.handleError<Category | null>('getCategoryById', null))
    );
  }

  createCategory(categoryDto: CreateCategoryDto): Observable<Category> {
    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      name: categoryDto.name,
      ...(categoryDto.description && { description: categoryDto.description }),
      slug: categoryDto.slug || this.generateSlug(categoryDto.name),
      ...(categoryDto.image && { image: categoryDto.image }),
      ...(categoryDto.parentId && { parentId: categoryDto.parentId }),
      level: categoryDto.parentId ? 1 : 0,
      sortOrder: categoryDto.sortOrder || 1,
      isActive: categoryDto.isActive ?? true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockCategories.push(newCategory);

    return of(newCategory).pipe(
      delay(500),
      catchError(this.handleError<Category>('createCategory'))
    );
  }

  updateCategory(categoryDto: UpdateCategoryDto): Observable<Category> {
    const categoryIndex = this.mockCategories.findIndex(cat => cat.id === categoryDto.id);
    if (categoryIndex === -1) {
      return throwError(() => new Error('دسته‌بندی یافت نشد'));
    }

    const updatedCategory = {
      ...this.mockCategories[categoryIndex],
      ...categoryDto,
      updatedAt: new Date()
    };

    this.mockCategories[categoryIndex] = updatedCategory;

    return of(updatedCategory).pipe(
      delay(500),
      catchError(this.handleError<Category>('updateCategory'))
    );
  }

  deleteCategory(id: string): Observable<void> {
    const categoryIndex = this.mockCategories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      return throwError(() => new Error('دسته‌بندی یافت نشد'));
    }

    // Check if category has children
    const hasChildren = this.mockCategories.some(cat => cat.parentId === id);
    if (hasChildren) {
      return throwError(() => new Error('نمی‌توان دسته‌بندی دارای زیرمجموعه را حذف کرد'));
    }

    this.mockCategories.splice(categoryIndex, 1);

    return of(void 0).pipe(
      delay(500),
      catchError(this.handleError<void>('deleteCategory'))
    );
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // User Management
  getAllUsers(): Observable<User[]> {
    return of([...this.mockUsers]).pipe(
      delay(500),
      catchError(this.handleError<User[]>('getAllUsers', []))
    );
  }

  getUserById(id: string): Observable<User | null> {
    const user = this.mockUsers.find(user => user.id === id);
    return of(user || null).pipe(
      delay(300),
      catchError(this.handleError<User | null>('getUserById', null))
    );
  }

  createUser(userDto: CreateUserDto): Observable<User> {
    const newUser: User = {
      id: 'user-' + Date.now(),
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      email: userDto.email,
      ...(userDto.phone && { phone: userDto.phone }),
      isActive: userDto.isActive ?? true,
      emailVerified: false,
      phoneVerified: false,
      role: userDto.role || UserRole.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalOrders: 0,
      totalSpent: 0
    };

    this.mockUsers.push(newUser);

    return of(newUser).pipe(
      delay(500),
      catchError(this.handleError<User>('createUser'))
    );
  }

  updateUser(userDto: UpdateUserDto): Observable<User> {
    const userIndex = this.mockUsers.findIndex(user => user.id === userDto.id);
    if (userIndex === -1) {
      return throwError(() => new Error('کاربر یافت نشد'));
    }

    const updatedUser = {
      ...this.mockUsers[userIndex],
      ...userDto,
      updatedAt: new Date()
    };

    this.mockUsers[userIndex] = updatedUser;

    return of(updatedUser).pipe(
      delay(500),
      catchError(this.handleError<User>('updateUser'))
    );
  }

  deleteUser(id: string): Observable<void> {
    const userIndex = this.mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return throwError(() => new Error('کاربر یافت نشد'));
    }

    this.mockUsers.splice(userIndex, 1);

    return of(void 0).pipe(
      delay(500),
      catchError(this.handleError<void>('deleteUser'))
    );
  }

  getUserStats(): Observable<UserStats> {
    const totalUsers = this.mockUsers.length;
    const activeUsers = this.mockUsers.filter(user => user.isActive).length;
    const newUsersThisMonth = this.mockUsers.filter(user => 
      user.createdAt.getMonth() === new Date().getMonth() &&
      user.createdAt.getFullYear() === new Date().getFullYear()
    ).length;
    const vipUsers = this.mockUsers.filter(user => user.role === UserRole.VIP_CUSTOMER).length;
    const usersWithOrders = this.mockUsers.filter(user => user.totalOrders > 0).length;
    const averageOrdersPerUser = usersWithOrders > 0 
      ? this.mockUsers.reduce((sum, user) => sum + user.totalOrders, 0) / usersWithOrders 
      : 0;

    const topSpenders = this.mockUsers
      .filter(user => user.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map(user => ({
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        totalSpent: user.totalSpent,
        orderCount: user.totalOrders
      }));

    const stats: UserStats = {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      vipUsers,
      usersWithOrders,
      averageOrdersPerUser,
      topSpenders
    };

    return of(stats).pipe(
      delay(300),
      catchError(this.handleError<UserStats>('getUserStats'))
    );
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