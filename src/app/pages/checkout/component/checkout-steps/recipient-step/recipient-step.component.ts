import { Component, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

import { AuthService } from '../../../../../services/auth.service';

interface Province {
  id: string;
  name: string;
  cities: string[];
}

@Component({
  selector: 'app-recipient-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule
  ],
  templateUrl: './recipient-step.component.html',
  styleUrl: './recipient-step.component.scss'
})
export class RecipientStepComponent {
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  // Inputs
  readonly userMode = input<'logged-in' | 'login' | 'register'>('register');
  readonly isGift = input<boolean>(false);
  readonly showGiftForm = input<boolean>(false);

  // Outputs
  readonly switchToLogin = output<void>();
  readonly switchToRegister = output<void>();
  readonly loginSubmit = output<{email: string, password: string}>();
  readonly giftToggle = output<boolean>();
  readonly formValid = output<boolean>();

  // Forms
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

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly addressSelectionForm: FormGroup = this.fb.group({
    selectedAddress: ['', [Validators.required]]
  });

  readonly giftForm: FormGroup = this.fb.group({
    giftState: ['', [Validators.required]],
    giftCity: ['', [Validators.required]],
    giftAddress: ['', [Validators.required, Validators.minLength(10)]],
    giftZipCode: ['', [Validators.pattern(/^\d{10}$/)]],
    giftMessage: ['', [Validators.maxLength(200)]]
  });

  // Iranian provinces and cities
  readonly provinces: Province[] = [
    { id: 'isfahan', name: 'اصفهان', cities: ['اصفهان', 'کاشان', 'نجف‌آباد', 'خمینی‌شهر'] },
    { id: 'tehran', name: 'تهران', cities: ['تهران', 'کرج', 'ورامین', 'شهریار'] },
    { id: 'shiraz', name: 'شیراز', cities: ['شیراز', 'کازرون', 'مرودشت', 'جهرم'] },
    { id: 'mashhad', name: 'مشهد', cities: ['مشهد', 'نیشابور', 'سبزوار', 'کاشمر'] },
    { id: 'tabriz', name: 'تبریز', cities: ['تبریز', 'مرند', 'میانه', 'اهر'] }
  ];

  // Mock saved addresses for logged-in users
  readonly savedAddresses = [
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

  readonly selectedSavedAddress = computed(() => {
    const addressId = this.addressSelectionForm.get('selectedAddress')?.value;
    return this.savedAddresses.find(addr => addr.id === addressId);
  });

  // Form validation
  readonly isFormValid = computed(() => {
    switch (this.userMode()) {
      case 'logged-in':
        return this.addressSelectionForm.valid;
      case 'login':
        return this.loginForm.valid;
      case 'register':
        return this.recipientForm.valid;
      default:
        return false;
    }
  });

  ngOnInit(): void {
    // Pre-fill user data if logged in
    if (this.authService.isAuthenticated()) {
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        this.recipientForm.patchValue({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          phone: currentUser.phone
        });
      }
    }

    // Watch form validity changes
    this.recipientForm.statusChanges.subscribe(() => {
      this.formValid.emit(this.isFormValid());
    });
    this.loginForm.statusChanges.subscribe(() => {
      this.formValid.emit(this.isFormValid());
    });
    this.addressSelectionForm.statusChanges.subscribe(() => {
      this.formValid.emit(this.isFormValid());
    });
  }

  // Event handlers
  onSwitchToLogin(): void {
    this.switchToLogin.emit();
  }

  onSwitchToRegister(): void {
    this.switchToRegister.emit();
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      this.loginSubmit.emit(this.loginForm.value);
    }
  }

  onGiftToggle(): void {
    this.giftToggle.emit(!this.isGift());
  }

  onProvinceChange(provinceId: string): void {
    this.selectedProvince.set(provinceId);
    this.recipientForm.patchValue({ city: '' });
  }

  onGiftProvinceChange(provinceId: string): void {
    this.selectedGiftProvince.set(provinceId);
    this.giftForm.patchValue({ giftCity: '' });
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

  // Utility methods
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
    if (field.errors['email']) {
      return 'ایمیل معتبر وارد کنید';
    }

    return 'مقدار نامعتبر';
  }
}
