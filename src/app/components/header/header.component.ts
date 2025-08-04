import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';

import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatMenuModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);

  readonly searchQuery = signal<string>('');
  
  readonly cartItemCount = computed(() => this.cartService.totalItems());
  readonly hasItemsInCart = computed(() => this.cartItemCount() > 0);

  readonly searchPlaceholder = 'نام اسباب بازی، مهارت یا برند';
  readonly searchLabel = 'جستجوی اسباب بازی...';

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/products'], {
        queryParams: { search: query }
      });
      this.searchQuery.set(''); // Clear search after navigation
    }
  }

  onSearchKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}