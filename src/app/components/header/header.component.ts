import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-header',
    imports: [
        CommonModule,
        FormsModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatBadgeModule,
        MatMenuModule
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  searchQuery: string = '';
  cartItemCount: number = 0;

  constructor(
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.cartService.getCartItemCount().subscribe(count => {
      this.cartItemCount = count;
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchQuery.trim() }
      });
    }
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}