import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject, combineLatest } from 'rxjs';
import { map, catchError, shareReplay, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

import { Product, ProductFilter, CreateProductDto, UpdateProductDto, ProductGender } from '../models/product.model';

interface ProductServiceState {
  readonly products: ReadonlyArray<Product>;
  readonly loading: boolean;
  readonly error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/products';

  private readonly state = signal<ProductServiceState>({
    products: [],
    loading: false,
    error: null
  });

  private readonly filterSubject = new BehaviorSubject<ProductFilter>({});

  readonly products = computed(() => this.state().products);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  private readonly mockProducts: ReadonlyArray<Product> = [
    {
      id: '1',
      name: 'لگو آموزشی ریاضی',
      description: 'اسباب بازی آموزشی برای یادگیری ریاضی کودکان 6-10 سال',
      price: 250000,
      originalPrice: 300000,
      images: ['assets/images/lego-math.jpg'],
      category: 'آموزشی',
      ageRange: { min: 6, max: 10 },
      gender: 'unisex' as ProductGender,
      skills: ['ریاضی', 'منطق', 'خلاقیت'],
      brand: 'لگو',
      stock: 15,
      rating: 4.5,
      reviews: [],
      tags: ['آموزشی', 'ریاضی', 'لگو'],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'عروسک باربی',
      description: 'عروسک زیبای باربی برای دختران 3-8 سال',
      price: 180000,
      images: ['assets/images/barbie.jpg'],
      category: 'عروسک',
      ageRange: { min: 3, max: 8 },
      gender: 'female' as ProductGender,
      skills: ['تخیل', 'اجتماعی'],
      brand: 'باربی',
      stock: 25,
      rating: 4.2,
      reviews: [],
      tags: ['عروسک', 'دخترانه', 'باربی'],
      isActive: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    },
    {
      id: '3',
      name: 'ماشین کنترلی',
      description: 'ماشین کنترلی سریع برای پسران 5-12 سال',
      price: 320000,
      originalPrice: 380000,
      images: ['assets/images/rc-car.jpg'],
      category: 'ماشین کنترلی',
      ageRange: { min: 5, max: 12 },
      gender: 'male' as ProductGender,
      skills: ['هماهنگی', 'سرعت', 'کنترل'],
      brand: 'هوایی',
      stock: 8,
      rating: 4.7,
      reviews: [],
      tags: ['ماشین', 'کنترلی', 'پسرانه'],
      isActive: true,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03')
    }
  ];

  readonly filteredProducts = toSignal(
    combineLatest([
      of(this.mockProducts),
      this.filterSubject.asObservable()
    ]).pipe(
      map(([products, filter]) => this.applyFilter(products, filter)),
      startWith([]),
      shareReplay(1)
    ),
    { initialValue: [] }
  );

  readonly categories = computed(() => 
    [...new Set(this.products().map(product => product.category))]
  );

  readonly brands = computed(() => 
    [...new Set(this.products().map(product => product.brand))]
  );

  readonly skills = computed(() => 
    [...new Set(this.products().flatMap(product => product.skills))]
  );

  constructor() {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.updateState({ loading: true, error: null });
    
    // Simulate API call with mock data
    setTimeout(() => {
      this.updateState({
        products: this.mockProducts,
        loading: false,
        error: null
      });
    }, 500);
  }

  private updateState(partial: Partial<ProductServiceState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  private applyFilter(products: ReadonlyArray<Product>, filter: ProductFilter): ReadonlyArray<Product> {
    let filtered = [...products];

    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filter.category) {
      filtered = filtered.filter(product => product.category === filter.category);
    }

    if (filter.minPrice !== undefined) {
      filtered = filtered.filter(product => product.price >= filter.minPrice!);
    }

    if (filter.maxPrice !== undefined) {
      filtered = filtered.filter(product => product.price <= filter.maxPrice!);
    }

    if (filter.gender && filter.gender !== 'unisex') {
      filtered = filtered.filter(product => 
        product.gender === filter.gender || product.gender === 'unisex'
      );
    }

    if (filter.minRating !== undefined) {
      filtered = filtered.filter(product => product.rating >= filter.minRating!);
    }

    if (filter.ageRange) {
      filtered = filtered.filter(product =>
        product.ageRange.max >= filter.ageRange!.min &&
        product.ageRange.min <= filter.ageRange!.max
      );
    }

    if (filter.skills && filter.skills.length > 0) {
      filtered = filtered.filter(product =>
        filter.skills!.some(skill => product.skills.includes(skill))
      );
    }

    if (filter.brand) {
      filtered = filtered.filter(product => product.brand === filter.brand);
    }

    // Apply sorting
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        const order = filter.sortOrder === 'desc' ? -1 : 1;
        
        switch (filter.sortBy) {
          case 'price':
            return (a.price - b.price) * order;
          case 'rating':
            return (a.rating - b.rating) * order;
          case 'name':
            return a.name.localeCompare(b.name, 'fa') * order;
          case 'newest':
            return (a.createdAt.getTime() - b.createdAt.getTime()) * order;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }

  setFilter(filter: ProductFilter): void {
    this.filterSubject.next(filter);
  }

  getProductById(id: string): Observable<Product | null> {
    const product = this.mockProducts.find(p => p.id === id) ?? null;
    return of(product).pipe(
      catchError(this.handleError<Product | null>('getProductById', null))
    );
  }

  createProduct(productDto: CreateProductDto): Observable<Product> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  updateProduct(productDto: UpdateProductDto): Observable<Product> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  deleteProduct(id: string): Observable<void> {
    return throwError(() => new Error('Not implemented - will be connected to backend'));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      let errorMessage = 'خطایی رخ داده است';
      
      if (error.error instanceof ErrorEvent) {
        errorMessage = `خطا: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 404:
            errorMessage = 'محصول مورد نظر یافت نشد';
            break;
          case 500:
            errorMessage = 'خطای سرور';
            break;
          default:
            errorMessage = `خطا ${error.status}: ${error.message}`;
        }
      }

      this.updateState({ error: errorMessage, loading: false });
      return of(result as T);
    };
  }
} 