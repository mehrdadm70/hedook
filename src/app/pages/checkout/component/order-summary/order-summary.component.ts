import { Component, inject, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

import { CartService, CartItem } from '../../../../services/cart.service';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
  description: string;
}

interface PackagingOption {
  id: string;
  name: string;
  price: number;
  icon: string;
  description: string;
  giftDesigns?: GiftDesign[];
}

interface GiftDesign {
  id: string;
  name: string;
  image: string;
  price: number;
}

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss'
})
export class OrderSummaryComponent {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  // Inputs
  readonly selectedShipping = input<ShippingOption | null | undefined>(null);
  readonly selectedPackaging = input<PackagingOption | null | undefined>(null);
  readonly selectedGiftDesign = input<GiftDesign | null | undefined>(null);
  readonly isGift = input<boolean>(false);
  readonly giftMessage = input<string>('');

  // Outputs
  readonly goToCartClick = output<void>();

  // Cart data
  readonly cartItems = computed(() => this.cartService.items());
  readonly totalPrice = computed(() => this.cartService.totalPrice());
  readonly totalItems = computed(() => this.cartService.totalItems());

  // Computed values
  readonly shippingCost = computed(() => {
    const shipping = this.selectedShipping();
    const packaging = this.selectedPackaging();
    const giftDesign = this.selectedGiftDesign();
    return (shipping?.price || 0) + (packaging?.price || 0) + (giftDesign?.price || 0);
  });

  readonly finalTotal = computed(() => {
    return this.totalPrice() + this.shippingCost();
  });

  readonly estimatedDelivery = computed(() => {
    const shipping = this.selectedShipping();
    if (!shipping) return '';
    
    const days = shipping.estimatedDays;
    if (days === 0) return 'همان روز';
    if (days === 1) return 'فردا';
    return `${days} روز کاری`;
  });

  // Utility methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  onGoToCart(): void {
    this.goToCartClick.emit();
  }
}
