import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';

import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderSummaryComponent } from './component/order-summary/order-summary.component';
import { RecipientStepComponent } from './component/checkout-steps/recipient-step/recipient-step.component';
import { ShippingStepComponent } from './component/checkout-steps/shipping-step/shipping-step.component';
import { PaymentStepComponent } from './component/checkout-steps/payment-step/payment-step.component';
import { PaymentConfirmationComponent } from './component/payment-confirmation/payment-confirmation.component';

interface CheckoutState {
  readonly currentStep: number;
  readonly loading: boolean;
  readonly error: string | null;
  readonly isGift: boolean;
  readonly showGiftForm: boolean;
  readonly isCreatingAccount: boolean;
  readonly userMode: 'logged-in' | 'login' | 'register';
  readonly showLoginForm: boolean;
}

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

interface SavedAddress {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface PaymentGateway {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatStepperModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTableModule,
    MatBadgeModule,
    OrderSummaryComponent,
    RecipientStepComponent,
    ShippingStepComponent,
    PaymentStepComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  private readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  private readonly state = signal<CheckoutState>({
    currentStep: 0,
    loading: false,
    error: null,
    isGift: false,
    showGiftForm: false,
    isCreatingAccount: false,
    userMode: 'register',
    showLoginForm: false
  });

  readonly currentStep = computed(() => this.state().currentStep);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly isGift = computed(() => this.state().isGift);
  readonly showGiftForm = computed(() => this.state().showGiftForm);
  readonly isCreatingAccount = computed(() => this.state().isCreatingAccount);
  readonly userMode = computed(() => this.state().userMode);
  readonly showLoginForm = computed(() => this.state().showLoginForm);

  // Cart data
  readonly cartItems = computed(() => this.cartService.items());
  readonly totalPrice = computed(() => this.cartService.totalPrice());
  readonly totalItems = computed(() => this.cartService.totalItems());
  readonly isEmpty = computed(() => this.cartService.isEmpty());

