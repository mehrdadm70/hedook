import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';
import { 
  SmartSearchCriteria, 
  ParentingStyle, 
  ChildPersonality, 
  ChildInterest, 
  GrowthGoal,
  ParentingStyleQuestion,
  PersonalityQuestion
} from '../models/parenting-style.model';
import { analyzeParentingStylesEnum, analyzeParentingStylesNames } from '../models/analyze-parenting-styles';

export interface ParentingScoreResult {
  scores: { [key: string]: number };
  dominantStyles: string[];
  isCombined: boolean;
  report: string;
}


export function analyzeParentingStyles(answers: { [key: string]: number }): ParentingScoreResult {
  // Q1 تا Q6
  const Q1 = answers['Q1'] ?? 0;
  const Q2 = answers['Q2'] ?? 0;
  const Q3 = answers['Q3'] ?? 0;
  const Q4 = answers['Q4'] ?? 0;
  const Q5 = answers['Q5'] ?? 0;
  const Q6 = answers['Q6'] ?? 0;

  const scores: { [key: string]: number } = {
    [analyzeParentingStylesEnum.Authoritative]: (Q2 + Q3 + Q5 + Q6) / 4,
    [analyzeParentingStylesEnum.Mindful]: (Q1 + Q2 + Q4 + Q5) / 4,
    [analyzeParentingStylesEnum.AttachmentBased]: (Q1 + Q4) / 2,
    [analyzeParentingStylesEnum.Montessori]: (Q3 + Q6) / 2,
    [analyzeParentingStylesEnum.Authoritarian]: (10 - Q1 + 10 - Q2 + 10 - Q3 + 10 - Q5) / 4,
    [analyzeParentingStylesEnum.Permissive]: (10 - Q2 + 10 - Q4 + 10 - Q6) / 3
  };

  // مرتب‌سازی بر اساس امتیاز
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top3 = sorted.slice(0, 3);
  const dominantStyles = top3.map(([style]) => style);

  // بررسی ترکیبی بودن
  let isCombined = false;
  let report = '';

  // report += `\n\nسه سبک غالب شما: ${dominantStyles.map(s => '«' + analyzeParentingStylesNames[s as analyzeParentingStylesEnum] + '»').join('، ')}`;

  return { scores, dominantStyles, isCombined, report };
}

@Injectable({
  providedIn: 'root'
})
export class SmartSearchService {

