export interface Category {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly slug: string;
  readonly image?: string;
  readonly parentId?: string;
  readonly level: number;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly productCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateCategoryDto {
  readonly name: string;
  readonly description?: string;
  readonly slug?: string;
  readonly image?: string;
  readonly parentId?: string;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface UpdateCategoryDto {
  readonly id: string;
  readonly name?: string;
  readonly description?: string;
  readonly slug?: string;
  readonly image?: string;
  readonly parentId?: string;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface CategoryFilter {
  readonly search?: string;
  readonly parentId?: string;
  readonly isActive?: boolean;
  readonly level?: number;
}

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
} 