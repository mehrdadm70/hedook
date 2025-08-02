import { Component, input, output, inject, computed } from '@angular/core';
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
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);

  readonly product = input.required<Product>();
  readonly showAddToCart = input<boolean>(true);
  readonly compact = input<boolean>(false);

  readonly addToCartClick = output<Product>();
  readonly productClick = output<Product>();

  readonly hasDiscount = computed(() => {
    const product = this.product();
    return !!(product.originalPrice && product.originalPrice > product.price);
  });

  readonly discountPercentage = computed(() => {
    const product = this.product();
    if (!this.hasDiscount()) return 0;
    
    return Math.round(
      ((product.originalPrice! - product.price) / product.originalPrice!) * 100
    );
  });

  readonly formattedPrice = computed(() => 
    this.formatPrice(this.product().price)
  );

  readonly formattedOriginalPrice = computed(() => {
    const originalPrice = this.product().originalPrice;
    return originalPrice ? this.formatPrice(originalPrice) : null;
  });

  readonly ratingStars = computed(() => 
    Array.from({ length: 5 }, (_, i) => ({
      index: i + 1,
      filled: i + 1 <= this.product().rating,
      half: false // Could be extended for half stars
    }))
  );

  readonly isOutOfStock = computed(() => this.product().stock <= 0);

  readonly isInCart = computed(() => 
    this.cartService.isInCart(this.product().id)
  );

  readonly cartQuantity = computed(() => 
    this.cartService.getItemQuantity(this.product().id)
  );

  readonly primaryImage = computed(() => {
    const images = this.product().images;
    return images.length > 0 ? images[0] : '/assets/images/placeholder.jpg';
  });

  readonly ageRangeText = computed(() => {
    const { min, max } = this.product().ageRange;
    return min === max ? `${min} سال` : `${min}-${max} سال`;
  });

  onAddToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    const product = this.product();
    
    if (this.isOutOfStock()) {
      return;
    }

    try {
      this.cartService.addToCart(product, 1);
      this.addToCartClick.emit(product);
    } catch (error: unknown) {
      console.error('خطا در اضافه کردن به سبد خرید:', error);
    }
  }

  onProductClick(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const product = this.product();
    this.productClick.emit(product);
    this.router.navigate(['/products', product.id]);
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }
}
