import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService, ApiResponse } from './http.service';
import { Category, CategoryCreateRequest, CategoryUpdateRequest, CategoryFilters } from '../models/categories.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private readonly baseEndpoint = '/categories';

  constructor(private httpService: HttpService) { }

  /**
   * دریافت لیست همه دسته‌بندی‌ها
   */
  getAllCategories(filters?: CategoryFilters): Observable<ApiResponse> {
    const params: any = {};
    
    if (filters) {
      if (filters.search) params.search = filters.search;
      if (filters.parent_id !== undefined) params.parent_id = filters.parent_id;
      if (filters.is_active !== undefined) params.is_active = filters.is_active;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.sort_order) params.sort_order = filters.sort_order;
    }

    return this.httpService.getWithParams(this.baseEndpoint, params);
  }

  /**
   * دریافت دسته‌بندی‌های اصلی (بدون parent)
   */
  getMainCategories(): Observable<ApiResponse> {
    return this.httpService.getWithParams(this.baseEndpoint, {
      parent_id: 0,  // TODO: fix this
      is_active: true
    });
  }


  /**
   * ایجاد دسته‌بندی جدید
   */
  createCategory(categoryData: CategoryCreateRequest): Observable<ApiResponse> {
    return this.httpService.post(this.baseEndpoint, categoryData);
  }

  /**
   * به‌روزرسانی دسته‌بندی
   */
  updateCategory(id: number, categoryData: CategoryUpdateRequest): Observable<ApiResponse> {
    return this.httpService.put(`${this.baseEndpoint}/${id}`, categoryData);
  }

  /**
   * حذف دسته‌بندی
   */
  deleteCategory(id: number): Observable<ApiResponse> {
    return this.httpService.delete(`${this.baseEndpoint}/${id}`);
  }

  findCategory(id: number):Observable<ApiResponse> {
    return this.httpService.get(`${this.baseEndpoint}/${id}`)
  }

  /**
   * فعال/غیرفعال کردن دسته‌بندی
   */
  toggleCategoryStatus(id: number, isActive: boolean): Observable<ApiResponse> {
    return this.httpService.patch(`${this.baseEndpoint}/${id}/status`, {
      is_active: isActive
    });
  }

  /**
   * دریافت درخت دسته‌بندی‌ها (با زیردسته‌ها)
   */
  getCategoryTree(): Observable<ApiResponse> {
    return this.httpService.get(`${this.baseEndpoint}/tree`);
  }

  /**
   * جستجو در دسته‌بندی‌ها
   */
  searchCategories(query: string): Observable<ApiResponse> {
    return this.httpService.getWithParams(`${this.baseEndpoint}/search`, {
      q: query,
      limit: 10
    });
  }

}
