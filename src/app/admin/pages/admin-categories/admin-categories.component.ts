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

import { Category, CategoryUpdateRequest } from '../../models/categories.model';
import { AdminService } from '../../services/admin.service';
import { CategoriesPresenter } from '../../presenters/categories.presenter';
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
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss'
})
export class AdminCategoriesComponent implements OnInit {
  private readonly categoriesPresenter = inject(CategoriesPresenter);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  // استفاده از presenter برای state management
  readonly categories = this.categoriesPresenter.categories;
  readonly filteredCategories = this.categoriesPresenter.filteredCategories;
  readonly loading = this.categoriesPresenter.loading;
  readonly error = this.categoriesPresenter.error;
  readonly stats = this.categoriesPresenter.stats;

  readonly hasCategories = this.categoriesPresenter.hasCategories;
  readonly hasFilteredCategories = this.categoriesPresenter.hasFilteredCategories;

  // Computed filtered categories
  readonly computedFilteredCategories = computed(() => {
    const categories = this.categories();
    const searchTerm = this.searchTerm().toLowerCase();
    const selectedStatus = this.selectedStatus();
    const selectedLevel = this.selectedLevel();
    
    let filtered = [...categories];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm) ||
        (category.slug && category.slug.toLowerCase().includes(searchTerm))
      );
    }
    
    // Status filter
    if (selectedStatus) {
      const isActive = selectedStatus === '1';
      filtered = filtered.filter(category => category.isActive === isActive);
    }
    
    // Level filter
    if (selectedLevel) {
      if (selectedLevel === '0') {
        // سطح اصلی - دسته‌بندی‌هایی که parentId ندارند
        filtered = filtered.filter(category => !category.parentId);
      } else if (selectedLevel === '1') {
        // زیرمجموعه - دسته‌بندی‌هایی که parentId دارند
        filtered = filtered.filter(category => category.parentId !== null && category.parentId !== undefined);
      }
    }
    
    return filtered;
  });

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
    { value: '1', label: 'فعال' },
    { value: '0', label: 'غیرفعال' }
  ];

  readonly levelOptions = [
    { value: '0', label: 'سطح اصلی' },
    { value: '1', label: 'زیرمجموعه' }
  ];


  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoriesPresenter.loadCategories().subscribe();
  }


  createCategory(): void {
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { categories: this.categories() },
      hasBackdrop: true,
      disableClose: false,
      autoFocus: true,
      panelClass: 'admin-dialog-panel'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.categoriesPresenter.createCategory(result).subscribe({
          next: (newCategory) => {
            const updatedCategories = [...this.categories(), newCategory];
      
            this.snackBar.open('دسته‌بندی با موفقیت ایجاد شد', 'بستن', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          },
          error: (error) => {
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


  deleteCategory(id:number){
    this.categoriesPresenter.deleteCategory(id).subscribe()
  }

  updateCategory(id: number, categoryData: CategoryUpdateRequest){
    this.categoriesPresenter.findCategory(id).subscribe(
      (category :any ) => {
        const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
          width: '600px',
          maxWidth: '90vw',
          data: { category: category },
          hasBackdrop: true,
          disableClose: false,
          autoFocus: true,
          panelClass: 'admin-dialog-panel'
        });
    
        dialogRef.afterClosed().subscribe((result: any) => {
          if (result) {
            this.categoriesPresenter.updateCategory(id , result).subscribe({
              next: (newCategory) => {
                const updatedCategories = [...this.categories(), newCategory];
          
                this.snackBar.open('دسته‌بندی با موفقیت ویرایش شد', 'بستن', {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top'
                });
              },
              error: (error) => {
                this.snackBar.open(error.message || 'خطا در ویرایش دسته‌بندی', 'بستن', {
                  duration: 5000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top'
                });
              }
            });
          }
        });
      }
     )
  

  }

  
  findCategory(id: number){
    
  }



  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('');
    this.selectedLevel.set('');
  }

  onStatusChange(event: any): void {
    this.selectedStatus.set(event.value);
  }

  onLevelChange(event: any): void {
    this.selectedLevel.set(event.value);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  }
} 