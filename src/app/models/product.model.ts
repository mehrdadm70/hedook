export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly originalPrice?: number;
  readonly images: ReadonlyArray<string>;
  readonly category: string;
  readonly ageRange: Readonly<{
    min: number;
    max: number;
  }>;
  readonly gender: ProductGender;
  readonly skills: ReadonlyArray<string>;
  readonly brand: string;
  readonly stock: number;
  readonly rating: number;
  readonly reviews: ReadonlyArray<Review>;
  readonly tags: ReadonlyArray<string>;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface Review {
  readonly id: string;
  readonly userId: string;
  readonly userName: string;
  readonly rating: number;
  readonly comment: string;
  readonly createdAt: Date;
}

export type ProductGender = 'male' | 'female' | 'unisex';

export type SortBy = 'price' | 'rating' | 'name' | 'newest';
export type SortOrder = 'asc' | 'desc';

export interface ProductFilter {
  readonly search?: string;
  readonly category?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly ageRange?: Readonly<{
    min: number;
    max: number;
  }>;
  readonly gender?: ProductGender;
  readonly skills?: ReadonlyArray<string>;
  readonly brand?: string;
  readonly minRating?: number;
  readonly sortBy?: SortBy;
  readonly sortOrder?: SortOrder;
}

export interface CreateProductDto {
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly originalPrice?: number;
  readonly images: ReadonlyArray<string>;
  readonly category: string;
  readonly ageRange: Readonly<{
    min: number;
    max: number;
  }>;
  readonly gender: ProductGender;
  readonly skills: ReadonlyArray<string>;
  readonly brand: string;
  readonly stock: number;
  readonly tags: ReadonlyArray<string>;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  readonly id: string;
} 