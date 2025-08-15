import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError, retry, timeout } from 'rxjs';

export interface ApiResponse {
  data?:any;
  message?: string;
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly baseUrl = 'https://localhost:5001/api';
  private readonly timeoutMs = 30000; // 30 ثانیه timeout
  private readonly retryAttempts = 3;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }


  private createHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  /**
   * GET request
   */
  get(endpoint: string): Observable<ApiResponse> {
    const url = this.buildUrl(endpoint);
    return this.http.get<ApiResponse>(url, { headers: this.createHeaders() })
      .pipe(
        timeout(this.timeoutMs),
        retry(this.retryAttempts),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * POST request
   */
  post(endpoint: string, data: any): Observable<ApiResponse> {
    const url = this.buildUrl(endpoint);
    return this.http.post<ApiResponse>(url, data, { headers: this.createHeaders() })
      .pipe(
        timeout(this.timeoutMs),
        retry(this.retryAttempts),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * PUT request
   */
  put(endpoint: string, data: any): Observable<ApiResponse> {
    const url = this.buildUrl(endpoint);
    return this.http.put<ApiResponse>(url, data, { headers: this.createHeaders() })
      .pipe(
        timeout(this.timeoutMs),
        retry(this.retryAttempts),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * PATCH request
   */
  patch(endpoint: string, data: any): Observable<ApiResponse> {
    const url = this.buildUrl(endpoint);
    return this.http.patch<ApiResponse>(url, data, { headers: this.createHeaders() })
      .pipe(
        timeout(this.timeoutMs),
        retry(this.retryAttempts),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * DELETE request
   */
  delete(endpoint: string): Observable<ApiResponse> {
    const url = this.buildUrl(endpoint);
    return this.http.delete<ApiResponse>(url, { headers: this.createHeaders() })
      .pipe(
        timeout(this.timeoutMs),
        retry(this.retryAttempts),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * ساخت URL کامل
   */
  private buildUrl(endpoint: string): string {
    return endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
  }

  /**
   * مدیریت خطاها
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'خطای ناشناخته رخ داده است';

    if (error.error instanceof ErrorEvent) {
      // خطاهای سمت کلاینت
      errorMessage = `خطای شبکه: ${error.error.message}`;
    } else {
      // خطاهای سمت سرور
      switch (error.status) {
        case 400:
          errorMessage = 'درخواست نامعتبر است';
          break;
        case 401:
          errorMessage = 'احراز هویت ناموفق بود';
          this.handleUnauthorized();
          break;
        case 403:
          errorMessage = 'دسترسی غیرمجاز';
          break;
        case 404:
          errorMessage = 'منبع مورد نظر یافت نشد';
          break;
        case 422:
          errorMessage = 'داده‌های ارسالی نامعتبر است';
          break;
        case 500:
          errorMessage = 'خطای داخلی سرور';
          break;
        case 0:
          errorMessage = 'اتصال به سرور برقرار نشد';
          break;
        default:
          errorMessage = `خطای سرور: ${error.status} - ${error.message}`;
      }
    }

    console.error('HTTP Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * مدیریت خطای 401 (Unauthorized)
   */
  private handleUnauthorized(): void {
    // پاک کردن توکن
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    // ریدایرکت به صفحه لاگین
    this.router.navigate(['/admin/login']);
  }

  /**
   * آپلود فایل
   */
  uploadFile(endpoint: string, file: File): Observable<ApiResponse> {
    const url = this.buildUrl(endpoint);
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getAuthToken()}`
      // Content-Type را برای FormData تنظیم نمی‌کنیم
    });

    return this.http.post<ApiResponse>(url, formData, { headers })
      .pipe(
        timeout(this.timeoutMs),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * درخواست با پارامترهای query
   */
  getWithParams(endpoint: string, params: { [key: string]: string | number | boolean }): Observable<ApiResponse> {
    const url = this.buildUrl(endpoint);
    return this.http.get<ApiResponse>(url, { 
      headers: this.createHeaders(),
      params: params
    })
      .pipe(
        timeout(this.timeoutMs),
        retry(this.retryAttempts),
        catchError(this.handleError.bind(this))
      );
  }
}

