export interface Category {
    id?: number;
    name: string;
    slug?: string;
    parentId?: number | null;
    parentName: string;
    isActive?: boolean;
    sortOrder?: number;
    children?: Category[];
    productsCount?: number;
    createdAt?: string;
    updatedAt?: string;
  }
  export interface CategoryCreateRequest {
    name: string;
    slug: string;
    parentId?: number | null;
    level?: number;
    sortOrder?: number;
    isActive?: boolean |number;
  }
  
  export interface CategoryUpdateRequest {
    name?: string;
    slug?: string;
    parentId?: number | null;
    level?: number;
    sortOrder?: number;
    isActive?: boolean;
  }
  
  export interface CategoryFilters {
    search?: string;
    parentId?: number | null;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sort_by?: 'name' | 'created_at' | 'products_count';
    sort_order?: 'asc' | 'desc';
  }

  export interface CategoriesState {
    readonly categories: Category[];
    readonly filteredCategories: Category[];
    readonly loading: boolean;
    readonly error: string | null;
    readonly stats: {
      total: number;
      active: number;
      inactive: number;
    };
  }