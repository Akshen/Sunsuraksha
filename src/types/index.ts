/**
 * SunSuraksha Type Definitions
 */

// ---- User ----
export interface UserProfile {
  id: string;
  name: string;
  city: string;
  age: number;
  weight_kg: number;
  job_type: 'indoor' | 'outdoor' | 'mixed';
  diet_preference: 'vegetarian' | 'vegan' | 'non-vegetarian';
  language: 'en' | 'hi';
  onboarded: boolean;
  created_at: string;
}

// ---- Weather ----
export interface WeatherData {
  city: string;
  temp_c: number;
  feels_like_c: number;
  humidity_pct: number;
  uv_index: number;
  wind_speed_kmh: number;
  description: string;
  icon: string;
  updated_at: string;
}

// ---- Heat Score ----
export interface HeatScore {
  score: number;          // 0-100
  label: string;          // Safe / Moderate / Danger / Extreme
  color: string;          // Hex color for UI
  bgColor: string;        // Background tint
  primaryAction: string;  // "Stay indoors" / "Drink water now" etc.
  safeWindowStart: string; // e.g. "6:15 PM"
  safeWindowEnd: string;   // e.g. "8:30 PM"
}

// ---- Food & Drink Database ----
export interface NutritionInfo {
  source: string;
  water_g: number;
  energy_kcal: number;
  protein_g: number;
  fat_g: number;
  carbohydrate_g: number;
  fiber_g: number;
  vitamin_c_mg: number;
  potassium_mg: number;
  magnesium_mg: number;
  sodium_mg: number;
  calcium_mg: number;
  iron_mg: number;
}

export interface FoodItem {
  id: string;
  name: string;
  name_hi: string;
  scientific_name: string;
  image_url: string;
  category: string;
  thermal_effect: 'cooling' | 'neutral' | 'heating';
  best_for_temp_range: [number, number];
  best_time_of_day: string[];
  availability_months: number[];
  regions: string[];
  is_vegetarian: boolean;
  is_vegan: boolean;
  allergens: string[];
  tags: string[];
  nutrition_per_100g: NutritionInfo;
  why_recommended_in_summer: string;
  properties: Record<string, any>;
  preparation: {
    method: string;
    prep_time_min: number;
    steps: string[];
    storage_tip: string;
    serving_suggestion: string;
  };
  data_sources: DataSource[];
}

export interface DrinkItem {
  id: string;
  name: string;
  name_hi: string;
  scientific_name: string;
  image_url: string;
  category: string;
  thermal_effect: 'cooling' | 'neutral' | 'heating';
  calories_per_serving: number;
  serving_size_ml: number;
  hydration_score: number;
  electrolyte_restoration: string;
  best_for_temp_range: [number, number];
  best_time_of_day: string[];
  why_recommended_in_summer: string;
  properties: Record<string, any>;
  preparation: {
    method: string;
    prep_time_min: number;
    ingredients: { item: string; quantity: string; notes: string }[];
    steps: string[];
    storage_tip: string;
    variations?: Record<string, string>;
  };
  data_sources: DataSource[];
}

export interface AvoidItem {
  id: string;
  name: string;
  name_hi: string;
  image_url: string;
  category: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  why_to_avoid: string;
  alternatives: string[];
  data_sources: DataSource[];
}

export interface DataSource {
  type: string;
  name: string;
  reference: string;
}

// ---- Hydration ----
export interface HydrationLog {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
}

export interface HydrationDay {
  date: string;
  total_ml: number;
  target_ml: number;
  logs: HydrationLog[];
}

// ---- Daily Planner ----
export type TimeBlockSafety = 'safe' | 'caution' | 'danger' | 'extreme';

export interface TimeBlock {
  start_hour: number;
  end_hour: number;
  safety: TimeBlockSafety;
  label: string;
  recommendation: string;
}