  // سوالات ارزیابی سبک فرزندپروری
  private parentingStyleQuestions: ParentingStyleQuestion[] = [
    {
      id: '1',
      question: 'وقتی فرزندتان کار اشتباهی انجام می‌دهد، معمولاً چه واکنشی نشان می‌دهید؟',
      options: [
        {
          value: 'explain',
          text: 'توضیح می‌دهم چرا اشتباه است و عواقب آن را بیان می‌کنم',
          styles: {
            [ParentingStyle.AUTHORITATIVE]: 3,
            [ParentingStyle.AUTHORITARIAN]: 1,
            [ParentingStyle.PERMISSIVE]: 2,
            [ParentingStyle.NEGLECTFUL]: 0,
            [ParentingStyle.HELICOPTER]: 2,
            [ParentingStyle.FREE_RANGE]: 1
          }
        },
        {
          value: 'punish',
          text: 'فوراً تنبیه می‌کنم تا یاد بگیرد',
          styles: {
            [ParentingStyle.AUTHORITATIVE]: 0,
            [ParentingStyle.AUTHORITARIAN]: 3,
            [ParentingStyle.PERMISSIVE]: 0,
            [ParentingStyle.NEGLECTFUL]: 1,
            [ParentingStyle.HELICOPTER]: 1,
            [ParentingStyle.FREE_RANGE]: 0
          }
        },
        {
          value: 'ignore',
          text: 'نادیده می‌گیرم، خودش یاد می‌گیرد',
          styles: {
            [ParentingStyle.AUTHORITATIVE]: 0,
            [ParentingStyle.AUTHORITARIAN]: 0,
            [ParentingStyle.PERMISSIVE]: 2,
            [ParentingStyle.NEGLECTFUL]: 3,
            [ParentingStyle.HELICOPTER]: 0,
            [ParentingStyle.FREE_RANGE]: 2
          }
        }
      ]
    },
    {
      id: '2',
      question: 'در مورد قوانین خانه چه نظری دارید؟',
      options: [
        {
          value: 'flexible',
          text: 'قوانین انعطاف‌پذیر با توضیح منطق آن‌ها',
          styles: {
            [ParentingStyle.AUTHORITATIVE]: 3,
            [ParentingStyle.AUTHORITARIAN]: 1,
            [ParentingStyle.PERMISSIVE]: 2,
            [ParentingStyle.NEGLECTFUL]: 0,
            [ParentingStyle.HELICOPTER]: 2,
            [ParentingStyle.FREE_RANGE]: 2
          }
        },
        {
          value: 'strict',
          text: 'قوانین سختگیرانه که باید رعایت شوند',
          styles: {
            [ParentingStyle.AUTHORITATIVE]: 1,
            [ParentingStyle.AUTHORITARIAN]: 3,
            [ParentingStyle.PERMISSIVE]: 0,
            [ParentingStyle.NEGLECTFUL]: 0,
            [ParentingStyle.HELICOPTER]: 2,
            [ParentingStyle.FREE_RANGE]: 0
          }
        },
        {
          value: 'few',
          text: 'قوانین کمی داریم، بیشتر آزاد است',
          styles: {
            [ParentingStyle.AUTHORITATIVE]: 0,
            [ParentingStyle.AUTHORITARIAN]: 0,
            [ParentingStyle.PERMISSIVE]: 3,
            [ParentingStyle.NEGLECTFUL]: 2,
            [ParentingStyle.HELICOPTER]: 0,
            [ParentingStyle.FREE_RANGE]: 3
          }
        }
      ]
    },
    {
      id: '3',
      question: 'چقدر در فعالیت‌های فرزندتان دخالت می‌کنید؟',
      options: [
        {
          value: 'guide',
          text: 'راهنمایی می‌کنم اما اجازه تصمیم‌گیری می‌دهم',
          styles: {
            [ParentingStyle.AUTHORITATIVE]: 3,
            [ParentingStyle.AUTHORITARIAN]: 2,
            [ParentingStyle.PERMISSIVE]: 1,
            [ParentingStyle.NEGLECTFUL]: 0,
            [ParentingStyle.HELICOPTER]: 1,
            [ParentingStyle.FREE_RANGE]: 2
          }
        },
        {
          value: 'control',
          text: 'تمام تصمیمات را من می‌گیرم',
          styles: {
            [ParentingStyle.AUTHORITATIVE]: 0,
            [ParentingStyle.AUTHORITARIAN]: 3,
            [ParentingStyle.PERMISSIVE]: 0,
            [ParentingStyle.NEGLECTFUL]: 0,
            [ParentingStyle.HELICOPTER]: 3,
            [ParentingStyle.FREE_RANGE]: 0
          }
        },
        {
          value: 'hands_off',
          text: 'کمتر دخالت می‌کنم، خودش تجربه کند',
          styles: {
            [ParentingStyle.AUTHORITATIVE]: 1,
            [ParentingStyle.AUTHORITARIAN]: 0,
            [ParentingStyle.PERMISSIVE]: 2,
            [ParentingStyle.NEGLECTFUL]: 3,
            [ParentingStyle.HELICOPTER]: 0,
            [ParentingStyle.FREE_RANGE]: 3
          }
        }
      ]
    }
  ];

