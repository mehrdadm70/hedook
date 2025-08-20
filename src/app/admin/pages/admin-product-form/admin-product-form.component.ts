import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Products } from '../../models/products.model';
import { ProductsPresenter } from '../../presenters/products.presenter';
import { ProductFormComponent } from '../../components/product-form/product-form.component';

interface ProductFormState {
  readonly product: Products | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly isEditMode: boolean;
}

@Component({
  selector: 'app-admin-product-form',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ProductFormComponent
  ],
  templateUrl: './admin-product-form.component.html',
  styleUrl: './admin-product-form.component.scss'
})
export class AdminProductFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsPresenter = inject(ProductsPresenter);
  private readonly snackBar = inject(MatSnackBar);

  private readonly state = signal<ProductFormState>({
    product: null,
    loading: false,
    error: null,
    isEditMode: false
  });

  readonly product = computed(() => this.state().product);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly isEditMode = computed(() => this.state().isEditMode);
  readonly pageTitle = computed(() => 
    this.isEditMode() ? 'ویرایش محصول' : 'ایجاد محصول جدید'
  );

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    const isEditMode = !!productId;

    this.updateState({ isEditMode });

    if (isEditMode) {
      this.loadProduct(productId!);
    }
  }

  private loadProduct(productId: string): void {
    this.updateState({ loading: true, error: null });

    this.productsPresenter.getProductById(productId).subscribe({
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
      error: (error: any) => {
        this.updateState({ 
          loading: false, 
          error: error.message || 'خطا در بارگذاری محصول' 
        });
      }
    });
  }

  onProductSaved(product: Products): void {
    const message = this.isEditMode() 
      ? 'محصول با موفقیت ویرایش شد' 
      : 'محصول با موفقیت ایجاد شد';
    
    this.snackBar.open(message, 'بستن', {
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
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  private updateState(partial: Partial<ProductFormState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }
}
