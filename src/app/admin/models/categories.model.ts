
export interface Category {
    id?: number;
    name: string;
    description?: string;
    slug?: string;
    parent_id?: number | null;
    image_url?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    children?: Category[];
    products_count?: number;
  }
  
  export interface CategoryCreateRequest {
    name: string;
    description?: string;
    parent_id?: number | null;
    image_url?: string;
    is_active?: boolean;
  }
  
  export interface CategoryUpdateRequest {
    name?: string;
    description?: string;
    parent_id?: number | null;
    image_url?: string;
    is_active?: boolean;
  }
  
  export interface CategoryFilters {
    search?: string;
    parent_id?: number | null;
    is_active?: boolean;
    page?: number;
    limit?: number;
    sort_by?: 'name' | 'created_at' | 'products_count';
    sort_order?: 'asc' | 'desc';
  }