import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSnackBar } from '@angular/material/snackbar';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

interface HomeState {
  readonly featuredProducts: ReadonlyArray<Product>;
  readonly categories: ReadonlyArray<string>;
  readonly loading: boolean;
  readonly error: string | null;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ProductCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  private readonly state = signal<HomeState>({
    featuredProducts: [],
    categories: [],
    loading: true,
    error: null
  });

  readonly featuredProducts = computed(() => this.state().featuredProducts);
  readonly categories = computed(() => this.state().categories);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly hasProducts = computed(() => this.featuredProducts().length > 0);
  readonly hasCategories = computed(() => this.categories().length > 0);

  ngOnInit(): void {
    this.loadHomeData();
  }

  private async loadHomeData(): Promise<void> {
    this.updateState({ loading: true, error: null });

    try {
      // Wait for products to load from service
      await new Promise<void>((resolve) => {
        const checkProducts = () => {
          if (!this.productService.loading()) {
            resolve();
          } else {
            setTimeout(checkProducts, 100);
          }
        };
        checkProducts();
      });

      const allProducts = this.productService.products();
      const categories = this.productService.categories();

      this.updateState({
        featuredProducts: this.selectFeaturedProducts(allProducts),
        categories: categories,
        loading: false,
        error: null
      });

    } catch (error: unknown) {
      console.error('خطا در بارگذاری اطلاعات صفحه اصلی:', error);
      this.updateState({
        loading: false,
        error: 'خطا در بارگذاری اطلاعات'
      });
    }
  }

  private selectFeaturedProducts(products: ReadonlyArray<Product>): ReadonlyArray<Product> {
    return products
      .filter(product => product.isActive && product.stock > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }

  private updateState(partial: Partial<HomeState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  onAddToCart(product: Product): void {
    try {
      this.cartService.addToCart(product, 1);
      console.log(`${product.name} به سبد خرید اضافه شد`);
    } catch (error: unknown) {
      console.error('خطا در اضافه کردن به سبد خرید:', error);
    }
  }

  goToProducts(category?: string): void {
    const navigationExtras = category 
      ? { queryParams: { category } }
      : {};
    
    this.router.navigate(['/products'], navigationExtras);
  }

  goToProductDetail(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  retryLoad(): void {
    this.loadHomeData();
  }
}
