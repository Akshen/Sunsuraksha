/**
 * Food & Drink Data Service Tests
 *
 * Validates the bundled database loads correctly
 * and all query functions return expected results.
 */

import {
  getAllFoods,
  getAllDrinks,
  getFoodsToAvoid,
  getFoodsForTemp,
  getDrinksForTemp,
  getDrinksByHydration,
  getFoodsByTag,
  getFoodById,
  getDrinkById,
  getCriticalAvoids,
  getQuickDrinks,
  getRecommendations,
  getHydrationRules,
  getMealPlan,
} from '@/data/foodData';

describe('Food Database', () => {
  it('loads all foods', () => {
    const foods = getAllFoods();
    expect(foods.length).toBeGreaterThan(0);
  });

  it('every food has required fields', () => {
    const foods = getAllFoods();
    foods.forEach((food) => {
      expect(food.id).toBeTruthy();
      expect(food.name).toBeTruthy();
      expect(food.name_hi).toBeTruthy();
      expect(food.image_url).toBeTruthy();
      expect(food.thermal_effect).toBe('cooling');
      expect(food.why_recommended_in_summer).toBeTruthy();
      expect(food.data_sources.length).toBeGreaterThan(0);
    });
  });

  it('filters foods by temperature', () => {
    const hot = getFoodsForTemp(42);
    expect(hot.length).toBeGreaterThan(0);
    hot.forEach((f) => {
      expect(42).toBeGreaterThanOrEqual(f.best_for_temp_range[0]);
      expect(42).toBeLessThanOrEqual(f.best_for_temp_range[1]);
    });
  });

  it('finds food by ID', () => {
    const food = getFoodById('food_001');
    expect(food).toBeDefined();
    expect(food?.name).toBe('Watermelon');
  });

  it('returns undefined for invalid food ID', () => {
    expect(getFoodById('invalid_id')).toBeUndefined();
  });

  it('filters foods by tag', () => {
    const hydrating = getFoodsByTag('hydrating');
    expect(hydrating.length).toBeGreaterThan(0);
    hydrating.forEach((f) => {
      expect(f.tags).toContain('hydrating');
    });
  });
});

describe('Drink Database', () => {
  it('loads all drinks', () => {
    const drinks = getAllDrinks();
    expect(drinks.length).toBeGreaterThan(0);
  });

  it('every drink has required fields', () => {
    const drinks = getAllDrinks();
    drinks.forEach((drink) => {
      expect(drink.id).toBeTruthy();
      expect(drink.name).toBeTruthy();
      expect(drink.image_url).toBeTruthy();
      expect(drink.hydration_score).toBeGreaterThan(0);
      expect(drink.why_recommended_in_summer).toBeTruthy();
      expect(drink.data_sources.length).toBeGreaterThan(0);
    });
  });

  it('sorts drinks by hydration score', () => {
    const sorted = getDrinksByHydration();
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].hydration_score).toBeGreaterThanOrEqual(
        sorted[i].hydration_score
      );
    }
  });

  it('finds drink by ID', () => {
    const drink = getDrinkById('drink_001');
    expect(drink).toBeDefined();
    expect(drink?.name).toContain('Nimbu Pani');
  });

  it('filters quick drinks (prep <= 5 min)', () => {
    const quick = getQuickDrinks();
    quick.forEach((d) => {
      expect(d.preparation.prep_time_min).toBeLessThanOrEqual(5);
    });
  });
});

describe('Foods to Avoid', () => {
  it('loads all avoids', () => {
    const avoids = getFoodsToAvoid();
    expect(avoids.length).toBeGreaterThan(0);
  });

  it('every avoid has required fields', () => {
    const avoids = getFoodsToAvoid();
    avoids.forEach((a) => {
      expect(a.id).toBeTruthy();
      expect(a.name).toBeTruthy();
      expect(a.why_to_avoid).toBeTruthy();
      expect(a.alternatives.length).toBeGreaterThan(0);
      expect(a.data_sources.length).toBeGreaterThan(0);
    });
  });

  it('filters critical avoids', () => {
    const critical = getCriticalAvoids();
    critical.forEach((a) => {
      expect(['critical', 'high']).toContain(a.severity);
    });
  });
});

describe('Smart Recommendations', () => {
  it('returns food + drink + avoid recommendations', () => {
    const recs = getRecommendations({
      tempC: 40,
      timeOfDay: 'afternoon',
    });
    expect(recs.foods.length).toBeGreaterThan(0);
    expect(recs.drinks.length).toBeGreaterThan(0);
    expect(recs.avoids.length).toBeGreaterThan(0);
  });

  it('returns meal plan based on temperature', () => {
    const recs = getRecommendations({
      tempC: 44,
      timeOfDay: 'afternoon',
    });
    expect(recs.mealPlan).toBeDefined();
  });

  it('caps results to reasonable limits', () => {
    const recs = getRecommendations({
      tempC: 38,
      timeOfDay: 'morning',
    });
    expect(recs.foods.length).toBeLessThanOrEqual(5);
    expect(recs.drinks.length).toBeLessThanOrEqual(4);
    expect(recs.avoids.length).toBeLessThanOrEqual(3);
  });
});

describe('Hydration Rules', () => {
  it('returns hydration rules', () => {
    const rules = getHydrationRules();
    expect(rules.base_water_ml_per_kg).toBe(35);
    expect(rules.temperature_multipliers).toBeDefined();
    expect(rules.activity_multipliers).toBeDefined();
  });
});

describe('Meal Plans', () => {
  it('returns moderate heat plan', () => {
    const plan = getMealPlan(35);
    expect(plan).toBeDefined();
    expect(plan.breakfast).toBeDefined();
    expect(plan.lunch).toBeDefined();
  });

  it('returns extreme heat plan', () => {
    const plan = getMealPlan(45);
    expect(plan).toBeDefined();
  });

  it('returns hot plan for 40°C', () => {
    const plan = getMealPlan(40);
    expect(plan).toBeDefined();
  });
});
