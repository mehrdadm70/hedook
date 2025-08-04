import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';

interface EditProductState {
  readonly product: Product | null;
  readonly loading: boolean;
  readonly error: string | null;
}

@Component({
  selector: 'app-admin-product-edit',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ProductFormComponent
  ],
  templateUrl: './admin-product-edit.component.html',
  styleUrl: './admin-product-edit.component.scss'
})
export class AdminProductEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly state = signal<EditProductState>({
    product: null,
    loading: true,
    error: null
  });

  readonly product = computed(() => this.state().product);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  ngOnInit(): void {
    this.loadProduct();
  }

  private loadProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    
    if (!productId) {
      this.updateState({ 
        loading: false, 
        error: 'شناسه محصول یافت نشد' 
      });
      return;
    }

    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        if (product) {
          this.updateState({ 
            product, 
            loading: false, 
            error: null 
          });
        } else {
          this.updateState({ 
            loading: false, 
            error: 'محصول مورد نظر یافت نشد' 
          });
        }
      },
      error: (error) => {
        this.updateState({ 
          loading: false, 
          error: error.message || 'خطا در بارگذاری محصول' 
        });
      }
    });
  }

  onProductSaved(product: Product): void {
    this.snackBar.open('محصول با موفقیت ویرایش شد', 'بستن', {
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

  retryLoad(): void {
    this.updateState({ loading: true, error: null });
    this.loadProduct();
  }

  private updateState(partial: Partial<EditProductState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }
} 