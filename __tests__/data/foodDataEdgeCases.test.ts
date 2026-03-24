/**
 * Food Data — Edge Case & Integrity Tests
 *
 * Deep validation of the bundled database to ensure
 * no data issues surface during a demo.
 */

import {
  getAllFoods,
  getAllDrinks,
  getFoodsToAvoid,
  getFoodsForTemp,
  getDrinksForTemp,
  getRecommendations,
  getVegetarianFoods,
  getVeganFoods,
  getQuickDrinks,
  getHydrationRules,
  getMealPlan,
} from '@/data/foodData';

describe('Food Data Integrity', () => {
  it('every food has a valid image URL', () => {
    getAllFoods().forEach((food) => {
      expect(food.image_url).toMatch(/^https?:\/\//);
    });
  });

  it('every drink has a valid image URL', () => {
    getAllDrinks().forEach((drink) => {
      expect(drink.image_url).toMatch(/^https?:\/\//);
    });
  });

  it('every avoid item has a valid image URL', () => {
    getFoodsToAvoid().forEach((item) => {
      expect(item.image_url).toMatch(/^https?:\/\//);
    });
  });

  it('every food has at least one data source', () => {
    getAllFoods().forEach((food) => {
      expect(food.data_sources.length).toBeGreaterThan(0);
      food.data_sources.forEach((src) => {
        expect(src.type).toBeTruthy();
        expect(src.name).toBeTruthy();
        expect(src.reference).toBeTruthy();
      });
    });
  });

  it('every drink has at least one data source', () => {
    getAllDrinks().forEach((drink) => {
      expect(drink.data_sources.length).toBeGreaterThan(0);
    });
  });

  it('every food has Hindi name', () => {
    getAllFoods().forEach((food) => {
      expect(food.name_hi).toBeTruthy();
      expect(food.name_hi.length).toBeGreaterThan(0);
    });
  });

  it('every drink has preparation steps', () => {
    getAllDrinks().forEach((drink) => {
      expect(drink.preparation.steps.length).toBeGreaterThan(0);
    });
  });

  it('no food has negative calories', () => {
    getAllFoods().forEach((food) => {
      if (food.nutrition_per_100g) {
        expect(food.nutrition_per_100g.energy_kcal).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it('all thermal effects are cooling', () => {
    getAllFoods().forEach((food) => {
      expect(food.thermal_effect).toBe('cooling');
    });
  });
});

describe('Food Data Temperature Boundaries', () => {
  it('returns foods for exactly 30°C (lower boundary)', () => {
    const foods = getFoodsForTemp(30);
    expect(foods.length).toBeGreaterThan(0);
  });

  it('returns foods for exactly 50°C (upper boundary)', () => {
    const foods = getFoodsForTemp(50);
    expect(foods.length).toBeGreaterThan(0);
  });

  it('returns drinks for exactly 30°C', () => {
    const drinks = getDrinksForTemp(30);
    expect(drinks.length).toBeGreaterThan(0);
  });

  it('returns drinks for exactly 50°C', () => {
    const drinks = getDrinksForTemp(50);
    expect(drinks.length).toBeGreaterThan(0);
  });

  it('handles 0°C without crashing', () => {
    const foods = getFoodsForTemp(0);
    expect(Array.isArray(foods)).toBe(true);
  });

  it('handles 60°C without crashing', () => {
    const foods = getFoodsForTemp(60);
    expect(Array.isArray(foods)).toBe(true);
  });
});

describe('Dietary Filters', () => {
  it('vegetarian foods exist', () => {
    const veg = getVegetarianFoods();
    expect(veg.length).toBeGreaterThan(0);
    veg.forEach((f) => expect(f.is_vegetarian).toBe(true));
  });

  it('vegan foods exist', () => {
    const vegan = getVeganFoods();
    expect(vegan.length).toBeGreaterThan(0);
    vegan.forEach((f) => expect(f.is_vegan).toBe(true));
  });

  it('all vegan foods are also vegetarian', () => {
    const vegan = getVeganFoods();
    vegan.forEach((f) => expect(f.is_vegetarian).toBe(true));
  });
});

describe('Quick Drinks', () => {
  it('all quick drinks have prep time <= 5 min', () => {
    const quick = getQuickDrinks();
    expect(quick.length).toBeGreaterThan(0);
    quick.forEach((d) => {
      expect(d.preparation.prep_time_min).toBeLessThanOrEqual(5);
    });
  });
});

describe('Recommendations — Investor Demo Scenarios', () => {
  it('Delhi at 45°C afternoon — returns food, drinks, and avoids', () => {
    const recs = getRecommendations({ tempC: 45, timeOfDay: 'afternoon' });
    expect(recs.foods.length).toBeGreaterThan(0);
    expect(recs.drinks.length).toBeGreaterThan(0);
    expect(recs.avoids.length).toBeGreaterThan(0);
    expect(recs.mealPlan).toBeDefined();
  });

  it('Mumbai at 35°C morning — returns recommendations', () => {
    const recs = getRecommendations({ tempC: 35, timeOfDay: 'morning' });
    expect(recs.foods.length).toBeGreaterThan(0);
    expect(recs.drinks.length).toBeGreaterThan(0);
  });

  it('Shimla at 25°C evening — still returns results (not empty)', () => {
    const recs = getRecommendations({ tempC: 25, timeOfDay: 'evening' });
    // Even cool weather should return some recommendations
    expect(recs.avoids.length).toBeGreaterThan(0);
  });

  it('vegetarian filter works in recommendations', () => {
    const recs = getRecommendations({ tempC: 42, timeOfDay: 'afternoon', isVegetarian: true });
    recs.foods.forEach((f) => expect(f.is_vegetarian).toBe(true));
  });

  it('meal plan returned for extreme heat', () => {
    const plan = getMealPlan(46);
    expect(plan).toBeDefined();
    expect(plan.breakfast).toBeDefined();
    expect(plan.lunch).toBeDefined();
    expect(plan.snack).toBeDefined();
    expect(plan.dinner).toBeDefined();
  });

  it('meal plan returned for moderate heat', () => {
    const plan = getMealPlan(33);
    expect(plan).toBeDefined();
  });
});

describe('Hydration Rules', () => {
  it('base rate is 35ml per kg', () => {
    const rules = getHydrationRules();
    expect(rules.base_water_ml_per_kg).toBe(35);
  });

  it('temperature multipliers increase with heat', () => {
    const rules = getHydrationRules();
    const multipliers = rules.temperature_multipliers;
    expect(multipliers['below_30']).toBeLessThan(multipliers['30_to_37']);
    expect(multipliers['30_to_37']).toBeLessThan(multipliers['37_to_42']);
    expect(multipliers['37_to_42']).toBeLessThan(multipliers['above_42']);
  });

  it('reminder intervals decrease with heat', () => {
    const rules = getHydrationRules();
    const intervals = rules.reminder_intervals_min;
    expect(intervals['below_35']).toBeGreaterThan(intervals['35_to_40']);
    expect(intervals['35_to_40']).toBeGreaterThan(intervals['40_to_45']);
    expect(intervals['40_to_45']).toBeGreaterThan(intervals['above_45']);
  });
});
