import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService, CartItem } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
    selector: 'app-cart',
    imports: [
        CommonModule,
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
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total = 0;

  constructor(
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  calculateTotal(): void {
    this.total = this.cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
    this.snackBar.open('محصول از سبد خرید حذف شد', '', { duration: 2000 });
  }

  updateQuantity(productId: string, quantity: any): void {
    const qty = typeof quantity === 'number' ? quantity : Number(quantity?.target?.value || quantity);
    if (qty < 1) return;
    this.cartService.updateQuantity(productId, qty);
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.snackBar.open('سبد خرید خالی شد', '', { duration: 2000 });
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }
}
