import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { ProductsService } from '../services/products.service';
import { Products, ProductData, ProductCreateRequest, ProductUpdateRequest, ProductFilters, ProductsState } from '../models/products.model';
import { ApiResponse } from '../services/http.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsPresenter {
  private readonly productsService = inject(ProductsService);

  // State management
  private readonly state = signal<ProductsState>({
    products: [],
    filteredProducts: [],
    loading: false,
    error: null,
    stats: { total: 0, active: 0, inactive: 0 },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      nextPage: null,
      previousPage: null
    }
  });

  // Computed values
  readonly products = computed(() => this.state().products);
  readonly filteredProducts = computed(() => this.state().filteredProducts);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly stats = computed(() => this.state().stats);
  readonly pagination = computed(() => this.state().pagination);

  readonly hasProducts = computed(() => this.products().length > 0);
  readonly hasFilteredProducts = computed(() => this.filteredProducts().length > 0);

  /**
   * بارگذاری همه محصولات
   */
  loadProducts(filters?: ProductFilters): Observable<Products[]> {
    this.updateState({ loading: true, error: null });

    return this.productsService.getAllProducts(filters).pipe(
      map(response => {
        if (response.data) {
          console.log(response.data);
          const productData = response.data as ProductData;
          const products = productData.items || [];
          console.log(products);

          this.updateState({
            products,
            filteredProducts: products,
            loading: false,
            error: null,
            stats: this.calculateStats(products),
            pagination: {
              currentPage: productData.page || 1,
              totalPages: productData.totalPages || 1,
              nextPage: productData.hasNextPage ? 1 : null,
              previousPage: productData.hasPreviousPage ? 1 : null
            }
          });
          return products;
        } else {
          this.updateState({
            products: [],
            filteredProducts: [],
            loading: false,
            error: response.message || 'خطا در بارگذاری محصولات',
            stats: { total: 0, active: 0, inactive: 0 },
            pagination: { currentPage: 1, totalPages: 1, nextPage: null, previousPage: null }
          });
          return [];
        }
      }),
      catchError(error => {
        console.error('Error loading products:', error);
        this.updateState({
          products: [],
          filteredProducts: [],
          loading: false,
          error: error?.message || 'خطا در بارگذاری محصولات',
          stats: { total: 0, active: 0, inactive: 0 },
          pagination: { currentPage: 1, totalPages: 1, nextPage: null, previousPage: null }
        });
        return of([]);
      })
    );
  }

  /**
   * دریافت محصول بر اساس ID
   */
  getProductById(id: string): Observable<Products | null> {
    return this.productsService.getProductById(id).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data as Products;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error getting product by ID:', error);
        return of(null);
      })
    );
  }

  /**
   * ایجاد محصول جدید
   */
  createProduct(productData: ProductCreateRequest): Observable<Products | null> {
    return this.productsService.createProduct(productData).pipe(
      map(response => {
        if (response.success && response.data) {
          const newProduct = response.data as Products;
          const updatedProducts = [...this.products(), newProduct];
          this.updateState({
            products: updatedProducts,
            filteredProducts: updatedProducts,
            stats: this.calculateStats(updatedProducts)
          });
          return newProduct;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error creating product:', error);
        throw error;
      })
    );
  }

  /**
   * به‌روزرسانی محصول
   */
  updateProduct(id: number, productData: ProductUpdateRequest): Observable<Products | null> {
    return this.productsService.updateProduct(id, productData).pipe(
      map(response => {
        if (response.success && response.data) {
          const updatedProduct = response.data as Products;
          const updatedProducts = this.products().map(prod =>
            prod.id === id ? updatedProduct : prod
          );
          this.updateState({
            products: updatedProducts,
            filteredProducts: updatedProducts,
            stats: this.calculateStats(updatedProducts)
          });
          return updatedProduct;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error updating product:', error);
        throw error;
      })
    );
  }

  /**
   * حذف محصول
   */
  deleteProduct(id: number): Observable<boolean> {
    return this.productsService.deleteProduct(id).pipe(
      map(response => {
        if (response.success) {
          const updatedProducts = this.products().filter(prod => prod.id !== id);
          this.updateState({
            products: updatedProducts,
            filteredProducts: updatedProducts,
            stats: this.calculateStats(updatedProducts)
          });
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Error deleting product:', error);
        throw error;
      })
    );
  }

  /**
   * فعال/غیرفعال کردن محصول
   */
  toggleProductStatus(id: number, isActive: boolean): Observable<Products | null> {
    return this.productsService.toggleProductStatus(id, isActive).pipe(
      map(response => {
        if (response.success && response.data) {
          const updatedProduct = response.data as Products;
          const updatedProducts = this.products().map(prod =>
            prod.id === id ? updatedProduct : prod
          );
          this.updateState({
            products: updatedProducts,
            filteredProducts: updatedProducts,
            stats: this.calculateStats(updatedProducts)
          });
          return updatedProduct;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error toggling product status:', error);
        throw error;
      })
    );
  }

  /**
   * جستجو در محصولات
   */
  searchProducts(query: string): Observable<Products[]> {
    if (!query.trim()) {
      this.updateState({ filteredProducts: this.products() });
      return of(this.products());
    }

    return this.productsService.searchProducts(query).pipe(
      map(response => {
        if (response.success && response.data) {
          const productData = response.data as ProductData;
          const products = productData.items || [];
          this.updateState({ filteredProducts: products });
          return products;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error searching products:', error);
        return of([]);
      })
    ) as Observable<Products[]>;
  }

  /**
   * فیلتر کردن محصولات
   */
  filterProducts(filters: {
    search?: string;
    categoryId?: number;
    isActive?: boolean;
    priceRange?: { min?: number; max?: number };
    ageRange?: { min?: number; max?: number };
    gender?: string;
    brand?: string;
  }): void {
    let filtered = [...this.products()];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (filters.categoryId) {
      filtered = filtered.filter(product => product.categoryId === filters.categoryId);
    }

    // Status filter
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(product => product.isActive === filters.isActive);
    }

    // Price range filter
    if (filters.priceRange) {
      if (filters.priceRange.min !== undefined) {
        filtered = filtered.filter(product => 
          product.price && product.price >= filters.priceRange!.min!
        );
      }
      if (filters.priceRange.max !== undefined) {
        filtered = filtered.filter(product => 
          product.price && product.price <= filters.priceRange!.max!
        );
      }
    }

    // Age range filter
    if (filters.ageRange) {
      if (filters.ageRange.min !== undefined) {
        filtered = filtered.filter(product => 
          product.ageRangeMin && product.ageRangeMin >= filters.ageRange!.min!
        );
      }
      if (filters.ageRange.max !== undefined) {
        filtered = filtered.filter(product => 
          product.ageRangeMax && product.ageRangeMax <= filters.ageRange!.max!
        );
      }
    }

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter(product => 
        product.gender && product.gender.toLowerCase() === filters.gender!.toLowerCase()
      );
    }

    // Brand filter
    if (filters.brand) {
      const brandTerm = filters.brand.toLowerCase();
      filtered = filtered.filter(product => 
        product.brand && product.brand.toLowerCase().includes(brandTerm)
      );
    }

    this.updateState({ filteredProducts: filtered });
  }

  /**
   * دریافت محصولات بر اساس دسته‌بندی
   */
  getProductsByCategory(categoryId: number): Observable<Products[]> {
    return this.productsService.getProductsByCategory(categoryId).pipe(
      map(response => {
        if (response.success && response.data) {
          const productData = response.data as ProductData;
          return productData.items || [];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error getting products by category:', error);
        return of([]);
      })
    ) as Observable<Products[]>;
  }

  /**
   * دریافت محصولات فعال
   */
  getActiveProducts(): Observable<Products[]> {
    return this.productsService.getActiveProducts().pipe(
      map(response => {
        if (response.success && response.data) {
          const productData = response.data as ProductData;
          return productData.items || [];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error getting active products:', error);
        return of([]);
      })
    ) as Observable<Products[]>;
  }

  /**
   * پاک کردن فیلترها
   */
  clearFilters(): void {
    this.updateState({ filteredProducts: this.products() });
  }

  /**
   * به‌روزرسانی مستقیم فیلترهای محصولات
   */
  updateFilteredProducts(products: Products[]): void {
    this.updateState({ filteredProducts: products });
  }

  /**
   * محاسبه آمار
   */
  private calculateStats(products: Products[]): { total: number; active: number; inactive: number } {
    const total = products.length;
    const active = products.filter(prod => prod.isActive).length;
    const inactive = total - active;

    return { total, active, inactive };
  }

  /**
   * به‌روزرسانی state
   */
  private updateState(partial: Partial<ProductsState>): void {
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
    this.loadProducts();
  }

  /**
   * دریافت محصولات با pagination
   */
  loadProductsWithPagination(page: number, filters?: ProductFilters): Observable<Products[]> {
    const paginationFilters = { ...filters, page };
    return this.loadProducts(paginationFilters);
  }

  /**
   * بررسی وجود محصول
   */
  hasProduct(id: number): boolean {
    return this.products().some(product => product.id === id);
  }

  /**
   * دریافت محصول از state
   */
  getProductFromState(id: number): Products | undefined {
    return this.products().find(product => product.id === id);
  }
}
