import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Product } from '../../../models/product.model';
import { ProductFormComponent } from '../../../components/product-form/product-form.component';

@Component({
  selector: 'app-admin-product-create',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ProductFormComponent
  ],
  templateUrl: './admin-product-create.component.html',
  styleUrl: './admin-product-create.component.scss'
})
export class AdminProductCreateComponent {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  onProductSaved(product: Product): void {
    this.snackBar.open('محصول با موفقیت ایجاد شد', 'بستن', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    
    // Navigate back to products list
    this.router.navigate(['/admin/products']);
  }

  onCancelled(): void {
    this.router.navigate(['/admin/products']);
  }
} 