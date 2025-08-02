import {
  ParentingStyle,
  ChildPersonality,
  GrowthGoal,
  ChildInterest,
} from './parenting-style.model';

export const PARENTING_STYLE_LABELS = {
  [ParentingStyle.AUTHORITATIVE]: 'مقتدرانه',
  [ParentingStyle.AUTHORITARIAN]: 'مستبدانه',
  [ParentingStyle.PERMISSIVE]: 'سهل‌گیرانه',
  [ParentingStyle.NEGLECTFUL]: 'غفلت‌کننده',
  [ParentingStyle.HELICOPTER]: 'هلیکوپتری',
  [ParentingStyle.FREE_RANGE]: 'آزادانه'
} as const;

export const CHILD_PERSONALITY_LABELS = {
  [ChildPersonality.INTROVERT]: 'درون‌گرا',
  [ChildPersonality.EXTROVERT]: 'برون‌گرا',
  [ChildPersonality.SENSITIVE]: 'حساس',
  [ChildPersonality.ADVENTUROUS]: 'ماجراجو',
  [ChildPersonality.ANALYTICAL]: 'تحلیلی',
  [ChildPersonality.CREATIVE]: 'خلاق',
  [ChildPersonality.LEADER]: 'رهبر',
  [ChildPersonality.TEAM_PLAYER]: 'تیمی',
  [ChildPersonality.INDEPENDENT]: 'مستقل',
  [ChildPersonality.DEPENDENT]: 'وابسته'
} as const;

export const GROWTH_GOAL_LABELS = {
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
} as const;

export const CHILD_INTEREST_LABELS = {
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
} as const; 