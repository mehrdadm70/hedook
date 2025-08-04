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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { Category, CategoryStatus } from '../../models/category.model';
import { AdminService } from '../../services/admin.service';
import { CategoryFormDialogComponent } from '../../components/category-form-dialog/category-form-dialog.component';

interface CategoriesState {
  readonly categories: ReadonlyArray<Category>;
  readonly filteredCategories: ReadonlyArray<Category>;
  readonly loading: boolean;
  readonly error: string | null;
}

@Component({
  selector: 'app-admin-categories',
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
    MatDialogModule,
    MatSnackBarModule,
    CategoryFormDialogComponent
  ],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss'
})
export class AdminCategoriesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  private readonly state = signal<CategoriesState>({
    categories: [],
    filteredCategories: [],
    loading: true,
    error: null
  });

  readonly categories = computed(() => this.state().categories);
  readonly filteredCategories = computed(() => this.state().filteredCategories);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly hasCategories = computed(() => this.categories().length > 0);
  readonly hasFilteredCategories = computed(() => this.filteredCategories().length > 0);

  // Table configuration
  readonly displayedColumns = [
    'name',
    'description',
    'level',
    'productCount',
    'status',
    'createdAt',
    'actions'
  ];

  // Filter options
  readonly searchTerm = signal('');
  readonly selectedStatus = signal('');
  readonly selectedLevel = signal('');

  readonly statusOptions = [
    { value: '', label: 'همه وضعیت‌ها' },
    { value: 'true', label: 'فعال' },
    { value: 'false', label: 'غیرفعال' }
  ];

  readonly levelOptions = [
    { value: '', label: 'همه سطوح' },
    { value: '0', label: 'سطح اصلی' },
    { value: '1', label: 'زیرمجموعه' }
  ];

  // Expose CategoryStatus for template
  readonly CategoryStatus = CategoryStatus;

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.updateState({ loading: true, error: null });

    this.adminService.getAllCategories().subscribe({
      next: (categories) => {
        this.updateState({
          categories,
          filteredCategories: categories,
          loading: false,
          error: null
        });
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.updateState({
          categories: [],
          filteredCategories: [],
          loading: false,
          error: error?.message || 'خطا در بارگذاری دسته‌بندی‌ها'
        });
      }
    });
  }

  applyFilters(): void {
    const searchTerm = this.searchTerm().toLowerCase();
    const selectedStatus = this.selectedStatus();
    const selectedLevel = this.selectedLevel();
    
    let filtered = [...this.categories()];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(searchTerm) ||
        (category.description && category.description.toLowerCase().includes(searchTerm)) ||
        category.slug.toLowerCase().includes(searchTerm)
      );
    }
    
    // Status filter
    if (selectedStatus) {
      const isActive = selectedStatus === 'true';
      filtered = filtered.filter(category => category.isActive === isActive);
    }
    
    // Level filter
    if (selectedLevel) {
      const level = parseInt(selectedLevel);
      filtered = filtered.filter(category => category.level === level);
    }
    
    this.updateState({ filteredCategories: filtered });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('');
    this.selectedLevel.set('');
    this.updateState({ filteredCategories: this.categories() });
  }

  createCategory(): void {
    console.log('createCategory called');
    console.log('categories:', this.categories());
    
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      data: { categories: this.categories() }
    });

    console.log('dialog opened');

    dialogRef.afterClosed().subscribe(result => {
      console.log('dialog closed with result:', result);
      if (result) {
        console.log('creating category with data:', result);
        this.adminService.createCategory(result).subscribe({
          next: (newCategory) => {
            console.log('category created:', newCategory);
            const updatedCategories = [...this.categories(), newCategory];
            this.updateState({
              categories: updatedCategories,
              filteredCategories: updatedCategories
            });

            this.snackBar.open('دسته‌بندی با موفقیت ایجاد شد', 'بستن', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          },
          error: (error) => {
            console.error('error creating category:', error);
            this.snackBar.open(error.message || 'خطا در ایجاد دسته‌بندی', 'بستن', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }

  editCategory(category: Category): void {
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      data: { 
        category,
        categories: this.categories().filter(c => c.id !== category.id)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.updateCategory({ id: category.id, ...result }).subscribe({
          next: (updatedCategory) => {
            const updatedCategories = this.categories().map(c =>
              c.id === category.id ? updatedCategory : c
            );

            this.updateState({
              categories: updatedCategories,
              filteredCategories: updatedCategories
            });

            this.snackBar.open('دسته‌بندی با موفقیت به‌روزرسانی شد', 'بستن', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          },
          error: (error) => {
            this.snackBar.open(error.message || 'خطا در به‌روزرسانی دسته‌بندی', 'بستن', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }

  deleteCategory(category: Category): void {
    if (confirm(`آیا از حذف دسته‌بندی "${category.name}" اطمینان دارید؟`)) {
      this.adminService.deleteCategory(category.id).subscribe({
        next: () => {
          const updatedCategories = this.categories().filter(c => c.id !== category.id);
          this.updateState({
            categories: updatedCategories,
            filteredCategories: updatedCategories
          });

          this.snackBar.open('دسته‌بندی با موفقیت حذف شد', 'بستن', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        },
        error: (error) => {
          this.snackBar.open(error.message || 'خطا در حذف دسته‌بندی', 'بستن', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'فعال' : 'غیرفعال';
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }

  getLevelLabel(level: number): string {
    return level === 0 ? 'سطح اصلی' : 'زیرمجموعه';
  }

  getParentName(parentId?: string): string {
    if (!parentId) return '-';
    const parent = this.categories().find(c => c.id === parentId);
    return parent ? parent.name : '-';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  retryLoad(): void {
    this.loadCategories();
  }

  private updateState(partial: Partial<CategoriesState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }
} 