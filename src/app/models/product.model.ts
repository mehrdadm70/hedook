export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  ageRange: {
    min: number;
    max: number;
  };
  gender: 'male' | 'female' | 'unisex';
  skills: string[]; // مهارت‌هایی که تقویت می‌کند
  brand: string;
  stock: number;
  rating: number;
  reviews: Review[];
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ProductFilter {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  ageRange?: {
    min: number;
    max: number;
  };
  gender?: 'male' | 'female' | 'unisex';
  skills?: string[];
  brand?: string;
  minRating?: number;
  sortBy?: 'price' | 'rating' | 'name' | 'newest';
  sortOrder?: 'asc' | 'desc';
} 