import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AdminService } from '../../services/admin.service';
import { AdminLoginDto } from '../../models/admin.model';

interface LoginState {
  readonly loading: boolean;
  readonly error: string | null;
}

@Component({
  selector: 'app-admin-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  private readonly state = signal<LoginState>({
    loading: false,
    error: null
  });

  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly hidePassword = signal(true);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['admin@hedook.com', [Validators.required, Validators.email]],
    password: ['admin123', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    // Redirect if already authenticated
    if (this.adminService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  get isFormValid(): boolean {
    return this.loginForm.valid;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const credentials: AdminLoginDto = this.loginForm.value;
    this.updateState({ loading: true, error: null });

    this.adminService.login(credentials).subscribe({
      next: (response) => {
        this.updateState({ loading: false, error: null });
        this.snackBar.open('ورود موفقیت‌آمیز بود', 'بستن', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.router.navigate(['/admin/dashboard']);
      },
      error: (error) => {
        console.error('خطا در ورود:', error);
        this.updateState({
          loading: false,
          error: 'ایمیل یا رمز عبور اشتباه است'
        });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(hidden => !hidden);
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  goToMainSite(): void {
    this.router.navigate(['/']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  private updateState(partial: Partial<LoginState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} الزامی است`;
    }
    
    if (field?.hasError('email')) {
      return 'فرمت ایمیل صحیح نیست';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `رمز عبور باید حداقل ${minLength} کاراکتر باشد`;
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    switch (fieldName) {
      case 'email': return 'ایمیل';
      case 'password': return 'رمز عبور';
      default: return fieldName;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}