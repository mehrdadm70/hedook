import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { CategoriesService } from '../services/categories.service';
import { Category, CategoryCreateRequest, CategoryUpdateRequest, CategoryFilters, CategoriesState } from '../models/categories.model';
import { ApiResponse } from '../services/http.service';



@Injectable({
  providedIn: 'root'
})
export class CategoriesPresenter {
  private readonly categoriesService = inject(CategoriesService);

  // State management
  private readonly state = signal<CategoriesState>({
    categories: [],
    filteredCategories: [],
    loading: false,
    error: null,
    stats: { total: 0, active: 0, inactive: 0 }
  });

  // Computed values
  readonly categories = computed(() => this.state().categories);
  readonly filteredCategories = computed(() => this.state().filteredCategories);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly stats = computed(() => this.state().stats);

  readonly hasCategories = computed(() => this.categories().length > 0);
  readonly hasFilteredCategories = computed(() => this.filteredCategories().length > 0);

  /**
   * بارگذاری همه دسته‌بندی‌ها
   */
  loadCategories(filters?: CategoryFilters): Observable<Category[]> {
    this.updateState({ loading: true, error: null });

    return this.categoriesService.getAllCategories(filters).pipe(

      map(response => {
        console.log(response)
        if (response.success && response.data) {
          const categories = response.data as Category[];
          this.updateState({
            categories,
            filteredCategories: categories,
            loading: false,
            error: null,
            stats: this.calculateStats(categories)
          });
          return categories;
        } else {
          this.updateState({
            categories: [],
            filteredCategories: [],
            loading: false,
            error: response.message || 'خطا در بارگذاری دسته‌بندی‌ها',
            stats: { total: 0, active: 0, inactive: 0 }
          });
          return [];
        }
      }),
      catchError(error => {
        console.error('Error loading categories:', error);
        this.updateState({
          categories: [],
          filteredCategories: [],
          loading: false,
          error: error?.message || 'خطا در بارگذاری دسته‌بندی‌ها',
          stats: { total: 0, active: 0, inactive: 0 }
        });
        return of([]);
      })
    );
  }

  /**
   * ایجاد دسته‌بندی جدید
   */
  createCategory(categoryData: CategoryCreateRequest): Observable<Category | null> {
    return this.categoriesService.createCategory(categoryData).pipe(
      map(response => {
        if (response.success && response.data) {
          const newCategory = response.data as Category;
          const updatedCategories = [...this.categories(), newCategory];
          this.updateState({
            categories: updatedCategories,
            filteredCategories: updatedCategories,
            stats: this.calculateStats(updatedCategories)
          });
          return newCategory;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error creating category:', error);
        throw error;
      })
    );
  }

  /**
   * به‌روزرسانی دسته‌بندی
   */
  updateCategory(id: number, categoryData: CategoryUpdateRequest): Observable<Category | null> {
    return this.categoriesService.updateCategory(id, categoryData).pipe(
      map(response => {
        if (response.success && response.data) {
          const updatedCategory = response.data as Category;
          const updatedCategories = this.categories().map(cat =>
            cat.id === id ? updatedCategory : cat
          );
          this.updateState({
            categories: updatedCategories,
            filteredCategories: updatedCategories,
            stats: this.calculateStats(updatedCategories)
          });
          return updatedCategory;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error updating category:', error);
        throw error;
      })
    );
  }

  /**
   * حذف دسته‌بندی
   */
  deleteCategory(id: number): Observable<boolean> {
    return this.categoriesService.deleteCategory(id).pipe(
      map(response => {
        if (response.success) {
          const updatedCategories = this.categories().filter(cat => cat.id !== id);
          this.updateState({
            categories: updatedCategories,
            filteredCategories: updatedCategories,
            stats: this.calculateStats(updatedCategories)
          });
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Error deleting category:', error);
        throw error;
      })
    );
  }

  findCategory(id: number){
    return this.categoriesService.findCategory(id).pipe(
      map(response => {
        if(response.success && response.data){
          const category = response.data as Category;
          return category;
        }
        return null;
      }),
     
    )
  }

  /**
   * فعال/غیرفعال کردن دسته‌بندی
   */
  toggleCategoryStatus(id: number, isActive: boolean): Observable<Category | null> {
    return this.categoriesService.toggleCategoryStatus(id, isActive).pipe(
      map(response => {
        if (response.success && response.data) {
          const updatedCategory = response.data as Category;
          const updatedCategories = this.categories().map(cat =>
            cat.id === id ? updatedCategory : cat
          );
          this.updateState({
            categories: updatedCategories,
            filteredCategories: updatedCategories,
            stats: this.calculateStats(updatedCategories)
          });
          return updatedCategory;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error toggling category status:', error);
        throw error;
      })
    );
  }

  /**
   * جستجو در دسته‌بندی‌ها
   */
  searchCategories(query: string): Observable<Category[]> {
    if (!query.trim()) {
      this.updateState({ filteredCategories: this.categories() });
      return of(this.categories());
    }

    return this.categoriesService.searchCategories(query).pipe(
      map(response => {
        if (response.success && response.data) {
          const categories = response.data as Category[];
          this.updateState({ filteredCategories: categories });
          return categories;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error searching categories:', error);
        return of([]);
      })
    );
  }

  /**
   * فیلتر کردن دسته‌بندی‌ها
   */
  filterCategories(filters: {
    search?: string;
    parentId?: number | null;
    isActive?: boolean;
  }): void {
    let filtered = [...this.categories()];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm) ||
        (category.slug && category.slug.toLowerCase().includes(searchTerm))
      );
    }

    // Parent filter
    if (filters.parentId !== undefined) {
      filtered = filtered.filter(category => category.parentId === filters.parentId);
    }

    // Status filter
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(category => category.isActive === filters.isActive);
    }

    this.updateState({ filteredCategories: filtered });
  }

  /**
   * دریافت دسته‌بندی‌های اصلی
   */
  getMainCategories(): Observable<Category[]> {
    return this.categoriesService.getMainCategories().pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data as Category[];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error getting main categories:', error);
        return of([]);
      })
    );
  }

  /**
   * دریافت درخت دسته‌بندی‌ها
   */
  getCategoryTree(): Observable<Category[]> {
    return this.categoriesService.getCategoryTree().pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data as Category[];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error getting category tree:', error);
        return of([]);
      })
    );
  }

  /**
   * پاک کردن فیلترها
   */
  clearFilters(): void {
    this.updateState({ filteredCategories: this.categories() });
  }

  /**
   * به‌روزرسانی مستقیم فیلترهای دسته‌بندی
   */
  updateFilteredCategories(categories: Category[]): void {
    this.updateState({ filteredCategories: categories });
  }

  /**
   * محاسبه آمار
   */
  private calculateStats(categories: Category[]): { total: number; active: number; inactive: number } {
    const total = categories.length;
    const active = categories.filter(cat => cat.isActive).length;
    const inactive = total - active;

    return { total, active, inactive };
  }

  /**
   * به‌روزرسانی state
   */
  private updateState(partial: Partial<CategoriesState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  /**
   * پاک کردن خطا
   */
  clearError(): void {
    this.updateState({ error: null });
  }

  /**
   * بارگذاری مجدد
   */
  reload(): void {
    this.loadCategories();
  }
}
