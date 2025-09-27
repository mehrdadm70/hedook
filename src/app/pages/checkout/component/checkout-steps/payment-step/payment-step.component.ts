import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface PaymentGateway {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-payment-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payment-step.component.html',
  styleUrl: './payment-step.component.scss'
})
export class PaymentStepComponent {
  // Inputs
  readonly paymentForm = input.required<FormGroup>();
  readonly loading = input<boolean>(false);
  readonly isCreatingAccount = input<boolean>(false);

  // Outputs
  readonly submitOrder = output<void>();

  // Payment gateways
  readonly paymentGateways: PaymentGateway[] = [
    {
      id: 'zarinpal',
      name: 'زرین‌پال',
      icon: '💳',
      description: 'پرداخت امن و سریع'
    },
    {
      id: 'mellat',
      name: 'بانک ملت',
      icon: '🏦',
      description: 'درگاه بانک ملت'
    }
  ];

  // Computed values
  readonly isFormValid = computed(() => {
    return this.paymentForm().valid;
  });

  // Event handlers
  onSubmitOrder(): void {
    if (this.isFormValid()) {
      this.submitOrder.emit();
    }
  }

  // Utility methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm().get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.paymentForm().get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'این فیلد الزامی است';
    }
    if (field.errors['requiredTrue']) {
      return 'لطفاً قوانین و مقررات را بپذیرید';
    }

    return 'مقدار نامعتبر';
  }
}
