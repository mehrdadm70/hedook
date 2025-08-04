import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError, tap } from 'rxjs/operators';
import { User, CreateUserDto, UserRole } from '../models/user-management.model';

export interface AuthResponse {
  readonly user: User;
  readonly token: string;
  readonly expiresIn: number;
}

export interface LoginDto {
  readonly email: string;
  readonly password: string;
}

export interface RegisterDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly password: string;
  readonly confirmPassword: string;
}

interface AuthState {
  readonly currentUser: User | null;
  readonly isAuthenticated: boolean;
  readonly loading: boolean;
  readonly error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';
  private readonly TOKEN_KEY = 'hedook_user_token';

  private readonly state = signal<AuthState>({
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    error: null
  });

  readonly currentUser = computed(() => this.state().currentUser);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // Mock users for development
  private readonly mockUsers: User[] = [
    {
      id: 'user-1',
      firstName: 'علی',
      lastName: 'احمدی',
      email: 'ali@example.com',
      phone: '09123456789',
      avatar: 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=ع',
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      role: UserRole.CUSTOMER,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      lastLogin: new Date(),
      totalOrders: 5,
      totalSpent: 1250000
    },
    {
      id: 'user-2',
      firstName: 'فاطمه',
      lastName: 'محمدی',
      email: 'fateme@example.com',
      phone: '09987654321',
      avatar: 'https://via.placeholder.com/150/EC4899/FFFFFF?text=ف',
      isActive: true,
      emailVerified: true,
      phoneVerified: false,
      role: UserRole.VIP_CUSTOMER,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      lastLogin: new Date(),
      totalOrders: 12,
      totalSpent: 3500000
    }
  ];

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      // In a real app, validate token with server
      const user = this.mockUsers[0]; // For demo, use first user
      this.updateState({
        currentUser: user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
    }
  }

  private updateState(partial: Partial<AuthState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  register(registerData: RegisterDto): Observable<AuthResponse> {
    this.updateState({ loading: true, error: null });

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      this.updateState({
        loading: false,
        error: 'رمز عبور و تکرار آن مطابقت ندارند'
      });
      return throwError(() => new Error('Passwords do not match'));
    }

    // Check if email already exists
    const existingUser = this.mockUsers.find(u => u.email === registerData.email);
    if (existingUser) {
      this.updateState({
        loading: false,
        error: 'این ایمیل قبلاً ثبت شده است'
      });
      return throwError(() => new Error('Email already exists'));
    }

    // Mock registration
    return of({
      user: {
        id: 'user-' + Date.now(),
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        phone: registerData.phone || undefined,
        avatar: `https://via.placeholder.com/150/4F46E5/FFFFFF?text=${registerData.firstName.charAt(0)}`,
        isActive: true,
        emailVerified: false,
        phoneVerified: false,
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        totalOrders: 0,
        totalSpent: 0
      },
      token: 'mock-user-token-' + Date.now(),
      expiresIn: 3600
    } as AuthResponse).pipe(
      delay(1000),
      catchError(error => {
        this.updateState({
          loading: false,
          error: error.message || 'خطا در ثبت نام'
        });
        return throwError(() => error);
      })
    ).pipe(
      delay(1000),
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        this.updateState({
          currentUser: response.user,
          isAuthenticated: true,
          loading: false,
          error: null
        });
      })
    );
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    this.updateState({ loading: true, error: null });

    // Mock login - in real app, send to server
    return new Observable<AuthResponse>(observer => {
      setTimeout(() => {
        const user = this.mockUsers.find(u => 
          u.email === credentials.email && 
          credentials.password === 'password123' // Mock password
        );

        if (user) {
          const response: AuthResponse = {
            user: { ...user, lastLogin: new Date() },
            token: 'mock-user-token-' + Date.now(),
            expiresIn: 3600
          };
          
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.updateState({
            currentUser: response.user,
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
      currentUser: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  getUserFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  getUserInitials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  }
} 