// سبک‌های فرزندپروری
export enum ParentingStyle {
  AUTHORITATIVE = 'authoritative',    // مقتدرانه
  AUTHORITARIAN = 'authoritarian',    // مستبدانه
  PERMISSIVE = 'permissive',          // سهل‌گیرانه
  NEGLECTFUL = 'neglectful',          // غفلت‌کننده
  HELICOPTER = 'helicopter',          // هلیکوپتری
  FREE_RANGE = 'free_range'           // آزادانه
}

// ویژگی‌های شخصیتی کودک
export enum ChildPersonality {
  INTROVERT = 'introvert',            // درون‌گرا
  EXTROVERT = 'extrovert',            // برون‌گرا
  SENSITIVE = 'sensitive',            // حساس
  ADVENTUROUS = 'adventurous',        // ماجراجو
  ANALYTICAL = 'analytical',          // تحلیلی
  CREATIVE = 'creative',              // خلاق
  LEADER = 'leader',                  // رهبر
  TEAM_PLAYER = 'team_player',        // تیمی
  INDEPENDENT = 'independent',        // مستقل
  DEPENDENT = 'dependent'             // وابسته
}

// اهداف رشد
export enum GrowthGoal {
  COGNITIVE_DEVELOPMENT = 'cognitive_development',     // رشد شناختی
  EMOTIONAL_INTELLIGENCE = 'emotional_intelligence',   // هوش هیجانی
  SOCIAL_SKILLS = 'social_skills',                     // مهارت‌های اجتماعی
  PHYSICAL_DEVELOPMENT = 'physical_development',       // رشد جسمانی
  CREATIVITY = 'creativity',                           // خلاقیت
  PROBLEM_SOLVING = 'problem_solving',                 // حل مسئله
  LANGUAGE_SKILLS = 'language_skills',                 // مهارت‌های زبانی
  MOTOR_SKILLS = 'motor_skills',                       // مهارت‌های حرکتی
  SELF_CONFIDENCE = 'self_confidence',                 // اعتماد به نفس
  INDEPENDENCE = 'independence'                        // استقلال
}

// علایق کودک
export enum ChildInterest {
  ART_CRAFTS = 'art_crafts',           // هنر و کاردستی
  MUSIC = 'music',                     // موسیقی
  SPORTS = 'sports',                   // ورزش
  SCIENCE = 'science',                 // علوم
  TECHNOLOGY = 'technology',           // تکنولوژی
  NATURE = 'nature',                   // طبیعت
  ANIMALS = 'animals',                 // حیوانات
  READING = 'reading',                 // مطالعه
  PUZZLES = 'puzzles',                 // پازل
  BUILDING = 'building',               // ساختن
  PRETEND_PLAY = 'pretend_play',       // بازی تخیلی
  OUTDOOR_ACTIVITIES = 'outdoor_activities' // فعالیت‌های بیرون از خانه
}

// مدل پروفایل کودک
export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  personality: ChildPersonality[];
  interests: ChildInterest[];
  growthGoals: GrowthGoal[];
  parentingStyle: ParentingStyle;
  specialNeeds?: string[];
  currentSkills: string[];
  challenges: string[];
}

// مدل جستجوی هوشمند
export interface SmartSearchCriteria {
  childAge: number;
  childGender: 'male' | 'female' | 'unisex';
  personality: ChildPersonality[];
  interests: ChildInterest[];
  growthGoals: GrowthGoal[];
  parentingStyle: ParentingStyle;
  specialNeeds?: string[];
  budget?: {
    min: number;
    max: number;
  };
  preferredCategories?: string[];
  excludeCategories?: string[];
}

// سوالات ارزیابی سبک فرزندپروری
export interface ParentingStyleQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    text: string;
    styles: { [key in ParentingStyle]: number };
  }[];
}

// سوالات ارزیابی ویژگی‌های شخصیتی
export interface PersonalityQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    text: string;
    traits: { [key in ChildPersonality]: number };
  }[];
} 