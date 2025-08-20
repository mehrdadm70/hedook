import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { Products, ProductData, ProductCreateRequest, ProductUpdateRequest, ProductFilters } from '../models/products.model';
import { ApiResponse } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly httpService = inject(HttpService);
  private readonly baseUrl = '/admin/products';

  /**
   * دریافت همه محصولات
   */
  getAllProducts(filters?: ProductFilters): Observable<ApiResponse<ProductData>> {
    const params = this.buildQueryParams(filters);
    return this.httpService.get<ProductData>(`${this.baseUrl}`, { params });
  }

  /**
   * دریافت محصول بر اساس ID
   */
  getProductById(id: string): Observable<ApiResponse<Products>> {
    return this.httpService.get<Products>(`${this.baseUrl}/${id}`);
  }

  /**
   * ایجاد محصول جدید
   */
  createProduct(productData: ProductCreateRequest): Observable<ApiResponse<Products>> {
    return this.httpService.post<Products>(`${this.baseUrl}`, productData);
  }

  /**
   * به‌روزرسانی محصول
   */
  updateProduct(id: number, productData: ProductUpdateRequest): Observable<ApiResponse<Products>> {
    return this.httpService.put<Products>(`${this.baseUrl}/${id}`, productData);
  }

  /**
   * حذف محصول
   */
  deleteProduct(id: number): Observable<ApiResponse<boolean>> {
    return this.httpService.delete<boolean>(`${this.baseUrl}/${id}`);
  }

  /**
   * فعال/غیرفعال کردن محصول
   */
  toggleProductStatus(id: number, isActive: boolean): Observable<ApiResponse<Products>> {
    return this.httpService.patch<Products>(`${this.baseUrl}/${id}/status`, { isActive });
  }

  /**
   * جستجو در محصولات
   */
  searchProducts(query: string): Observable<ApiResponse<ProductData>> {
    return this.httpService.get<ProductData>(`${this.baseUrl}/search`, { 
      params: { q: query } 
    });
  }

  /**
   * دریافت محصولات بر اساس دسته‌بندی
   */
  getProductsByCategory(categoryId: number): Observable<ApiResponse<ProductData>> {
    return this.httpService.get<ProductData>(`${this.baseUrl}/category/${categoryId}`);
  }

  /**
   * دریافت محصولات فعال
   */
  getActiveProducts(): Observable<ApiResponse<ProductData>> {
    return this.httpService.get<ProductData>(`${this.baseUrl}/active`);
  }

  /**
   * آپلود تصویر محصول
   */
  uploadProductImage(productId: number, imageFile: File): Observable<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.httpService.post<{ imageUrl: string }>(`${this.baseUrl}/${productId}/image`, formData);
  }

  /**
   * حذف تصویر محصول
   */
  deleteProductImage(productId: number, imageUrl: string): Observable<ApiResponse<boolean>> {
    return this.httpService.delete<boolean>(`${this.baseUrl}/${productId}/image`, {
      body: { imageUrl }
    });
  }

  /**
   * دریافت آمار محصولات
   */
  getProductsStats(): Observable<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    byCategory: { [key: number]: number };
  }>> {
    return this.httpService.get(`${this.baseUrl}/stats`);
  }

  /**
   * دریافت محصولات پیشنهادی
   */
  getRecommendedProducts(productId: number, limit: number = 5): Observable<ApiResponse<Products[]>> {
    return this.httpService.get<Products[]>(`${this.baseUrl}/${productId}/recommendations`, {
      params: { limit }
    });
  }

  /**
   * ساخت query parameters برای فیلترها
   */
  private buildQueryParams(filters?: ProductFilters): any {
    if (!filters) return {};

    const params: any = {};

    if (filters.search) params.search = filters.search;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;
    if (filters.gender) params.gender = filters.gender;
    if (filters.brand) params.brand = filters.brand;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    if (filters.priceRange) {
      if (filters.priceRange.min !== undefined) params.minPrice = filters.priceRange.min;
      if (filters.priceRange.max !== undefined) params.maxPrice = filters.priceRange.max;
    }

    if (filters.ageRange) {
      if (filters.ageRange.min !== undefined) params.minAge = filters.ageRange.min;
      if (filters.ageRange.max !== undefined) params.maxAge = filters.ageRange.max;
    }

    return params;
  }
}
