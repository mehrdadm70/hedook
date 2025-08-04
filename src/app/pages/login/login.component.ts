import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService, LoginDto } from '../../services/auth.service';

interface LoginState {
  readonly loading: boolean;
  readonly error: string | null;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
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
    email: ['ali@example.com', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
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

    const credentials: LoginDto = this.loginForm.value;
    this.updateState({ loading: true, error: null });

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.updateState({ loading: false, error: null });
        this.snackBar.open('ورود موفقیت‌آمیز بود', 'بستن', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.router.navigate(['/']);
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
    this.authService.clearError();
    this.updateState({ error: null });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  private updateState(partial: Partial<LoginState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'این فیلد الزامی است';
    }
    if (field.errors['email']) {
      return 'ایمیل معتبر وارد کنید';
    }
    if (field.errors['minlength']) {
      return `حداقل ${field.errors['minlength'].requiredLength} کاراکتر وارد کنید`;
    }

    return 'مقدار نامعتبر';
  }
} 