import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {
  readonly product: Product;
  readonly quantity: number;
}

interface CartState {
  readonly items: ReadonlyArray<CartItem>;
  readonly loading: boolean;
  readonly error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'hedook_cart';

  private readonly state = signal<CartState>({
    items: [],
    loading: false,
    error: null
  });

  readonly items = computed(() => this.state().items);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  
  readonly totalPrice = computed(() => 
    this.items().reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  );
  
  readonly totalItems = computed(() => 
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );
  
  readonly isEmpty = computed(() => this.items().length === 0);

  readonly itemsWithSubtotal = computed(() => 
    this.items().map(item => ({
      ...item,
      subtotal: item.product.price * item.quantity
    }))
  );

  constructor() {
    this.loadCartFromStorage();
    
    // Auto-save to localStorage when cart changes
    effect(() => {
      const items = this.items();
      this.saveCartToStorage(items);
    });
  }

  addToCart(product: Product, quantity: number = 1): void {
    if (quantity <= 0) {
      this.updateState({ error: 'تعداد باید بیشتر از صفر باشد' });
      return;
    }

    if (product.stock < quantity) {
      this.updateState({ error: 'موجودی کافی نیست' });
      return;
    }

    const currentItems = this.items();
    const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);

    let updatedItems: ReadonlyArray<CartItem>;

    if (existingItemIndex >= 0) {
      const existingItem = currentItems[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > product.stock) {
        this.updateState({ error: 'تعداد درخواستی بیش از موجودی است' });
        return;
      }

      updatedItems = currentItems.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, quantity: newQuantity }
          : item
      );
    } else {
      updatedItems = [...currentItems, { product, quantity }];
    }

    this.updateState({ 
      items: updatedItems, 
      error: null 
    });
  }

  removeFromCart(productId: string): void {
    const updatedItems = this.items().filter(item => item.product.id !== productId);
    this.updateState({ 
      items: updatedItems, 
      error: null 
    });
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 0) {
      this.updateState({ error: 'تعداد نمی‌تواند منفی باشد' });
      return;
    }

    if (quantity === 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.items();
    const item = currentItems.find(item => item.product.id === productId);
    
    if (!item) {
      this.updateState({ error: 'محصول در سبد خرید یافت نشد' });
      return;
    }

    if (quantity > item.product.stock) {
      this.updateState({ error: 'تعداد درخواستی بیش از موجودی است' });
      return;
    }

    const updatedItems = currentItems.map(cartItem => 
      cartItem.product.id === productId 
        ? { ...cartItem, quantity }
        : cartItem
    );
    
    this.updateState({ 
      items: updatedItems, 
      error: null 
    });
  }

  clearCart(): void {
    this.updateState({ 
      items: [], 
      error: null 
    });
  }

  getItemQuantity(productId: string): number {
    const item = this.items().find(item => item.product.id === productId);
    return item?.quantity ?? 0;
  }

  isInCart(productId: string): boolean {
    return this.items().some(item => item.product.id === productId);
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  private updateState(partial: Partial<CartState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  private saveCartToStorage(items: ReadonlyArray<CartItem>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('خطا در ذخیره سبد خرید:', error);
      this.updateState({ error: 'خطا در ذخیره سبد خرید' });
    }
  }

  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem(this.STORAGE_KEY);
      if (savedCart) {
        const items = JSON.parse(savedCart) as CartItem[];
        // Validate the loaded data
        const validItems = items.filter(item => 
          item.product && 
          item.product.id && 
          typeof item.quantity === 'number' && 
          item.quantity > 0
        );
        
        this.updateState({ 
          items: validItems, 
          loading: false, 
          error: null 
        });
      }
    } catch (error) {
      console.error('خطا در بارگذاری سبد خرید:', error);
      this.updateState({ 
        items: [], 
        loading: false, 
        error: 'خطا در بارگذاری سبد خرید' 
      });
    }
  }
} 