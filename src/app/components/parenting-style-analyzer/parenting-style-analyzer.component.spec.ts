import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentingStyleAnalyzerComponent } from './parenting-style-analyzer.component';

describe('ParentingStyleAnalyzerComponent', () => {
  let component: ParentingStyleAnalyzerComponent;
  let fixture: ComponentFixture<ParentingStyleAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentingStyleAnalyzerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParentingStyleAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
