import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { Product, ProductFilter } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

interface ProductsState {
  readonly products: ReadonlyArray<Product>;
  readonly filteredProducts: ReadonlyArray<Product>;
  readonly loading: boolean;
  readonly error: string | null;
  readonly filter: ProductFilter;
}

@Component({
  selector: 'app-admin-products',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss'
})
export class AdminProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private readonly state = signal<ProductsState>({
    products: [],
    filteredProducts: [],
    loading: true,
    error: null,
    filter: {}
  });

  readonly products = computed(() => this.state().products);
  readonly filteredProducts = computed(() => this.state().filteredProducts);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly filter = computed(() => this.state().filter);

  readonly hasProducts = computed(() => this.products().length > 0);
  readonly hasFilteredProducts = computed(() => this.filteredProducts().length > 0);

  // Table configuration
  readonly displayedColumns = [
    'image', 
    'name', 
    'category', 
    'price', 
    'stock', 
    'rating', 
    'status', 
    'actions'
  ];

  // Filter options
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('');
  readonly selectedStatus = signal('');

  readonly categories = computed(() => 
    [...new Set(this.products().map(p => p.category))]
  );

  readonly statusOptions = [
    { value: '', label: 'همه' },
    { value: 'active', label: 'فعال' },
    { value: 'inactive', label: 'غیرفعال' }
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.updateState({ loading: true, error: null });

    // Using the existing product service data
    const products = this.productService.products();
    
    if (products.length > 0) {
      this.updateState({
        products,
        filteredProducts: products,
        loading: false,
        error: null
      });
    } else {
      // Wait for products to load
      setTimeout(() => {
        const loadedProducts = this.productService.products();
        this.updateState({
          products: loadedProducts,
          filteredProducts: loadedProducts,
          loading: false,
          error: loadedProducts.length === 0 ? 'هیچ محصولی یافت نشد' : null
        });
      }, 1000);
    }
  }

  applyFilters(): void {
    const searchQuery = this.searchQuery().toLowerCase().trim();
    const selectedCategory = this.selectedCategory();
    const selectedStatus = this.selectedStatus();

    let filtered = [...this.products()];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        product.brand.toLowerCase().includes(searchQuery)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply status filter
    if (selectedStatus) {
      const isActive = selectedStatus === 'active';
      filtered = filtered.filter(product => product.isActive === isActive);
    }

    this.updateState({ filteredProducts: filtered });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedStatus.set('');
    this.updateState({ filteredProducts: this.products() });
  }

  createProduct(): void {
    this.router.navigate(['/admin/products/create']);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/admin/products/edit', product.id]);
  }

  viewProduct(product: Product): void {
    this.router.navigate(['/admin/products/view', product.id]);
  }

  deleteProduct(product: Product): void {
    // In a real app, show confirmation dialog
    const confirmation = confirm(`آیا از حذف محصول "${product.name}" اطمینان دارید؟`);
    
    if (confirmation) {
      // Mock delete - in real app, call service
      this.snackBar.open('محصول حذف شد', 'بستن', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      
      // Remove from local state
      const updatedProducts = this.products().filter(p => p.id !== product.id);
      this.updateState({ 
        products: updatedProducts,
        filteredProducts: updatedProducts
      });
    }
  }

  toggleProductStatus(product: Product): void {
    // Mock toggle - in real app, call service
    const updatedProducts = this.products().map(p =>
      p.id === product.id 
        ? { ...p, isActive: !p.isActive }
        : p
    );

    this.updateState({ 
      products: updatedProducts,
      filteredProducts: updatedProducts
    });

    const status = !product.isActive ? 'فعال' : 'غیرفعال';
    this.snackBar.open(`محصول ${status} شد`, 'بستن', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('fa-IR').format(num);
  }

  getStockStatus(stock: number): { label: string; color: string } {
    if (stock === 0) {
      return { label: 'ناموجود', color: 'warn' };
    } else if (stock < 10) {
      return { label: 'کم موجود', color: 'accent' };
    } else {
      return { label: 'موجود', color: 'primary' };
    }
  }

  retryLoad(): void {
    this.loadProducts();
  }

  private updateState(partial: Partial<ProductsState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }
}