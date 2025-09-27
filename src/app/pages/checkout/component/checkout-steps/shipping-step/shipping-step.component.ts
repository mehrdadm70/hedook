import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
  description: string;
}

interface PackagingOption {
  id: string;
  name: string;
  price: number;
  icon: string;
  description: string;
  giftDesigns?: GiftDesign[];
}

interface GiftDesign {
  id: string;
  name: string;
  image: string;
  price: number;
}

@Component({
  selector: 'app-shipping-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatDividerModule
  ],
  templateUrl: './shipping-step.component.html',
  styleUrl: './shipping-step.component.scss'
})
export class ShippingStepComponent {
  // Inputs
  readonly shippingForm = input.required<FormGroup>();
  readonly selectedShipping = input<ShippingOption | null>(null);
  readonly selectedPackaging = input<PackagingOption | null>(null);
  readonly selectedGiftDesign = input<GiftDesign | null>(null);

  // Outputs
  readonly giftDesignSelect = output<string>();
  readonly giftMessageChange = output<string>();

  // Shipping options
  readonly shippingOptions: ShippingOption[] = [
    {
      id: 'post_express',
      name: 'پست پیشتاز',
      price: 15000,
      estimatedDays: 3,
      description: 'ارسال سریع و امن'
    },
    {
      id: 'courier',
      name: 'پیک (فقط اصفهان)',
      price: 8000,
      estimatedDays: 1,
      description: 'تحویل در همان روز'
    },
    {
      id: 'pickup',
      name: 'حضوری',
      price: 0,
      estimatedDays: 0,
      description: 'مراجعه به فروشگاه'
    }
  ];

  // Packaging options
  readonly packagingOptions: PackagingOption[] = [
    {
      id: 'simple',
      name: 'بسته‌بندی ساده',
      price: 0,
      icon: '📦',
      description: 'بسته‌بندی معمولی'
    },
    {
      id: 'gift',
      name: 'بسته‌بندی کادویی',
      price: 25000,
      icon: '🎁',
      description: 'بسته‌بندی کادویی با کارت تبریک',
      giftDesigns: [
        {
          id: 'design1',
          name: 'طرح کلاسیک',
          image: 'https://via.placeholder.com/100x100/FF6B6B/FFFFFF?text=🎁',
          price: 0
        },
        {
          id: 'design2',
          name: 'طرح مدرن',
          image: 'https://via.placeholder.com/100x100/4ECDC4/FFFFFF?text=🎁',
          price: 5000
        },
        {
          id: 'design3',
          name: 'طرح لوکس',
          image: 'https://via.placeholder.com/100x100/45B7D1/FFFFFF?text=🎁',
          price: 10000
        }
      ]
    }
  ];

  // Computed values
  readonly estimatedDelivery = computed(() => {
    const shipping = this.selectedShipping();
    if (!shipping) return '';
    
    const days = shipping.estimatedDays;
    if (days === 0) return 'همان روز';
    if (days === 1) return 'فردا';
    return `${days} روز کاری`;
  });

  // Event handlers
  onGiftDesignSelect(designId: string): void {
    this.giftDesignSelect.emit(designId);
  }

  onGiftMessageChange(message: string): void {
    this.giftMessageChange.emit(message);
  }

  // Utility methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }
}
