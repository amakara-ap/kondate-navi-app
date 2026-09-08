export interface DetectedIngredient {
  name: string;
  category: 'meat' | 'vegetable' | 'fish' | 'dairy_egg' | 'grain' | 'seasoning' | 'other';
  confidence?: 'high' | 'medium' | 'low';
}

export interface RecipeIngredientItem {
  name: string;
  baseAmount: number; // Amount per base servings (default base is 1 or 2)
  unit: string; // e.g. "g", "個", "本", "枚", "丁", "袋", "大さじ", "小さじ", "少々", "適量"
  note?: string;
  isPantryStaple?: boolean;
}

export interface NutritionPerServing {
  calories: number; // kcal
  protein: number; // g
  fat: number; // g
  carbohydrates: number; // g
  saltEquivalent: number; // g
  highlights?: string; // 栄養のポイント (例: 「ビタミンCと良質なたんぱく質で疲労回復」)
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  timerMinutes?: number;
  tip?: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cookingTimeMinutes: number;
  difficulty: '簡単' | '普通' | '少し本格的';
  cuisineType: '和風' | '洋風' | '中華' | 'エスニック' | 'その他';
  tags: string[];
  baseServings: number; // Base serving count the baseAmounts are given for (typically 2)
  mainIngredients: RecipeIngredientItem[];
  seasonings: RecipeIngredientItem[];
  optionalIngredients?: RecipeIngredientItem[];
  steps: RecipeStep[];
  nutritionPerServing: NutritionPerServing;
  chefTips: string;
}

export interface AnalysisResult {
  detectedIngredients: DetectedIngredient[];
  recipes: Recipe[];
  analysisComment: string;
  ad_insertion_index?: number;
}

export interface SavedRecipe extends Recipe {
  savedAt: number;
  originalImage?: string;
}
