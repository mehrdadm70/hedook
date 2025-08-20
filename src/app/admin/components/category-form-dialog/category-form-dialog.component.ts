import { Component, Inject, inject } from '@angular/core';
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
import { CategoryCreateRequest } from '@app/admin/models/categories.model';

@Component({
  selector: 'app-category-form-dialog',
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
  templateUrl: './category-form-dialog.component.html',
  styleUrl: './category-form-dialog.component.scss'
})
export class CategoryFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CategoryFormDialogComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly category = this.data?.category;
  readonly categories = this.data?.categories || [];
  readonly isEditMode = !!this.category;

  categoryForm: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      name: [this.category?.name || '', [Validators.required, Validators.minLength(2)]],
      slug: [this.category?.slug || '', [Validators.required]],
      parentId: [this.category?.parentId || null],
      sortOrder: [this.category?.sortOrder || 1, [Validators.required, Validators.min(1)]],
      isActive: [this.category?.isActive ?? 1]
    });

  }

  get isFormValid(): boolean {
    return this.categoryForm.valid;
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'به‌روزرسانی' : 'ایجاد';
  }

  get parentCategories() {
    return this.categories.filter((cat:any) => cat.level === 0);
  }

  onSubmit(): void {
    
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      
      // Remove empty values
      const categoryData: CategoryCreateRequest = {
          name: formValue.name,
          slug: formValue.slug,
          parentId: formValue.parentId,
          sortOrder: formValue.sortOrder,
          isActive: formValue.isActive == 'true' ? 1 : 0 
      };

      this.dialogRef.close(categoryData);
    } else {
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