  // Form groups for each step
  readonly recipientForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]],
    email: ['', [Validators.email]],
    state: ['', [Validators.required]],
    city: ['', [Validators.required]],
    address: ['', [Validators.required, Validators.minLength(10)]],
    zipCode: ['', [Validators.pattern(/^\d{10}$/)]]
  });

  readonly giftForm: FormGroup = this.fb.group({
    giftState: ['', [Validators.required]],
    giftCity: ['', [Validators.required]],
    giftAddress: ['', [Validators.required, Validators.minLength(10)]],
    giftZipCode: ['', [Validators.pattern(/^\d{10}$/)]],
    giftMessage: ['', [Validators.maxLength(200)]]
  });

  readonly shippingForm: FormGroup = this.fb.group({
    shippingMethod: ['', [Validators.required]],
    packagingType: ['simple', [Validators.required]],
    giftDesign: [''],
    giftMessage: ['']
  });

  readonly paymentForm: FormGroup = this.fb.group({
    paymentGateway: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]]
  });

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly addressSelectionForm: FormGroup = this.fb.group({
    selectedAddress: ['', [Validators.required]]
  });

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

  // Iranian provinces and cities
  readonly provinces = [
    { id: 'isfahan', name: 'اصفهان', cities: ['اصفهان', 'کاشان', 'نجف‌آباد', 'خمینی‌شهر'] },
    { id: 'tehran', name: 'تهران', cities: ['تهران', 'کرج', 'ورامین', 'شهریار'] },
    { id: 'shiraz', name: 'شیراز', cities: ['شیراز', 'کازرون', 'مرودشت', 'جهرم'] },
    { id: 'mashhad', name: 'مشهد', cities: ['مشهد', 'نیشابور', 'سبزوار', 'کاشمر'] },
    { id: 'tabriz', name: 'تبریز', cities: ['تبریز', 'مرند', 'میانه', 'اهر'] }
  ];

  readonly selectedProvince = signal<string>('');
  readonly selectedGiftProvince = signal<string>('');
  
  readonly availableCities = computed(() => {
    const province = this.provinces.find(p => p.id === this.selectedProvince());
    return province ? province.cities : [];
  });

  readonly availableGiftCities = computed(() => {
    const province = this.provinces.find(p => p.id === this.selectedGiftProvince());
    return province ? province.cities : [];
  });

  // Mock saved addresses for logged-in users
  readonly savedAddresses: SavedAddress[] = [
    {
      id: 'addr1',
      title: 'خانه',
      address: 'خیابان فردوسی، کوچه ۱۵، پلاک ۲۳، طبقه ۳',
      city: 'اصفهان',
      state: 'isfahan',
      zipCode: '1234567890',
      isDefault: true
    },
    {
      id: 'addr2',
      title: 'محل کار',
      address: 'خیابان چهارباغ، پلاک ۴۵، طبقه ۲',
      city: 'اصفهان',
      state: 'isfahan',
      zipCode: '1234567891',
      isDefault: false
    }
  ];

  readonly selectedSavedAddress = computed(() => {
    const addressId = this.addressSelectionForm.get('selectedAddress')?.value;
    return this.savedAddresses.find(addr => addr.id === addressId);
  });

  // Computed values
  readonly selectedShipping = computed(() => {
    const method = this.shippingForm.get('shippingMethod')?.value;
    return this.shippingOptions.find(option => option.id === method) || null;
  });

  readonly selectedPackaging = computed(() => {
    const type = this.shippingForm.get('packagingType')?.value;
    return this.packagingOptions.find(option => option.id === type) || null;
  });

  readonly selectedGiftDesign = computed(() => {
    const designId = this.shippingForm.get('giftDesign')?.value;
    const packaging = this.selectedPackaging();
    if (!packaging?.giftDesigns) return null;
    return packaging.giftDesigns.find(design => design.id === designId) || null;
  });

  readonly shippingCost = computed(() => {
    const shipping = this.selectedShipping();
    const packaging = this.selectedPackaging();
    const giftDesign = this.selectedGiftDesign();
    return (shipping?.price || 0) + (packaging?.price || 0) + (giftDesign?.price || 0);
  });

  readonly finalTotal = computed(() => {
    return this.totalPrice() + this.shippingCost();
  });

  readonly estimatedDelivery = computed(() => {
    const shipping = this.selectedShipping();
    if (!shipping) return '';
    
    const days = shipping.estimatedDays;
    if (days === 0) return 'همان روز';
    if (days === 1) return 'فردا';
    return `${days} روز کاری`;
  });

  readonly displayedColumns = ['product', 'quantity', 'price', 'subtotal'];

  ngOnInit(): void {
    // Redirect if cart is empty
    if (this.isEmpty()) {
      this.router.navigate(['/cart']);
      return;
    }

    // Check if user is logged in
    if (this.authService.isAuthenticated()) {
      this.updateState({ userMode: 'logged-in' });
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        this.recipientForm.patchValue({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          phone: currentUser.phone
        });
      }
    } else {
      this.updateState({ userMode: 'register' });
    }
  }

  // Step navigation
  nextStep(): void {
    if (this.currentStep() < 2) {
      this.updateState({ currentStep: this.currentStep() + 1 });
    }
  }

  previousStep(): void {
    if (this.currentStep() > 0) {
      this.updateState({ currentStep: this.currentStep() - 1 });
    }
  }

  goToStep(step: number): void {
    this.updateState({ currentStep: step });
  }

  // Form validation
  isStepValid(step: number): boolean {
    switch (step) {
      case 0:
        if (this.userMode() === 'logged-in') {
          return this.addressSelectionForm.valid;
        } else if (this.userMode() === 'login') {
          return this.loginForm.valid;
        } else {
          return this.recipientForm.valid;
        }
      case 1:
        return this.shippingForm.valid;
      case 2:
        return this.paymentForm.valid;
      default:
        return false;
    }
  }

  // Province and city handling
  onProvinceChange(provinceId: string): void {
    this.selectedProvince.set(provinceId);
    this.recipientForm.patchValue({ city: '' });
  }

  onGiftProvinceChange(provinceId: string): void {
    this.selectedGiftProvince.set(provinceId);
    this.giftForm.patchValue({ giftCity: '' });
  }

  // User mode handling
  switchToLogin(): void {
    this.updateState({ 
      userMode: 'login',
      showLoginForm: true
    });
  }

  switchToRegister(): void {
    this.updateState({ 
      userMode: 'register',
      showLoginForm: false
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.updateState({ loading: true, error: null });

    const credentials = this.loginForm.value;
    this.authService.login(credentials).subscribe({
      next: () => {
        this.updateState({ 
          loading: false, 
          userMode: 'logged-in',
          showLoginForm: false
        });
        this.snackBar.open('ورود موفقیت‌آمیز بود', 'بستن', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        this.updateState({
          loading: false,
          error: 'ایمیل یا رمز عبور اشتباه است'
        });
      }
    });
  }

  onAddressSelect(addressId: string): void {
    this.addressSelectionForm.patchValue({ selectedAddress: addressId });
    const selectedAddress = this.savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      this.recipientForm.patchValue({
        state: selectedAddress.state,
        city: selectedAddress.city,
        address: selectedAddress.address,
        zipCode: selectedAddress.zipCode
      });
      this.selectedProvince.set(selectedAddress.state);
    }
  }

  // Gift toggle
  toggleGift(): void {
    const newIsGift = !this.isGift();
    this.updateState({ 
      isGift: newIsGift,
      showGiftForm: newIsGift
    });
    
    if (!newIsGift) {
      // Reset gift form when unchecking
      this.giftForm.reset();
      this.selectedGiftProvince.set('');
    }
  }

  // Form submission
  onSubmit(): void {
    if (!this.isStepValid(2)) {
      this.markAllFormsTouched();
      return;
    }

    this.updateState({ loading: true, error: null });

    // Check if user needs to create account
    if (!this.authService.isAuthenticated()) {
      this.createAccountAndSubmit();
    } else {
      this.submitOrder();
    }
  }

  private createAccountAndSubmit(): void {
    this.updateState({ isCreatingAccount: true });

    const userData = {
      firstName: this.recipientForm.get('firstName')?.value,
      lastName: this.recipientForm.get('lastName')?.value,
      email: this.recipientForm.get('email')?.value || `${this.recipientForm.get('phone')?.value}@hedook.com`,
      phone: this.recipientForm.get('phone')?.value,
      password: 'temp123456',
      confirmPassword: 'temp123456'
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.updateState({ isCreatingAccount: false });
        this.submitOrder();
      },
      error: (error) => {
        this.updateState({ 
          loading: false, 
          isCreatingAccount: false,
          error: 'خطا در ایجاد حساب کاربری: ' + error.message 
        });
      }
    });
  }

  private submitOrder(): void {
    const orderData = {
      recipient: this.recipientForm.value,
      gift: this.isGift() ? this.giftForm.value : null,
      shipping: {
        method: this.selectedShipping(),
        packaging: this.selectedPackaging(),
        giftDesign: this.selectedGiftDesign(),
        giftMessage: this.shippingForm.get('giftMessage')?.value
      },
      payment: {
        gateway: this.paymentForm.get('paymentGateway')?.value
      },
      items: this.cartItems(),
      total: this.finalTotal(),
      isGift: this.isGift()
    };

    // Simulate order processing
    setTimeout(() => {
      this.updateState({ loading: false });
      this.snackBar.open('سفارش شما با موفقیت ثبت شد!', 'بستن', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      
      // Clear cart and redirect
      this.cartService.clearCart();
      this.router.navigate(['/']);
    }, 2000);
  }

  // Utility methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'این فیلد الزامی است';
    }
    if (field.errors['minlength']) {
      return `حداقل ${field.errors['minlength'].requiredLength} کاراکتر وارد کنید`;
    }
    if (field.errors['pattern']) {
      if (fieldName === 'phone') {
        return 'شماره موبایل معتبر وارد کنید (مثال: 09123456789)';
      }
      if (fieldName === 'zipCode') {
        return 'کد پستی ۱۰ رقمی وارد کنید';
      }
    }

    return 'مقدار نامعتبر';
  }

  private updateState(partial: Partial<CheckoutState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  private markAllFormsTouched(): void {
    const forms = [this.shippingForm, this.paymentForm];
    
    // Add appropriate form based on user mode
    if (this.userMode() === 'logged-in') {
      forms.push(this.addressSelectionForm);
    } else if (this.userMode() === 'login') {
      forms.push(this.loginForm);
    } else {
      forms.push(this.recipientForm);
    }
    
    if (this.isGift()) {
      forms.push(this.giftForm);
    }
    
    forms.forEach(form => {
      Object.keys(form.controls).forEach(key => {
        const control = form.get(key);
        control?.markAsTouched();
      });
    });
  }

  private markFormGroupTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  onGoToCart(): void {
    this.router.navigate(['/cart']);
  }

  // Event handlers for step components
  onStepValidChange(step: number, isValid: boolean): void {
    // Handle step validation changes if needed
  }

  onGiftDesignSelect(designId: string): void {
    this.shippingForm.patchValue({ giftDesign: designId });
  }

  onGiftMessageChange(message: string): void {
    this.giftForm.patchValue({ giftMessage: message });
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }
}
