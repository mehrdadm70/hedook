import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AuthService, RegisterDto } from '../../services/auth.service';

interface RegisterState {
  readonly loading: boolean;
  readonly error: string | null;
}

@Component({
  selector: 'app-register',
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
    MatDividerModule,
    MatCheckboxModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  private readonly state = signal<RegisterState>({
    loading: false,
    error: null
  });

  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);
  readonly acceptTerms = signal(false);

  readonly registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^09\d{9}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  constructor() {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  get isFormValid(): boolean {
    return this.registerForm.valid && this.acceptTerms();
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid || !this.acceptTerms()) {
      this.markFormGroupTouched();
      return;
    }

    const registerData: RegisterDto = {
      ...this.registerForm.value,
      confirmPassword: this.registerForm.get('confirmPassword')?.value
    };

    this.updateState({ loading: true, error: null });

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.updateState({ loading: false, error: null });
        this.snackBar.open('ثبت نام موفقیت‌آمیز بود', 'بستن', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('خطا در ثبت نام:', error);
        this.updateState({
          loading: false,
          error: error.message || 'خطا در ثبت نام'
        });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(hidden => !hidden);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(hidden => !hidden);
  }

  toggleAcceptTerms(): void {
    this.acceptTerms.update(accepted => !accepted);
  }

  clearError(): void {
    this.authService.clearError();
    this.updateState({ error: null });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  private updateState(partial: Partial<RegisterState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
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
    if (field.errors['pattern']) {
      return 'شماره تلفن معتبر وارد کنید (مثال: 09123456789)';
    }

    return 'مقدار نامعتبر';
  }

  getPasswordError(): string {
    const password = this.registerForm.get('password');
    const confirmPassword = this.registerForm.get('confirmPassword');
    
    if (this.registerForm.errors?.['passwordMismatch'] && confirmPassword?.touched) {
      return 'رمز عبور و تکرار آن مطابقت ندارند';
    }
    
    return this.getFieldError('password');
  }

  getConfirmPasswordError(): string {
    const password = this.registerForm.get('password');
    const confirmPassword = this.registerForm.get('confirmPassword');
    
    if (this.registerForm.errors?.['passwordMismatch'] && confirmPassword?.touched) {
      return 'رمز عبور و تکرار آن مطابقت ندارند';
    }
    
    return this.getFieldError('confirmPassword');
  }
} 