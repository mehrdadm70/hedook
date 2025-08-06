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
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { User, UserRole, UserStats } from '../../../models/user-management.model';
import { AdminService } from '../../services/admin.service';
import { UserFormDialogComponent } from '../../components/user-form-dialog/user-form-dialog.component';

interface UsersState {
  readonly users: ReadonlyArray<User>;
  readonly filteredUsers: ReadonlyArray<User>;
  readonly stats: UserStats | null;
  readonly loading: boolean;
  readonly error: string | null;
}

@Component({
  selector: 'app-admin-users',
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
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  private readonly state = signal<UsersState>({
    users: [],
    filteredUsers: [],
    stats: null,
    loading: true,
    error: null
  });

  readonly users = computed(() => this.state().users);
  readonly filteredUsers = computed(() => this.state().filteredUsers);
  readonly stats = computed(() => this.state().stats);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly hasUsers = computed(() => this.users().length > 0);
  readonly hasFilteredUsers = computed(() => this.filteredUsers().length > 0);

  // Table configuration
  readonly displayedColumns = [
    'avatar',
    'name',
    'email',
    'role',
    'status',
    'orders',
    'totalSpent',
    'lastLogin',
    'createdAt',
    'actions'
  ];

  // Filter options
  readonly searchTerm = signal('');
  readonly selectedRole = signal('');
  readonly selectedStatus = signal('');

  readonly roleOptions = [
    { value: '', label: 'همه نقش‌ها' },
    { value: UserRole.CUSTOMER, label: 'مشتری' },
    { value: UserRole.VIP_CUSTOMER, label: 'مشتری VIP' },
    { value: UserRole.MODERATOR, label: 'مدیر' },
    { value: UserRole.ADMIN, label: 'ادمین' }
  ];

  readonly statusOptions = [
    { value: '', label: 'همه وضعیت‌ها' },
    { value: 'true', label: 'فعال' },
    { value: 'false', label: 'غیرفعال' }
  ];

  // Expose enums for template
  readonly UserRole = UserRole;

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
  }

  private loadUsers(): void {
    this.updateState({ loading: true, error: null });

    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.updateState({
          users,
          filteredUsers: users,
          loading: false,
          error: null
        });
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.updateState({
          users: [],
          filteredUsers: [],
          loading: false,
          error: error?.message || 'خطا در بارگذاری کاربران'
        });
      }
    });
  }

  private loadStats(): void {
    this.adminService.getUserStats().subscribe({
      next: (stats) => {
        this.updateState({ stats });
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
      }
    });
  }

  applyFilters(): void {
    const searchTerm = this.searchTerm().toLowerCase();
    const selectedRole = this.selectedRole();
    const selectedStatus = this.selectedStatus();
    
    let filtered = [...this.users()];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.phone && user.phone.includes(searchTerm))
      );
    }
    
    // Role filter
    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    // Status filter
    if (selectedStatus) {
      const isActive = selectedStatus === 'true';
      filtered = filtered.filter(user => user.isActive === isActive);
    }
    
    this.updateState({ filteredUsers: filtered });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedRole.set('');
    this.selectedStatus.set('');
    this.updateState({ filteredUsers: this.users() });
  }

  createUser(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      data: { users: this.users() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.createUser(result).subscribe({
          next: (newUser) => {
            const updatedUsers = [...this.users(), newUser];
            this.updateState({
              users: updatedUsers,
              filteredUsers: updatedUsers
            });

            this.snackBar.open('کاربر با موفقیت ایجاد شد', 'بستن', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });

            // Reload stats
            this.loadStats();
          },
          error: (error) => {
            this.snackBar.open(error.message || 'خطا در ایجاد کاربر', 'بستن', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      data: { 
        user,
        users: this.users().filter(u => u.id !== user.id)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.updateUser({ id: user.id, ...result }).subscribe({
          next: (updatedUser) => {
            const updatedUsers = this.users().map(u =>
              u.id === user.id ? updatedUser : u
            );

            this.updateState({
              users: updatedUsers,
              filteredUsers: updatedUsers
            });

            this.snackBar.open('کاربر با موفقیت به‌روزرسانی شد', 'بستن', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          },
          error: (error) => {
            this.snackBar.open(error.message || 'خطا در به‌روزرسانی کاربر', 'بستن', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`آیا از حذف کاربر "${user.firstName} ${user.lastName}" اطمینان دارید؟`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          const updatedUsers = this.users().filter(u => u.id !== user.id);
          this.updateState({
            users: updatedUsers,
            filteredUsers: updatedUsers
          });

          this.snackBar.open('کاربر با موفقیت حذف شد', 'بستن', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });

          // Reload stats
          this.loadStats();
        },
        error: (error) => {
          this.snackBar.open(error.message || 'خطا در حذف کاربر', 'بستن', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case UserRole.CUSTOMER: return 'مشتری';
      case UserRole.VIP_CUSTOMER: return 'مشتری VIP';
      case UserRole.MODERATOR: return 'مدیر';
      case UserRole.ADMIN: return 'ادمین';
      default: return role;
    }
  }

  getRoleColor(role: UserRole): string {
    switch (role) {
      case UserRole.CUSTOMER: return 'primary';
      case UserRole.VIP_CUSTOMER: return 'accent';
      case UserRole.MODERATOR: return 'warn';
      case UserRole.ADMIN: return 'warn';
      default: return 'primary';
    }
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'فعال' : 'غیرفعال';
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  getUserFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  getUserAvatar(user: User): string {
    return user.avatar || 'assets/images/avatars/default-avatar.jpg';
  }

  retryLoad(): void {
    this.loadUsers();
    this.loadStats();
  }

  private updateState(partial: Partial<UsersState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }
} 