export interface ProductData {
    items: Products[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface Products {
    id: number;
    name: string;
    description: string;
    price?: number;
    originalPrice?: number;
    images?: string;
    categoryId?: number;
    categoryName?: string;
    ageRangeMin?: number;
    ageRangeMax?: number;
    gender?: string;
    brand?: string;
    rating?: number;
    interests?: string | string[];   // برای پوشش هر دو حالت
    growthGoals?: string | string[]; // برای پوشش هر دو حالت
    parentingStyle?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}


export interface ProductCreateRequest {
    name: string;
    description: string;
    price?: number;
    originalPrice?: number;
    images?: string;
    categoryId?: number;
    ageRangeMin?: number;
    ageRangeMax?: number;
    gender?: string;
    brand?: string;
    interests?: string;
    growthGoals?: string;
    parentingStyle?: string;
    isActive?: boolean;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
    id: number;
}

export interface ProductFilters {
    search?: string;
    categoryId?: number;
    isActive?: boolean;
    priceRange?: { min?: number; max?: number };
    ageRange?: { min?: number; max?: number };
    gender?: string;
    brand?: string;
    page?: number;
    limit?: number;
}

export interface ProductsState {
    products: Products[];
    filteredProducts: Products[];
    loading: boolean;
    error: string | null;
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
    pagination: {
        currentPage: number;
        totalPages: number;
        nextPage: number | null;
        previousPage: number | null;
    };
}

