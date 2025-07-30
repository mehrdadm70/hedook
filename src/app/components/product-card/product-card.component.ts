import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-product-card',
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatBadgeModule
    ],
    templateUrl: './product-card.component.html',
    styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCartClick = new EventEmitter<Product>();

  constructor(
    private router: Router,
    private cartService: CartService
  ) {}

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(this.product);
    this.addToCartClick.emit(this.product);
  }

  onProductClick(): void {
    this.router.navigate(['/products', this.product.id]);
  }

  getDiscountPercentage(): number {
    if (this.product.originalPrice && this.product.originalPrice > this.product.price) {
      return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
    }
    return 0;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  getRatingStars(): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  isStarFilled(starNumber: number): boolean {
    return starNumber <= this.product.rating;
  }
}
