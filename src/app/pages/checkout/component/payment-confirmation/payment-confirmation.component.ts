import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

interface OrderDetails {
  orderId: string;
  recipientName: string;
  deliveryAddress: string;
  deliveryMethod: string;
  estimatedDelivery: string;
  totalAmount: number;
}

interface PaymentResult {
  success: boolean;
  orderDetails?: OrderDetails;
  errorMessage?: string;
  transactionId?: string;
}

@Component({
  selector: 'app-payment-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './payment-confirmation.component.html',
  styleUrl: './payment-confirmation.component.scss'
})
export class PaymentConfirmationComponent {
  private readonly router = inject(Router);

  // Inputs
  readonly paymentResult = input.required<PaymentResult>();

  // Outputs
  readonly trackOrder = output<string>();
  readonly retryPayment = output<string>();
  readonly backToShop = output<void>();

  // Computed values
  readonly isSuccess = computed(() => this.paymentResult().success);
  readonly isFailure = computed(() => !this.paymentResult().success);

  readonly orderDetails = computed(() => this.paymentResult().orderDetails);
  readonly errorMessage = computed(() => this.paymentResult().errorMessage);
  readonly transactionId = computed(() => this.paymentResult().transactionId);

  // Event handlers
  onTrackOrder(): void {
    const orderId = this.orderDetails()?.orderId;
    if (orderId) {
      this.trackOrder.emit(orderId);
    }
  }

  onRetryPayment(): void {
    const orderId = this.orderDetails()?.orderId;
    if (orderId) {
      this.retryPayment.emit(orderId);
    }
  }

  onBackToShop(): void {
    this.backToShop.emit();
    this.router.navigate(['/products']);
  }

  // Utility methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  formatOrderId(orderId: string): string {
    // Add Persian number formatting if needed
    return orderId;
  }
}
