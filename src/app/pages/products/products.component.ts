import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
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
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';

import { Product, ProductFilter } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
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
import { ParentingScoreResult } from '../../services/smart-search.service';
import { 
  CHILD_INTEREST_LABELS, 
  GROWTH_GOAL_LABELS 
} from '../../models/labels.constants';

interface ProductsState {
  readonly filteredProducts: ReadonlyArray<Product>;
  readonly loading: boolean;
  readonly error: string | null;
  readonly showSmartSearch: boolean;
  readonly currentStep: number;
}

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
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly smartSearchService = inject(SmartSearchService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild(ParentingStyleAnalyzerComponent) parentingAnalyzer!: ParentingStyleAnalyzerComponent;

  // Store parenting analysis result
  private parentingAnalysisResult: ParentingScoreResult | null = null;

  private readonly state = signal<ProductsState>({
    filteredProducts: [],
    loading: true,
    error: null,
    showSmartSearch: false,
    currentStep: 0
  });

  // Form groups for smart search
  readonly basicInfoForm: FormGroup;
  readonly interestsForm: FormGroup;
  readonly goalsForm: FormGroup;

  // Computed properties
  readonly filteredProducts = computed(() => this.state().filteredProducts);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly showSmartSearch = computed(() => this.state().showSmartSearch);
  readonly currentStep = computed(() => this.state().currentStep);

  readonly allProducts = computed(() => this.productService.products());
  readonly categories = computed(() => this.productService.categories());
  readonly brands = computed(() => this.productService.brands());

  readonly hasProducts = computed(() => this.filteredProducts().length > 0);
  readonly productsCount = computed(() => this.filteredProducts().length);

  // Constants for templates
  readonly interests = [
    ChildInterest.ART_CRAFTS,
    ChildInterest.MUSIC,
    ChildInterest.SPORTS,
    ChildInterest.SCIENCE,
    ChildInterest.TECHNOLOGY,
    ChildInterest.NATURE,
    ChildInterest.ANIMALS,
    ChildInterest.READING,
    ChildInterest.PUZZLES,
    ChildInterest.BUILDING,
    ChildInterest.PRETEND_PLAY,
    ChildInterest.OUTDOOR_ACTIVITIES
  ];
  readonly growthGoals = [
    GrowthGoal.COGNITIVE_DEVELOPMENT,
    GrowthGoal.EMOTIONAL_INTELLIGENCE,
    GrowthGoal.SOCIAL_SKILLS,
    GrowthGoal.PHYSICAL_DEVELOPMENT,
    GrowthGoal.CREATIVITY,
    GrowthGoal.PROBLEM_SOLVING,
    GrowthGoal.LANGUAGE_SKILLS,
    GrowthGoal.MOTOR_SKILLS,
    GrowthGoal.SELF_CONFIDENCE,
    GrowthGoal.INDEPENDENCE
  ];
  readonly interestLabels = CHILD_INTEREST_LABELS;
  readonly goalLabels = GROWTH_GOAL_LABELS;

  constructor() {
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

  ngOnInit(): void {
    this.initializeProducts();
    this.handleRouteParams();
  }

  private async initializeProducts(): Promise<void> {
    this.updateState({ loading: true, error: null });

    try {
      // Wait for products to load
      await new Promise<void>((resolve) => {
        const checkProducts = () => {
          if (!this.productService.loading()) {
            resolve();
          } else {
            setTimeout(checkProducts, 100);
          }
        };
        checkProducts();
      });

      const products = this.productService.products();
      this.updateState({
        filteredProducts: products,
        loading: false,
        error: null
      });

    } catch (error: unknown) {
      console.error('خطا در بارگذاری محصولات:', error);
      this.updateState({
        loading: false,
        error: 'خطا در بارگذاری محصولات'
      });
    }
  }

  private handleRouteParams(): void {
    this.route.queryParams.subscribe(params => {
      const filter: ProductFilter = {
        ...(params['search'] && { search: params['search'] }),
        ...(params['category'] && { category: params['category'] })
      };

      if (Object.keys(filter).length > 0) {
        this.applyFilter(filter);
      }
    });
  }

  private applyFilter(filter: ProductFilter): void {
    this.productService.setFilter(filter);
    const filteredProducts = this.productService.filteredProducts();
    this.updateState({ filteredProducts });
  }

  private updateState(partial: Partial<ProductsState>): void {
    this.state.update(current => ({ ...current, ...partial }));
  }

  toggleSmartSearch(): void {
    this.updateState({ 
      showSmartSearch: !this.showSmartSearch(),
      currentStep: 0
    });
    
    if (!this.showSmartSearch()) {
      this.resetToAllProducts();
    }
  }

  onStepChange(step: number): void {
    this.updateState({ currentStep: step });
  }

  nextStep(): void {
    if (this.stepper) {
      this.stepper.next();
    }
  }

  previousStep(): void {
    if (this.stepper) {
      this.stepper.previous();
    }
  }

  onAnalysisResult(result: ParentingScoreResult): void {
    this.parentingAnalysisResult = result;
  }

  performSmartSearch(): void {
    if (!this.allFormsValid()) {
      return;
    }

    // Perform parenting style analysis automatically
    let analysisResult: ParentingScoreResult | null = null;
    if (this.parentingAnalyzer) {
      analysisResult = this.parentingAnalyzer.performAnalysis();
      this.parentingAnalysisResult = analysisResult;
    }

    // Prepare the output object in the requested format
    const outputData = {
      age: this.basicInfoForm.value.childAge,
      sex: this.basicInfoForm.value.childGender,
      interests: this.interestsForm.value.selectedInterests,
      goals: this.goalsForm.value.selectedGoals,
      analyzeParentingStyles: analysisResult?.dominantStyles || []
    };

    // Print to console as requested
    console.log('نتایج جستجوی هوشمند:', outputData);

    const criteria: SmartSearchCriteria = {
      childAge: this.basicInfoForm.value.childAge,
      childGender: this.basicInfoForm.value.childGender,
      personality: [], // Will be populated from personality assessment
      interests: this.interestsForm.value.selectedInterests,
      growthGoals: this.goalsForm.value.selectedGoals,
      parentingStyle: ParentingStyle.AUTHORITATIVE, // Default, should come from assessment
      budget: {
        min: this.basicInfoForm.value.budgetMin,
        max: this.basicInfoForm.value.budgetMax
      }
    };

    const allProducts = this.allProducts();
    const searchResults = this.smartSearchService.smartSearch(criteria, allProducts as Product[]);
    
    this.updateState({ 
      filteredProducts: searchResults,
      showSmartSearch: false 
    });
  }

  isFormsValid(): boolean {
    return this.basicInfoForm.valid && 
           this.interestsForm.valid && 
           this.goalsForm.valid;
  }

  private allFormsValid(): boolean {
    return this.isFormsValid();
  }

  private resetToAllProducts(): void {
    this.updateState({ filteredProducts: this.allProducts() });
  }

  onAddToCart(product: Product): void {
    try {
      this.cartService.addToCart(product, 1);
      console.log(`${product.name} به سبد خرید اضافه شد`);
    } catch (error: unknown) {
      console.error('خطا در اضافه کردن به سبد خرید:', error);
    }
  }

  onProductClick(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  retryLoad(): void {
    this.initializeProducts();
  }
}
