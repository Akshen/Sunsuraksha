/**
 * Food Database Tests — 38 items
 *
 * Validates the expanded food/drink/avoid database.
 */

import {
  getAllFoods,
  getAllDrinks,
  getFoodsToAvoid,
  getFoodsForTemp,
  getDrinksForTemp,
  getFoodById,
  getDrinkById,
  getCriticalAvoids,
  getRecommendations,
  getMealPlan,
  getHydrationRules,
  getVegetarianFoods,
  getDrinksByHydration,
} from '@/data/foodData';

describe('Food Database — Expanded', () => {
  it('loads 17 foods', () => {
    expect(getAllFoods().length).toBe(17);
  });

  it('every food has required fields', () => {
    getAllFoods().forEach((f) => {
      expect(f.id).toMatch(/^food_\d{3}$/);
      expect(f.name).toBeTruthy();
      expect(f.name_hi).toBeTruthy();
      expect(f.thermal_effect).toBe('cooling');
      expect(f.best_for_temp_range.length).toBe(2);
      expect(f.best_time_of_day.length).toBeGreaterThan(0);
      expect(f.nutrition_per_100g).toBeDefined();
      expect(f.why_recommended_in_summer.length).toBeGreaterThan(50);
      expect(f.preparation).toBeDefined();
      expect(f.data_sources.length).toBeGreaterThan(0);
    });
  });

  it('new foods exist: ash gourd, yogurt, raw onion, bael, mint, kairi, sugarcane', () => {
    expect(getFoodById('food_011')?.name).toBe('Ash Gourd');
    expect(getFoodById('food_012')?.name).toBe('Yogurt / Curd');
    expect(getFoodById('food_013')?.name).toBe('Raw Onion');
    expect(getFoodById('food_014')?.name).toBe('Bael Fruit');
    expect(getFoodById('food_015')?.name).toBe('Mint Leaves');
    expect(getFoodById('food_016')?.name).toContain('Kairi');
    expect(getFoodById('food_017')?.name).toBe('Sugarcane');
  });

  it('filters foods by temperature', () => {
    const hot = getFoodsForTemp(45);
    expect(hot.length).toBeGreaterThan(5);
  });

  it('all foods are vegetarian', () => {
    const veg = getVegetarianFoods();
    expect(veg.length).toBe(getAllFoods().length);
  });
});

describe('Drink Database — Expanded', () => {
  it('loads 12 drinks', () => {
    expect(getAllDrinks().length).toBe(12);
  });

  it('every drink has required fields', () => {
    getAllDrinks().forEach((d) => {
      expect(d.id).toMatch(/^drink_\d{3}$/);
      expect(d.name).toBeTruthy();
      expect(d.hydration_score).toBeGreaterThan(0);
      expect(d.hydration_score).toBeLessThanOrEqual(100);
      expect(d.serving_size_ml).toBeGreaterThan(0);
      expect(d.why_recommended_in_summer.length).toBeGreaterThan(50);
    });
  });

  it('new drinks exist: jaljeera, kokum, bael, thandai, khus, sugarcane juice', () => {
    expect(getDrinkById('drink_007')?.name).toBe('Jaljeera');
    expect(getDrinkById('drink_008')?.name).toBe('Kokum Sharbat');
    expect(getDrinkById('drink_009')?.name).toBe('Bael Sharbat');
    expect(getDrinkById('drink_010')?.name).toBe('Thandai');
    expect(getDrinkById('drink_011')?.name).toBe('Khus Sharbat');
    expect(getDrinkById('drink_012')?.name).toBe('Sugarcane Juice');
  });

  it('sorts drinks by hydration score', () => {
    const sorted = getDrinksByHydration();
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].hydration_score).toBeGreaterThanOrEqual(sorted[i].hydration_score);
    }
  });
});