  // سوالات ارزیابی ویژگی‌های شخصیتی
  private personalityQuestions: PersonalityQuestion[] = [
    {
      id: '1',
      question: 'فرزندتان در جمع چگونه رفتار می‌کند؟',
      options: [
        {
          value: 'social',
          text: 'با اشتیاق با دیگران تعامل می‌کند',
          traits: {
            [ChildPersonality.EXTROVERT]: 3,
            [ChildPersonality.INTROVERT]: 0,
            [ChildPersonality.SENSITIVE]: 1,
            [ChildPersonality.ADVENTUROUS]: 2,
            [ChildPersonality.ANALYTICAL]: 1,
            [ChildPersonality.CREATIVE]: 1,
            [ChildPersonality.LEADER]: 2,
            [ChildPersonality.TEAM_PLAYER]: 3,
            [ChildPersonality.INDEPENDENT]: 1,
            [ChildPersonality.DEPENDENT]: 0
          }
        },
        {
          value: 'quiet',
          text: 'ترجیح می‌دهد در گوشه‌ای آرام بازی کند',
          traits: {
            [ChildPersonality.EXTROVERT]: 0,
            [ChildPersonality.INTROVERT]: 3,
            [ChildPersonality.SENSITIVE]: 2,
            [ChildPersonality.ADVENTUROUS]: 0,
            [ChildPersonality.ANALYTICAL]: 2,
            [ChildPersonality.CREATIVE]: 2,
            [ChildPersonality.LEADER]: 0,
            [ChildPersonality.TEAM_PLAYER]: 1,
            [ChildPersonality.INDEPENDENT]: 2,
            [ChildPersonality.DEPENDENT]: 1
          }
        },
        {
          value: 'selective',
          text: 'فقط با افراد خاصی راحت است',
          traits: {
            [ChildPersonality.EXTROVERT]: 1,
            [ChildPersonality.INTROVERT]: 2,
            [ChildPersonality.SENSITIVE]: 3,
            [ChildPersonality.ADVENTUROUS]: 0,
            [ChildPersonality.ANALYTICAL]: 2,
            [ChildPersonality.CREATIVE]: 1,
            [ChildPersonality.LEADER]: 1,
            [ChildPersonality.TEAM_PLAYER]: 1,
            [ChildPersonality.INDEPENDENT]: 1,
            [ChildPersonality.DEPENDENT]: 2
          }
        }
      ]
    },
    {
      id: '2',
      question: 'وقتی با مشکل جدیدی مواجه می‌شود چه می‌کند؟',
      options: [
        {
          value: 'analyze',
          text: 'مشکل را بررسی و تحلیل می‌کند',
          traits: {
            [ChildPersonality.EXTROVERT]: 1,
            [ChildPersonality.INTROVERT]: 2,
            [ChildPersonality.SENSITIVE]: 1,
            [ChildPersonality.ADVENTUROUS]: 1,
            [ChildPersonality.ANALYTICAL]: 3,
            [ChildPersonality.CREATIVE]: 2,
            [ChildPersonality.LEADER]: 2,
            [ChildPersonality.TEAM_PLAYER]: 1,
            [ChildPersonality.INDEPENDENT]: 2,
            [ChildPersonality.DEPENDENT]: 0
          }
        },
        {
          value: 'creative',
          text: 'راه‌حل‌های خلاقانه پیدا می‌کند',
          traits: {
            [ChildPersonality.EXTROVERT]: 2,
            [ChildPersonality.INTROVERT]: 2,
            [ChildPersonality.SENSITIVE]: 1,
            [ChildPersonality.ADVENTUROUS]: 2,
            [ChildPersonality.ANALYTICAL]: 1,
            [ChildPersonality.CREATIVE]: 3,
            [ChildPersonality.LEADER]: 2,
            [ChildPersonality.TEAM_PLAYER]: 1,
            [ChildPersonality.INDEPENDENT]: 2,
            [ChildPersonality.DEPENDENT]: 1
          }
        },
        {
          value: 'ask_help',
          text: 'از دیگران کمک می‌خواهد',
          traits: {
            [ChildPersonality.EXTROVERT]: 2,
            [ChildPersonality.INTROVERT]: 1,
            [ChildPersonality.SENSITIVE]: 2,
            [ChildPersonality.ADVENTUROUS]: 0,
            [ChildPersonality.ANALYTICAL]: 1,
            [ChildPersonality.CREATIVE]: 1,
            [ChildPersonality.LEADER]: 0,
            [ChildPersonality.TEAM_PLAYER]: 2,
            [ChildPersonality.INDEPENDENT]: 0,
            [ChildPersonality.DEPENDENT]: 3
          }
        }
      ]
    }
  ];

  constructor() {}

  // دریافت سوالات ارزیابی سبک فرزندپروری
  getParentingStyleQuestions(): Observable<ParentingStyleQuestion[]> {
    return of(this.parentingStyleQuestions);
  }

