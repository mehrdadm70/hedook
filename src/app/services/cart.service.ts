import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    // بارگذاری سبد خرید از localStorage
    this.loadCartFromStorage();
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  getCartTotal(): Observable<number> {
    return new Observable(observer => {
      this.cartItems.subscribe(items => {
        const total = items.reduce((sum, item) => 
          sum + (item.product.price * item.quantity), 0);
        observer.next(total);
      });
    });
  }

  getCartItemCount(): Observable<number> {
    return new Observable(observer => {
      this.cartItems.subscribe(items => {
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        observer.next(count);
      });
    });
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      this.updateCart([...currentItems]);
    } else {
      this.updateCart([...currentItems, { product, quantity }]);
    }
  }

  removeFromCart(productId: string): void {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(item => item.product.id !== productId);
    this.updateCart(updatedItems);
  }

  updateQuantity(productId: string, quantity: number): void {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: Math.max(0, quantity) }
        : item
    ).filter(item => item.quantity > 0);
    
    this.updateCart(updatedItems);
  }

  clearCart(): void {
    this.updateCart([]);
  }

  private updateCart(items: CartItem[]): void {
    this.cartItems.next(items);
    this.saveCartToStorage(items);
  }

  private saveCartToStorage(items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
  }

  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        this.cartItems.next(items);
      } catch (error) {
        console.error('خطا در بارگذاری سبد خرید:', error);
        this.cartItems.next([]);
      }
    }
  }
} 