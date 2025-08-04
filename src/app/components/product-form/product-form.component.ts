import { Component, EventEmitter, Input, OnInit, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Product, CreateProductDto, UpdateProductDto, ProductGender } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { 
  ParentingStyle, 
  ChildInterest, 
  GrowthGoal 
} from '../../models/parenting-style.model';
import { 
  PARENTING_STYLE_LABELS, 
  CHILD_INTEREST_LABELS, 
  GROWTH_GOAL_LABELS 
} from '../../models/labels.constants';

interface ProductFormState {
  readonly loading: boolean;
  readonly error: string | null;
  readonly isEdit: boolean;
}

@Component({
  selector: 'app-product-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSliderModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  @Input() product?: Product;
  @Output() saved = new EventEmitter<Product>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly state = signal<ProductFormState>({
    loading: false,
    error: null,
    isEdit: false
  });

  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly isEdit = computed(() => this.state().isEdit);

  productForm!: FormGroup;

  // Options for form fields
  readonly categories = computed(() => this.productService.categories());
  readonly brands = computed(() => this.productService.brands());
  readonly skills = computed(() => this.productService.skills());
  
  readonly genderOptions = [
    { value: 'male', label: 'پسرانه' },
    { value: 'female', label: 'دخترانه' },
    { value: 'unisex', label: 'عمومی' }
  ];

  readonly childGenderOptions = [
    { value: 'male', label: 'پسر' },
    { value: 'female', label: 'دختر' },
    { value: 'unisex', label: 'عمومی' }
  ];

  readonly ageRangeOptions = [
    { min: 0, max: 1, label: '0-1 سال' },
    { min: 1, max: 3, label: '1-3 سال' },
    { min: 3, max: 6, label: '3-6 سال' },
    { min: 6, max: 10, label: '6-10 سال' },
    { min: 10, max: 14, label: '10-14 سال' },
    { min: 14, max: 18, label: '14-18 سال' }
  ];

  readonly parentingStyleOptions = Object.entries(PARENTING_STYLE_LABELS).map(([value, label]) => ({
    value: value as ParentingStyle,
    label
  }));

  readonly interestOptions = Object.entries(CHILD_INTEREST_LABELS).map(([value, label]) => ({
    value: value as ChildInterest,
    label
  }));

  readonly growthGoalOptions = Object.entries(GROWTH_GOAL_LABELS).map(([value, label]) => ({
    value: value as GrowthGoal,
    label
  }));

  // Labels for template
  readonly PARENTING_STYLE_LABELS: Record<ParentingStyle, string> = PARENTING_STYLE_LABELS;
  readonly CHILD_INTEREST_LABELS: Record<ChildInterest, string> = CHILD_INTEREST_LABELS;
  readonly GROWTH_GOAL_LABELS: Record<GrowthGoal, string> = GROWTH_GOAL_LABELS;

  // Image management
  readonly images = signal<string[]>([]);
  readonly newImageUrl = signal('');

  ngOnInit(): void {
    this.initializeForm();
    this.loadProductData();
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      originalPrice: [0, [Validators.min(0)]],
      category: ['', Validators.required],
      brand: ['', Validators.required],
      gender: ['unisex', Validators.required],
      ageRangeMin: [3, [Validators.required, Validators.min(0), Validators.max(18)]],
      ageRangeMax: [6, [Validators.required, Validators.min(0), Validators.max(18)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      skills: [[]],
      tags: [[]],
      isActive: [true],
      // فیلدهای جدید برای جستجوی هوشمند
      interests: [[]],
      growthGoals: [[]],
      parentingStyle: [''],
      childAge: [5, [Validators.min(0), Validators.max(18)]],
      childGender: ['unisex']
    });

    // Custom validation for age range
    this.productForm.get('ageRangeMin')?.valueChanges.subscribe(min => {
      const max = this.productForm.get('ageRangeMax')?.value;
      if (max && min > max) {
        this.productForm.get('ageRangeMax')?.setValue(min);
      }
    });

    this.productForm.get('ageRangeMax')?.valueChanges.subscribe(max => {
      const min = this.productForm.get('ageRangeMin')?.value;
      if (min && max < min) {
        this.productForm.get('ageRangeMin')?.setValue(max);
      }
    });
  }

  private loadProductData(): void {
    if (this.product) {
      this.updateState({ isEdit: true });
      
      // Load images
      this.images.set([...this.product.images]);
      
      // Set form values
      this.productForm.patchValue({
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        originalPrice: this.product.originalPrice || 0,
        category: this.product.category,
        brand: this.product.brand,
        gender: this.product.gender,
        ageRangeMin: this.product.ageRange.min,
        ageRangeMax: this.product.ageRange.max,
        stock: this.product.stock,
        skills: [...this.product.skills],
        tags: [...this.product.tags],
        isActive: this.product.isActive,
        // فیلدهای جدید
        interests: this.product.interests || [],
        growthGoals: this.product.growthGoals || [],
        parentingStyle: this.product.parentingStyle || '',
        childAge: this.product.childAge || 5,
        childGender: this.product.childGender || 'unisex'
      });
    }
  }

  addImage(): void {
    const url = this.newImageUrl().trim();
    if (url && this.isValidImageUrl(url)) {
      this.images.update(images => [...images, url]);
      this.newImageUrl.set('');
    } else {
      this.snackBar.open('لطفاً یک URL معتبر برای تصویر وارد کنید', 'بستن', {
        duration: 3000
      });
    }
  }

  removeImage(index: number): void {
    this.images.update(images => images.filter((_, i) => i !== index));
  }

  addSkill(skill: string): void {
    const currentSkills = this.productForm.get('skills')?.value || [];
    if (skill && !currentSkills.includes(skill)) {
      this.productForm.get('skills')?.setValue([...currentSkills, skill]);
    }
  }

  removeSkill(skill: string): void {
    const currentSkills = this.productForm.get('skills')?.value || [];
    this.productForm.get('skills')?.setValue(currentSkills.filter((s: string) => s !== skill));
  }

  addTag(tag: string): void {
    const currentTags = this.productForm.get('tags')?.value || [];
    if (tag && !currentTags.includes(tag)) {
      this.productForm.get('tags')?.setValue([...currentTags, tag]);
    }
  }

  removeTag(tag: string): void {
    const currentTags = this.productForm.get('tags')?.value || [];
    this.productForm.get('tags')?.setValue(currentTags.filter((t: string) => t !== tag));
  }

  addInterest(interest: ChildInterest): void {
    const currentInterests = this.productForm.get('interests')?.value || [];
    if (interest && !currentInterests.includes(interest)) {
      this.productForm.get('interests')?.setValue([...currentInterests, interest]);
    }
  }

  removeInterest(interest: ChildInterest): void {
    const currentInterests = this.productForm.get('interests')?.value || [];
    this.productForm.get('interests')?.setValue(currentInterests.filter((i: ChildInterest) => i !== interest));
  }

  addGrowthGoal(goal: GrowthGoal): void {
    const currentGoals = this.productForm.get('growthGoals')?.value || [];
    if (goal && !currentGoals.includes(goal)) {
      this.productForm.get('growthGoals')?.setValue([...currentGoals, goal]);
    }
  }

  removeGrowthGoal(goal: GrowthGoal): void {
    const currentGoals = this.productForm.get('growthGoals')?.value || [];
    this.productForm.get('growthGoals')?.setValue(currentGoals.filter((g: GrowthGoal) => g !== goal));
  }

  onSubmit(): void {
    if (this.productForm.valid && this.images().length > 0) {
      this.updateState({ loading: true, error: null });

      const formValue = this.productForm.value;
      
      const productData = {
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        originalPrice: formValue.originalPrice > 0 ? formValue.originalPrice : undefined,
        images: this.images(),
        category: formValue.category,
        ageRange: {
          min: formValue.ageRangeMin,
          max: formValue.ageRangeMax
        },
        gender: formValue.gender,
        skills: formValue.skills || [],
        brand: formValue.brand,
        stock: formValue.stock,
        tags: formValue.tags || [],
        // فیلدهای جدید
        interests: formValue.interests || [],
        growthGoals: formValue.growthGoals || [],
        parentingStyle: formValue.parentingStyle || undefined,
        childAge: formValue.childAge || undefined,
        childGender: formValue.childGender || undefined
      };

      const operation = this.isEdit() 
        ? this.productService.updateProduct({ ...productData, id: this.product!.id })
        : this.productService.createProduct(productData);

      operation.subscribe({
        next: (product) => {
          this.updateState({ loading: false });
          this.snackBar.open(
            this.isEdit() ? 'محصول با موفقیت ویرایش شد' : 'محصول با موفقیت ایجاد شد',
            'بستن',
            { duration: 3000 }
          );
          this.saved.emit(product);
        },
        error: (error) => {
          this.updateState({ 
            loading: false, 
            error: error.message || 'خطا در ذخیره محصول'
          });
          this.snackBar.open(
            error.message || 'خطا در ذخیره محصول',
            'بستن',
            { duration: 5000 }
          );
        }
      });
    } else {
      if (this.images().length === 0) {
        this.snackBar.open('حداقل یک تصویر برای محصول ضروری است', 'بستن', {
          duration: 3000
        });
      }
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private isValidImageUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('assets/');
  }

  private updateState(partial: Partial<ProductFormState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  // Computed properties for form validation
  readonly isFormValid = computed(() => 
    this.productForm?.valid && this.images().length > 0
  );

  readonly submitButtonText = computed(() => 
    this.loading() ? 'در حال ذخیره...' : (this.isEdit() ? 'ویرایش محصول' : 'ایجاد محصول')
  );

  // Helper methods for template
  getInterestLabel(interest: ChildInterest): string {
    return CHILD_INTEREST_LABELS[interest];
  }

  getGrowthGoalLabel(goal: GrowthGoal): string {
    return GROWTH_GOAL_LABELS[goal];
  }
} 