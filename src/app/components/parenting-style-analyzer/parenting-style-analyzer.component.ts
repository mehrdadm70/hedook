import { AfterViewInit, Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSliderModule } from '@angular/material/slider';
import { analyzeParentingStyles, ParentingScoreResult } from '../../services/smart-search.service';
import { analyzeParentingStylesEnum, analyzeParentingStylesNames } from '../../models/analyze-parenting-styles';

@Component({
    selector: 'app-parenting-style-analyzer',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatSliderModule,
        MatInputModule,
        MatIconModule,
        MatDividerModule
    ],
    templateUrl: './parenting-style-analyzer.component.html',
    styleUrl: './parenting-style-analyzer.component.scss'
})
export class ParentingStyleAnalyzerComponent implements AfterViewInit {
  form: FormGroup = new FormGroup({});
  result: ParentingScoreResult | null = null;
  submitted = false;
  analyzeParentingStylesName :any = analyzeParentingStylesNames;

  @Output() analysisResult = new EventEmitter<ParentingScoreResult>();
  questions = [
    { key: 'Q1', label: 'وقتی فرزندتون قانونی را نقض میکند اولویتتون چیه؟' ,minLabel:'اجرای قانون' ,maxLabel:'حفظ رابطه' },
    { key: 'Q2', label: 'موقع خستگی ، واکنشتون به رفتار کودک بیشتر ناخودآگاه هست یا فکر شده؟' ,minLabel:'ناخوداگاه' ,maxLabel:'فکر شده' },
    { key: 'Q3', label: 'چقدر در تصمیم گیری ها نظر کودک را هم میپرسیم؟' ,minLabel:'کم' ,maxLabel:'زیاد' },
    { key: 'Q4', label: 'با احساسات شدید کودک (مثل عصبانیت و یا ناراحتی) چه میکنید؟' ,minLabel:' نادیده گرفتن' ,maxLabel:'هدایت کردن' },
    { key: 'Q5', label: 'وقتی اشتباه میکند بیشتر بروی نتیجه تمرکز میکنید یا ریشه رفتار؟' ,minLabel:'نتیجه' ,maxLabel:'ریشه رفتار' },
    { key: 'Q6', label: 'چقدر از مسئولیت هایش را به خودش میسپارید؟' ,minLabel:'کم' ,maxLabel:'زیاد' }
  ];

  constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
      Q1: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      Q2: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      Q3: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      Q4: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      Q5: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      Q6: [5, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }


  ngAfterViewInit(): void {

  }

  submit(): void {
    this.submitted = true;
    if (this.form.valid) {
      this.result = analyzeParentingStyles(this.form.value);
      if (this.result) {
        this.analysisResult.emit(this.result);
      }
    }
  }

  // Public method to perform analysis from parent component
  performAnalysis(): ParentingScoreResult | null {
    this.submitted = true;
    if (this.form.valid) {
      this.result = analyzeParentingStyles(this.form.value);
      return this.result;
    }
    return null;
  }

  reset(): void {
    this.form.reset({ Q1: 5, Q2: 5, Q3: 5, Q4: 5, Q5: 5, Q6: 5 });
    this.result = null;
    this.submitted = false;
  }

  getStyleName(style: analyzeParentingStylesEnum | string): string {
  return this.analyzeParentingStylesName[style] ?? style;
  }
}
