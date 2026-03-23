/**
 * Food & Drink Data Service
 *
 * Provides typed access to the bundled JSON database.
 * All data is local — no network calls needed.
 *
 * Usage:
 *   import { getCoolingFoods, getDrinksForTemp, getFoodsToAvoid } from '@/data/foodData';
 */

import type { FoodItem, DrinkItem, AvoidItem } from '@/types';
import rawData from './foodDrinks.json';

// ---- Type the raw JSON ----
interface FoodDrinkDB {
  foods: FoodItem[];
  drinks: DrinkItem[];
  foods_to_avoid: AvoidItem[];
  hydration_rules: {
    base_water_ml_per_kg: number;
    temperature_multipliers: Record<string, number>;
    activity_multipliers: Record<string, number>;
    reminder_intervals_min: Record<string, number>;
  };
  meal_plans: Record<string, any>;
}

const db = rawData as unknown as FoodDrinkDB;

// ---- FOODS ----

/** Get all cooling foods */
export function getAllFoods(): FoodItem[] {
  return db.foods;
}

/** Get foods recommended for a specific temperature */
export function getFoodsForTemp(tempC: number): FoodItem[] {
  return db.foods.filter(
    (f) => tempC >= f.best_for_temp_range[0] && tempC <= f.best_for_temp_range[1]
  );
}

/** Get foods suitable for a specific time of day */
export function getFoodsForTime(timeOfDay: 'morning' | 'afternoon' | 'evening'): FoodItem[] {
  return db.foods.filter((f) => f.best_time_of_day.includes(timeOfDay));
}

/** Get foods by tag (e.g., 'hydrating', 'no-cook', 'quick-snack') */
export function getFoodsByTag(tag: string): FoodItem[] {
  return db.foods.filter((f) => f.tags.includes(tag));
}

/** Get a single food by ID */
export function getFoodById(id: string): FoodItem | undefined {
  return db.foods.find((f) => f.id === id);
}

/** Get vegetarian-only foods */
export function getVegetarianFoods(): FoodItem[] {
  return db.foods.filter((f) => f.is_vegetarian);
}

/** Get vegan-only foods */
export function getVeganFoods(): FoodItem[] {
  return db.foods.filter((f) => f.is_vegan);
}

// ---- DRINKS ----

/** Get all cooling drinks */
export function getAllDrinks(): DrinkItem[] {
  return db.drinks;
}

/** Get drinks recommended for a specific temperature */
export function getDrinksForTemp(tempC: number): DrinkItem[] {
  return db.drinks.filter(
    (d) => tempC >= d.best_for_temp_range[0] && tempC <= d.best_for_temp_range[1]
  );
}

/** Get drinks sorted by hydration score (best first) */
export function getDrinksByHydration(): DrinkItem[] {
  return [...db.drinks].sort((a, b) => b.hydration_score - a.hydration_score);
}

/** Get drinks suitable for a specific time of day */
export function getDrinksForTime(timeOfDay: 'morning' | 'afternoon' | 'evening'): DrinkItem[] {
  return db.drinks.filter((d) => d.best_time_of_day.includes(timeOfDay));
}

/** Get a single drink by ID */
export function getDrinkById(id: string): DrinkItem | undefined {
  return db.drinks.find((d) => d.id === id);
}

/** Get quick drinks (prep time <= 5 min) */
export function getQuickDrinks(): DrinkItem[] {
  return db.drinks.filter((d) => d.preparation.prep_time_min <= 5);
}

// ---- FOODS TO AVOID ----

/** Get all foods to avoid */
export function getFoodsToAvoid(): AvoidItem[] {
  return db.foods_to_avoid;
}

/** Get critical items to avoid (severity = critical or high) */
export function getCriticalAvoids(): AvoidItem[] {
  return db.foods_to_avoid.filter(
    (a) => a.severity === 'critical' || a.severity === 'high'
  );
}

// ---- SMART RECOMMENDATIONS ----

/**
 * Get personalized food + drink recommendations based on current conditions
 * This is the main function the home screen will call.
 */
export function getRecommendations(params: {
  tempC: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  isVegetarian?: boolean;
}) {
  const { tempC, timeOfDay, isVegetarian = true } = params;

  // Filter foods by temp + time + diet
  let foods = db.foods.filter(
    (f) =>
      tempC >= f.best_for_temp_range[0] &&
      tempC <= f.best_for_temp_range[1] &&
      f.best_time_of_day.includes(timeOfDay) &&
      (isVegetarian ? f.is_vegetarian : true)
  );

  // Filter drinks by temp + time
  let drinks = db.drinks.filter(
    (d) =>
      tempC >= d.best_for_temp_range[0] &&
      tempC <= d.best_for_temp_range[1] &&
      d.best_time_of_day.includes(timeOfDay)
  );

  // Sort drinks by hydration score
  drinks.sort((a, b) => b.hydration_score - a.hydration_score);

  // Get avoids — show critical ones first
  const avoids = [...db.foods_to_avoid].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Get meal plan for current temperature
  let mealPlanKey = 'moderate_heat_30_37';
  if (tempC >= 42) mealPlanKey = 'extreme_heat_42_plus';
  else if (tempC >= 37) mealPlanKey = 'hot_37_42';
  const mealPlan = db.meal_plans[mealPlanKey] || null;

  return {
    foods: foods.slice(0, 5),        // Top 5 food picks
    drinks: drinks.slice(0, 4),      // Top 4 drink picks
    avoids: avoids.slice(0, 3),      // Top 3 avoids
    mealPlan,
    totalFoodsAvailable: foods.length,
    totalDrinksAvailable: drinks.length,
  };
}

// ---- HYDRATION RULES ----

/** Get the hydration rules from the database */
export function getHydrationRules() {
  return db.hydration_rules;
}

// ---- MEAL PLANS ----

/** Get meal plan for a temperature range */
export function getMealPlan(tempC: number) {
  if (tempC >= 42) return db.meal_plans['extreme_heat_42_plus'] || null;
  if (tempC >= 37) return db.meal_plans['hot_37_42'] || null;
  return db.meal_plans['moderate_heat_30_37'] || null;
}
