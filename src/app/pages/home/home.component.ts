import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

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
  featuredProducts: Product[] = [];
  categories: string[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
  }

  loadFeaturedProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.featuredProducts = products.slice(0, 8); // نمایش 8 محصول ویژه
      this.loading = false;
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  onAddToCart(product: Product): void {
    console.log('محصول به سبد خرید اضافه شد:', product.name);
  }

  goToProducts(category?: string): void {
    if (category) {
      this.router.navigate(['/products'], { queryParams: { category } });
    } else {
      this.router.navigate(['/products']);
    }
  }

  goToProductDetail(productId: string): void {
    this.router.navigate(['/products', productId]);
  }
}