describe('Foods to Avoid — Expanded', () => {
  it('loads 9 avoids', () => {
    expect(getFoodsToAvoid().length).toBe(9);
  });

  it('every avoid has required fields', () => {
    getFoodsToAvoid().forEach((a) => {
      expect(a.id).toMatch(/^avoid_\d{3}$/);
      expect(a.name).toBeTruthy();
      expect(['critical', 'high', 'moderate', 'low']).toContain(a.severity);
      expect(a.why_to_avoid.length).toBeGreaterThan(50);
      expect(a.alternatives.length).toBeGreaterThan(0);
    });
  });

  it('new avoids exist: ice cream, soft drinks, red meat, leftover food', () => {
    const avoids = getFoodsToAvoid();
    const names = avoids.map((a) => a.name);
    expect(names).toContain('Ice Cream & Ice-Cold Water');
    expect(names).toContain('Carbonated Soft Drinks');
    expect(names).toContain('Excess Red Meat & Eggs');
    expect(names).toContain('Leftover / Reheated Food');
  });

  it('leftover food is critical severity', () => {
    const avoids = getFoodsToAvoid();
    const leftover = avoids.find((a) => a.id === 'avoid_009');
    expect(leftover?.severity).toBe('critical');
  });

  it('critical avoids include at least 2 items', () => {
    const critical = getCriticalAvoids();
    expect(critical.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Smart Recommendations', () => {
  it('returns food + drink + avoid recommendations', () => {
    const rec = getRecommendations({ tempC: 42, timeOfDay: 'afternoon' });
    expect(rec.foods.length).toBeGreaterThan(0);
    expect(rec.drinks.length).toBeGreaterThan(0);
    expect(rec.avoids.length).toBeGreaterThan(0);
  });

  it('returns more results at higher temperatures', () => {
    const mild = getRecommendations({ tempC: 32, timeOfDay: 'afternoon' });
    const hot = getRecommendations({ tempC: 45, timeOfDay: 'afternoon' });
    expect(hot.totalFoodsAvailable).toBeGreaterThanOrEqual(mild.totalFoodsAvailable);
  });
});

describe('Meal Plans', () => {
  it('returns moderate heat plan', () => {
    const plan = getMealPlan(33);
    expect(plan).toBeDefined();
    expect(plan.breakfast.length).toBeGreaterThan(0);
  });

  it('returns extreme heat plan', () => {
    const plan = getMealPlan(45);
    expect(plan).toBeDefined();
    expect(plan.lunch.length).toBeGreaterThan(0);
  });

  it('returns hot plan for 40°C', () => {
    const plan = getMealPlan(40);
    expect(plan).toBeDefined();
  });
});

describe('Hydration Rules', () => {
  it('returns hydration rules', () => {
    const rules = getHydrationRules();
    expect(rules.base_water_ml_per_kg).toBeGreaterThan(0);
    expect(rules.temperature_multipliers).toBeDefined();
  });
});

describe('Data Quality', () => {
  it('all items have image URLs', () => {
    getAllFoods().forEach((f) => {
      expect(f.image_url).toMatch(/^https?:\/\//);
    });
    getAllDrinks().forEach((d) => {
      expect(d.image_url).toMatch(/^https?:\/\//);
    });
    getFoodsToAvoid().forEach((a) => {
      expect(a.image_url).toMatch(/^https?:\/\//);
    });
  });

  it('all items have Hindi names', () => {
    getAllFoods().forEach((f) => expect(f.name_hi.length).toBeGreaterThan(0));
    getAllDrinks().forEach((d) => expect(d.name_hi.length).toBeGreaterThan(0));
    getFoodsToAvoid().forEach((a) => expect(a.name_hi.length).toBeGreaterThan(0));
  });

  it('no duplicate IDs across entire database', () => {
    const allIds = [
      ...getAllFoods().map((f) => f.id),
      ...getAllDrinks().map((d) => d.id),
      ...getFoodsToAvoid().map((a) => a.id),
    ];
    const unique = new Set(allIds);
    expect(unique.size).toBe(allIds.length);
  });

  it('total items = 38', () => {
    const total = getAllFoods().length + getAllDrinks().length + getFoodsToAvoid().length;
    expect(total).toBe(38);
  });
});
