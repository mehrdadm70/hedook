import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';

import { User, CreateUserDto, UserRole } from '../../../models/user-management.model';

export interface UserFormDialogData {
  user?: User;
  users: User[];
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrl: './user-form-dialog.component.scss'
})
export class UserFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly user = this.data?.user;
  readonly users = this.data?.users || [];
  readonly isEditMode = !!this.user;

  userForm: FormGroup;

  readonly roleOptions = [
    { value: UserRole.CUSTOMER, label: 'مشتری' },
    { value: UserRole.VIP_CUSTOMER, label: 'مشتری VIP' },
    { value: UserRole.MODERATOR, label: 'مدیر' },
    { value: UserRole.ADMIN, label: 'ادمین' }
  ];

  constructor() {
    console.log('UserFormDialogComponent constructor called');
    console.log('data:', this.data);
    console.log('user:', this.user);
    console.log('users:', this.users);
    
    this.userForm = this.fb.group({
      firstName: [this.user?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [this.user?.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      phone: [this.user?.phone || ''],
      password: [this.user?.password || '', [Validators.required, Validators.minLength(6)]],
      role: [this.user?.role || UserRole.CUSTOMER, [Validators.required]],
      isActive: [this.user?.isActive ?? true]
    });

    // If in edit mode, make password optional
    if (this.isEditMode) {
      this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  get isFormValid(): boolean {
    return this.userForm.valid;
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'به‌روزرسانی' : 'ایجاد';
  }

  onSubmit(): void {
    console.log('onSubmit called');
    console.log('form valid:', this.userForm.valid);
    console.log('form value:', this.userForm.value);
    
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      
      // Remove empty values
      const userData: CreateUserDto = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        ...(formValue.phone && { phone: formValue.phone }),
        password: formValue.password,
        role: formValue.role,
        isActive: formValue.isActive
      };

      console.log('closing dialog with data:', userData);
      this.dialogRef.close(userData);
    } else {
      console.log('form is invalid');
      this.snackBar.open('لطفاً تمام فیلدهای اجباری را پر کنید', 'بستن', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 