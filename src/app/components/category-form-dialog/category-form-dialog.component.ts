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

import { Category, CreateCategoryDto } from '../../models/category.model';

export interface CategoryFormDialogData {
  category?: Category;
  categories: Category[];
}

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
    console.log('CategoryFormDialogComponent constructor called');
    console.log('data:', this.data);
    console.log('category:', this.category);
    console.log('categories:', this.categories);
    
    this.categoryForm = this.fb.group({
      name: [this.category?.name || '', [Validators.required, Validators.minLength(2)]],
      description: [this.category?.description || ''],
      slug: [this.category?.slug || ''],
      image: [this.category?.image || ''],
      parentId: [this.category?.parentId || ''],
      sortOrder: [this.category?.sortOrder || 1, [Validators.required, Validators.min(1)]],
      isActive: [this.category?.isActive ?? true]
    });

    // Auto-generate slug when name changes
    this.categoryForm.get('name')?.valueChanges.subscribe(name => {
      if (name && !this.categoryForm.get('slug')?.value) {
        const slug = this.generateSlug(name);
        this.categoryForm.patchValue({ slug });
      }
    });
  }

  get isFormValid(): boolean {
    return this.categoryForm.valid;
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'به‌روزرسانی' : 'ایجاد';
  }

  get parentCategories(): Category[] {
    return this.categories.filter((cat: Category) => cat.level === 0);
  }

  onSubmit(): void {
    console.log('onSubmit called');
    console.log('form valid:', this.categoryForm.valid);
    console.log('form value:', this.categoryForm.value);
    
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      
      // Remove empty values
      const categoryData: CreateCategoryDto = {
        name: formValue.name,
        ...(formValue.description && { description: formValue.description }),
        ...(formValue.slug && { slug: formValue.slug }),
        ...(formValue.image && { image: formValue.image }),
        ...(formValue.parentId && { parentId: formValue.parentId }),
        sortOrder: formValue.sortOrder,
        isActive: formValue.isActive
      };

      console.log('closing dialog with data:', categoryData);
      this.dialogRef.close(categoryData);
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

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
} 