  // دریافت سوالات ارزیابی ویژگی‌های شخصیتی
  getPersonalityQuestions(): Observable<PersonalityQuestion[]> {
    return of(this.personalityQuestions);
  }

  // محاسبه سبک فرزندپروری بر اساس پاسخ‌ها
  calculateParentingStyle(answers: { [questionId: string]: string }): ParentingStyle {
    const scores: { [key in ParentingStyle]: number } = {
      [ParentingStyle.AUTHORITATIVE]: 0,
      [ParentingStyle.AUTHORITARIAN]: 0,
      [ParentingStyle.PERMISSIVE]: 0,
      [ParentingStyle.NEGLECTFUL]: 0,
      [ParentingStyle.HELICOPTER]: 0,
      [ParentingStyle.FREE_RANGE]: 0
    };

    this.parentingStyleQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const option = question.options.find(opt => opt.value === answer);
        if (option) {
          Object.keys(option.styles).forEach(style => {
            scores[style as ParentingStyle] += option.styles[style as ParentingStyle];
          });
        }
      }
    });

    // پیدا کردن سبک با بالاترین امتیاز
    let maxScore = 0;
    let dominantStyle = ParentingStyle.AUTHORITATIVE;
    
    Object.keys(scores).forEach(style => {
      if (scores[style as ParentingStyle] > maxScore) {
        maxScore = scores[style as ParentingStyle];
        dominantStyle = style as ParentingStyle;
      }
    });

    return dominantStyle;
  }

  // محاسبه ویژگی‌های شخصیتی بر اساس پاسخ‌ها
  calculatePersonalityTraits(answers: { [questionId: string]: string }): ChildPersonality[] {
    const scores: { [key in ChildPersonality]: number } = {
      [ChildPersonality.INTROVERT]: 0,
      [ChildPersonality.EXTROVERT]: 0,
      [ChildPersonality.SENSITIVE]: 0,
      [ChildPersonality.ADVENTUROUS]: 0,
      [ChildPersonality.ANALYTICAL]: 0,
      [ChildPersonality.CREATIVE]: 0,
      [ChildPersonality.LEADER]: 0,
      [ChildPersonality.TEAM_PLAYER]: 0,
      [ChildPersonality.INDEPENDENT]: 0,
      [ChildPersonality.DEPENDENT]: 0
    };

    this.personalityQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const option = question.options.find(opt => opt.value === answer);
        if (option) {
          Object.keys(option.traits).forEach(trait => {
            scores[trait as ChildPersonality] += option.traits[trait as ChildPersonality];
          });
        }
      }
    });

    // انتخاب 3 ویژگی غالب
    const sortedTraits = Object.keys(scores).sort((a, b) => 
      scores[b as ChildPersonality] - scores[a as ChildPersonality]
    );

    return sortedTraits.slice(0, 3).map(trait => trait as ChildPersonality);
  }

  // جستجوی هوشمند محصولات
  smartSearch(criteria: SmartSearchCriteria, products: Product[]): Product[] {
    return products.filter(product => {
      let score = 0;
      const maxScore = 100;

      // بررسی سن
      if (product.ageRange.min <= criteria.childAge && product.ageRange.max >= criteria.childAge) {
        score += 20;
      }

      // بررسی جنسیت
      if (product.gender === criteria.childGender || product.gender === 'unisex') {
        score += 15;
      }

      // بررسی مهارت‌ها با اهداف رشد
      const matchingSkills = product.skills.filter(skill => 
        criteria.growthGoals.some(goal => this.skillMatchesGoal(skill, goal))
      );
      score += (matchingSkills.length / product.skills.length) * 25;

      // بررسی برچسب‌ها با علایق
      const matchingInterests = product.tags.filter(tag => 
        criteria.interests.some(interest => this.tagMatchesInterest(tag, interest))
      );
      score += (matchingInterests.length / product.tags.length) * 20;

      // بررسی سبک فرزندپروری
      score += this.calculateParentingStyleScore(product, criteria.parentingStyle) * 10;

      // بررسی بودجه
      if (criteria.budget) {
        if (product.price >= criteria.budget.min && product.price <= criteria.budget.max) {
          score += 10;
        }
      }

      return score >= 50; // حداقل 50% تطابق
    }).sort((a, b) => {
      // مرتب‌سازی بر اساس امتیاز تطابق
      const scoreA = this.calculateProductScore(a, criteria);
      const scoreB = this.calculateProductScore(b, criteria);
      return scoreB - scoreA;
    });
  }

  private skillMatchesGoal(skill: string, goal: GrowthGoal): boolean {
    const skillGoalMap: { [key: string]: GrowthGoal[] } = {
      'ریاضی': [GrowthGoal.COGNITIVE_DEVELOPMENT, GrowthGoal.PROBLEM_SOLVING],
      'منطق': [GrowthGoal.COGNITIVE_DEVELOPMENT, GrowthGoal.PROBLEM_SOLVING],
      'خلاقیت': [GrowthGoal.CREATIVITY],
      'اجتماعی': [GrowthGoal.SOCIAL_SKILLS, GrowthGoal.EMOTIONAL_INTELLIGENCE],
      'حرکتی': [GrowthGoal.PHYSICAL_DEVELOPMENT, GrowthGoal.MOTOR_SKILLS],
      'زبانی': [GrowthGoal.LANGUAGE_SKILLS],
      'اعتماد به نفس': [GrowthGoal.SELF_CONFIDENCE],
      'استقلال': [GrowthGoal.INDEPENDENCE]
    };

    return skillGoalMap[skill]?.includes(goal) || false;
  }

  private tagMatchesInterest(tag: string, interest: ChildInterest): boolean {
    const tagInterestMap: { [key: string]: ChildInterest[] } = {
      'هنری': [ChildInterest.ART_CRAFTS],
      'موسیقی': [ChildInterest.MUSIC],
      'ورزشی': [ChildInterest.SPORTS],
      'علمی': [ChildInterest.SCIENCE],
      'تکنولوژی': [ChildInterest.TECHNOLOGY],
      'طبیعت': [ChildInterest.NATURE],
      'حیوانات': [ChildInterest.ANIMALS],
      'کتاب': [ChildInterest.READING],
      'پازل': [ChildInterest.PUZZLES],
      'ساختن': [ChildInterest.BUILDING],
      'تخیلی': [ChildInterest.PRETEND_PLAY],
      'بیرون از خانه': [ChildInterest.OUTDOOR_ACTIVITIES]
    };

    return tagInterestMap[tag]?.includes(interest) || false;
  }

  private calculateParentingStyleScore(product: Product, style: ParentingStyle): number {
    // امتیازدهی بر اساس سبک فرزندپروری
    const styleScores: { [key in ParentingStyle]: number } = {
      [ParentingStyle.AUTHORITATIVE]: 1.0,
      [ParentingStyle.AUTHORITARIAN]: 0.8,
      [ParentingStyle.PERMISSIVE]: 0.9,
      [ParentingStyle.NEGLECTFUL]: 0.6,
      [ParentingStyle.HELICOPTER]: 0.7,
      [ParentingStyle.FREE_RANGE]: 0.8
    };

    return styleScores[style];
  }

  private calculateProductScore(product: Product, criteria: SmartSearchCriteria): number {
    let score = 0;

    // محاسبه امتیاز بر اساس معیارهای مختلف
    if (product.ageRange.min <= criteria.childAge && product.ageRange.max >= criteria.childAge) {
      score += 20;
    }

    if (product.gender === criteria.childGender || product.gender === 'unisex') {
      score += 15;
    }

    const matchingSkills = product.skills.filter(skill => 
      criteria.growthGoals.some(goal => this.skillMatchesGoal(skill, goal))
    );
    score += (matchingSkills.length / product.skills.length) * 25;

    const matchingInterests = product.tags.filter(tag => 
      criteria.interests.some(interest => this.tagMatchesInterest(tag, interest))
    );
    score += (matchingInterests.length / product.tags.length) * 20;

    score += this.calculateParentingStyleScore(product, criteria.parentingStyle) * 10;

    if (criteria.budget) {
      if (product.price >= criteria.budget.min && product.price <= criteria.budget.max) {
        score += 10;
      }
    }

    return score;
  }
} 