import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { SmartSearchService } from '../../services/smart-search.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ParentingStyleAnalyzerComponent } from '../../components/parenting-style-analyzer/parenting-style-analyzer.component';
import { 
  SmartSearchCriteria, 
  ParentingStyle, 
  ChildPersonality, 
  ChildInterest, 
  GrowthGoal
} from '../../models/parenting-style.model';

@Component({
    selector: 'app-products',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatChipsModule,
        MatSliderModule,
        MatExpansionModule,
        MatProgressSpinnerModule,
        MatStepperModule,
        MatRadioModule,
        ProductCardComponent,
        ParentingStyleAnalyzerComponent
    ],
    templateUrl: './products.component.html',
    styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  showSmartSearch = false;
  currentStep = 0;

  // فرم‌های جستجوی هوشمند
  basicInfoForm!: FormGroup;
  interestsForm!: FormGroup;
  goalsForm!: FormGroup;

  // گزینه‌های انتخاب
  interests = Object.values(ChildInterest);
  growthGoals = Object.values(GrowthGoal);

  // ترجمه‌های فارسی
  interestLabels: { [key in ChildInterest]: string } = {
    [ChildInterest.ART_CRAFTS]: 'هنر و کاردستی',
    [ChildInterest.MUSIC]: 'موسیقی',
    [ChildInterest.SPORTS]: 'ورزش',
    [ChildInterest.SCIENCE]: 'علوم',
    [ChildInterest.TECHNOLOGY]: 'تکنولوژی',
    [ChildInterest.NATURE]: 'طبیعت',
    [ChildInterest.ANIMALS]: 'حیوانات',
    [ChildInterest.READING]: 'مطالعه',
    [ChildInterest.PUZZLES]: 'پازل',
    [ChildInterest.BUILDING]: 'ساختن',
    [ChildInterest.PRETEND_PLAY]: 'بازی تخیلی',
    [ChildInterest.OUTDOOR_ACTIVITIES]: 'فعالیت‌های بیرون از خانه'
  };

  goalLabels: { [key in GrowthGoal]: string } = {
    [GrowthGoal.COGNITIVE_DEVELOPMENT]: 'رشد شناختی',
    [GrowthGoal.EMOTIONAL_INTELLIGENCE]: 'هوش هیجانی',
    [GrowthGoal.SOCIAL_SKILLS]: 'مهارت‌های اجتماعی',
    [GrowthGoal.PHYSICAL_DEVELOPMENT]: 'رشد جسمانی',
    [GrowthGoal.CREATIVITY]: 'خلاقیت',
    [GrowthGoal.PROBLEM_SOLVING]: 'حل مسئله',
    [GrowthGoal.LANGUAGE_SKILLS]: 'مهارت‌های زبانی',
    [GrowthGoal.MOTOR_SKILLS]: 'مهارت‌های حرکتی',
    [GrowthGoal.SELF_CONFIDENCE]: 'اعتماد به نفس',
    [GrowthGoal.INDEPENDENCE]: 'استقلال'
  };

  constructor(
    private productService: ProductService,
    private smartSearchService: SmartSearchService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.handleRouteParams();
  }

  private initializeForms(): void {
    this.basicInfoForm = this.formBuilder.group({
      childAge: [5],
      childGender: ['unisex'],
      budgetMin: [0],
      budgetMax: [1000000]
    });

    this.interestsForm = this.formBuilder.group({
      selectedInterests: [[]]
    });

    this.goalsForm = this.formBuilder.group({
      selectedGoals: [[]]
    });
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.filteredProducts = products;
      this.loading = false;
    });
  }

  private handleRouteParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.performBasicSearch(params['search']);
      }
      if (params['category']) {
        this.filterByCategory(params['category']);
      }
    });
  }

  toggleSmartSearch(): void {
    this.showSmartSearch = !this.showSmartSearch;
    if (!this.showSmartSearch) {
      this.resetToAllProducts();
    }
  }

  onStepChange(step: number): void {
    this.currentStep = step;
  }

  performSmartSearch(): void {
    if (this.allFormsValid()) {
      const criteria: SmartSearchCriteria = {
        childAge: this.basicInfoForm.value.childAge,
        childGender: this.basicInfoForm.value.childGender,
        personality: [],
        interests: this.interestsForm.value.selectedInterests,
        growthGoals: this.goalsForm.value.selectedGoals,
        parentingStyle: ParentingStyle.AUTHORITATIVE,
        budget: {
          min: this.basicInfoForm.value.budgetMin,
          max: this.basicInfoForm.value.budgetMax
        }
      };

      this.filteredProducts = this.smartSearchService.smartSearch(criteria, this.products);
      this.showSmartSearch = false;
    }
  }

  allFormsValid(): boolean {
    return this.basicInfoForm.valid && 
           this.interestsForm.valid && 
           this.goalsForm.valid;
  }

  private performBasicSearch(searchTerm: string): void {
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  private filterByCategory(category: string): void {
    this.filteredProducts = this.products.filter(product =>
      product.category === category
    );
  }

  private resetToAllProducts(): void {
    this.filteredProducts = this.products;
  }

  onAddToCart(product: Product): void {
    console.log('محصول به سبد خرید اضافه شد:', product.name);
  }

  getInterestLabel(interest: ChildInterest): string {
    return this.interestLabels[interest];
  }

  getGoalLabel(goal: GrowthGoal): string {
    return this.goalLabels[goal];
  }
}
