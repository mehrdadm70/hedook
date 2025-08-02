import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly cartItems = computed(() => this.cartService.items());
  readonly totalPrice = computed(() => this.cartService.totalPrice());
  readonly totalItems = computed(() => this.cartService.totalItems());
  readonly isEmpty = computed(() => this.cartService.isEmpty());
  readonly itemsWithSubtotal = computed(() => this.cartService.itemsWithSubtotal());
  readonly cartError = computed(() => this.cartService.error());

  readonly displayedColumns = ['product', 'quantity', 'price', 'subtotal', 'actions'];

  removeItem(productId: string): void {
    try {
      this.cartService.removeFromCart(productId);
      console.log('محصول از سبد خرید حذف شد');
    } catch (error: unknown) {
      console.error('خطا در حذف محصول:', error);
    }
  }

  updateQuantity(productId: string, quantity: any): void {
    try {
      const qty = typeof quantity === 'number' ? quantity : Number(quantity?.target?.value || quantity);
      if (qty < 1) return;
      
      this.cartService.updateQuantity(productId, qty);
    } catch (error: unknown) {
      console.error('خطا در بروزرسانی تعداد:', error);
    }
  }

  clearCart(): void {
    try {
      this.cartService.clearCart();
      console.log('سبد خرید خالی شد');
    } catch (error: unknown) {
      console.error('خطا در خالی کردن سبد خرید:', error);
    }
  }

  clearError(): void {
    this.cartService.clearError();
  }

  goToCheckout(): void {
    if (this.isEmpty()) {
      console.log('سبد خرید خالی است');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  getItemQuantity(productId: string): number {
    return this.cartService.getItemQuantity(productId);
  }
}
