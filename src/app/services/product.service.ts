import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Product, ProductFilter } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'api/products'; // در آینده به backend متصل می‌شود

  // داده‌های نمونه برای تست
  private mockProducts: Product[] = [
    {
      id: '1',
      name: 'لگو آموزشی ریاضی',
      description: 'اسباب بازی آموزشی برای یادگیری ریاضی کودکان 6-10 سال',
      price: 250000,
      originalPrice: 300000,
      images: ['assets/images/lego-math.jpg'],
      category: 'آموزشی',
      ageRange: { min: 6, max: 10 },
      gender: 'unisex',
      skills: ['ریاضی', 'منطق', 'خلاقیت'],
      brand: 'لگو',
      stock: 15,
      rating: 4.5,
      reviews: [],
      tags: ['آموزشی', 'ریاضی', 'لگو'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'عروسک باربی',
      description: 'عروسک زیبای باربی برای دختران 3-8 سال',
      price: 180000,
      images: ['assets/images/barbie.jpg'],
      category: 'عروسک',
      ageRange: { min: 3, max: 8 },
      gender: 'female',
      skills: ['تخیل', 'اجتماعی'],
      brand: 'باربی',
      stock: 25,
      rating: 4.2,
      reviews: [],
      tags: ['عروسک', 'دخترانه', 'باربی'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
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
      gender: 'male',
      skills: ['هماهنگی', 'سرعت', 'کنترل'],
      brand: 'هوایی',
      stock: 8,
      rating: 4.7,
      reviews: [],
      tags: ['ماشین', 'کنترلی', 'پسرانه'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor(private http: HttpClient) {}

  getProducts(filter?: ProductFilter): Observable<Product[]> {
    // فعلاً از داده‌های نمونه استفاده می‌کنیم
    let filteredProducts = [...this.mockProducts];

    if (filter) {
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      if (filter.category) {
        filteredProducts = filteredProducts.filter(product =>
          product.category === filter.category
        );
      }

      if (filter.minPrice) {
        filteredProducts = filteredProducts.filter(product =>
          product.price >= filter.minPrice!
        );
      }

      if (filter.maxPrice) {
        filteredProducts = filteredProducts.filter(product =>
          product.price <= filter.maxPrice!
        );
      }

      if (filter.gender) {
        filteredProducts = filteredProducts.filter(product =>
          product.gender === filter.gender || product.gender === 'unisex'
        );
      }

      if (filter.minRating) {
        filteredProducts = filteredProducts.filter(product =>
          product.rating >= filter.minRating!
        );
      }
    }

    return of(filteredProducts);
  }

  getProductById(id: string): Observable<Product | undefined> {
    const product = this.mockProducts.find(p => p.id === id);
    return of(product);
  }

  getCategories(): Observable<string[]> {
    const categories = [...new Set(this.mockProducts.map(p => p.category))];
    return of(categories);
  }

  getBrands(): Observable<string[]> {
    const brands = [...new Set(this.mockProducts.map(p => p.brand))];
    return of(brands);
  }

  getSkills(): Observable<string[]> {
    const allSkills = this.mockProducts.flatMap(p => p.skills);
    const skills = [...new Set(allSkills)];
    return of(skills);
  }
} 