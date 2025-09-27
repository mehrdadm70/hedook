import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { PaymentConfirmationComponent } from './payment-confirmation.component';

@Component({
  selector: 'app-payment-confirmation-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    PaymentConfirmationComponent
  ],
  template: `
    <div class="demo-container">
      <h1 class="demo-title">Payment Confirmation Demo</h1>
      
      <mat-tab-group class="demo-tabs">
        
        <!-- Success Tab -->
        <mat-tab label="پرداخت موفق">
          <div class="tab-content">
            <app-payment-confirmation 
              [paymentResult]="successResult()"
              (trackOrder)="onTrackOrder($event)"
              (backToShop)="onBackToShop()">
            </app-payment-confirmation>
          </div>
        </mat-tab>
        
        <!-- Failure Tab -->
        <mat-tab label="پرداخت ناموفق">
          <div class="tab-content">
            <app-payment-confirmation 
              [paymentResult]="failureResult()"
              (retryPayment)="onRetryPayment($event)"
              (backToShop)="onBackToShop()">
            </app-payment-confirmation>
          </div>
        </mat-tab>
        
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .demo-title {
      text-align: center;
      margin-bottom: 30px;
      color: #1f2937;
      font-family: 'Vazir', sans-serif;
    }
    
    .demo-tabs {
      direction: rtl;
    }
    
    .tab-content {
      padding: 20px 0;
    }
  `]
})
export class PaymentConfirmationDemoComponent {
  
  // Mock data for success state
  readonly successResult = signal({
    success: true,
    orderDetails: {
      orderId: '۱۲۳۴۵۶',
      recipientName: 'علی احمدی',
      deliveryAddress: 'تهران، خیابان ولیعصر، کوچه ۱۵، پلاک ۲۳، طبقه ۳',
      deliveryMethod: 'پست پیشتاز',
      estimatedDelivery: '۳ روز کاری',
      totalAmount: 450000
    }
  });

  // Mock data for failure state
  readonly failureResult = signal({
    success: false,
    errorMessage: 'ممکن است تراکنش لغو شده یا موجودی کافی نباشد.',
    transactionId: 'TXN-789012'
  });

  // Event handlers
  onTrackOrder(orderId: string): void {
    console.log('Track order:', orderId);
    alert(`پیگیری سفارش ${orderId}`);
  }

  onRetryPayment(orderId: string): void {
    console.log('Retry payment for order:', orderId);
    alert(`پرداخت مجدد برای سفارش ${orderId}`);
  }

  onBackToShop(): void {
    console.log('Back to shop');
    alert('بازگشت به فروشگاه');
  }
}
