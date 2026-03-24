/**
 * Daily Plan Generator
 *
 * Generates time blocks with safety levels, recommendations,
 * and suggested activities based on the current temperature.
 */

type Safety = 'safe' | 'caution' | 'danger' | 'extreme';

export interface PlanBlock {
  startHour: number;
  endHour: number;
  safety: Safety;
  label: string;
  recommendation: string;
  activities: string[];
}

/**
 * Generate a full day plan based on feels-like temperature
 */
export function generateDailyPlan(feelsLikeC: number): PlanBlock[] {
  if (feelsLikeC >= 45) return getExtremePlan();
  if (feelsLikeC >= 40) return getHotPlan();
  if (feelsLikeC >= 35) return getWarmPlan();
  return getMildPlan();
}

function getExtremePlan(): PlanBlock[] {
  return [
    {
      startHour: 5,
      endHour: 7,
      safety: 'safe',
      label: 'Early morning window',
      recommendation: 'Only safe time for outdoor activity. Step out now if needed — carry water.',
      activities: ['Walk', 'Exercise', 'Market run', 'Errands'],
    },
    {
      startHour: 7,
      endHour: 9,
      safety: 'caution',
      label: 'Morning — heat rising',
      recommendation: 'Head back indoors. Temperature climbing fast. Finish outdoor tasks.',
      activities: ['Quick errands only', 'Hydrate'],
    },
    {
      startHour: 9,
      endHour: 11,
      safety: 'danger',
      label: 'Mid-morning — dangerous',
      recommendation: 'Stay indoors. UV index rising. Drink water every 30 minutes.',
      activities: ['Indoor work', 'Hydrate', 'Light breakfast'],
    },
    {
      startHour: 11,
      endHour: 16,
      safety: 'extreme',
      label: 'Peak heat — EXTREME DANGER',
      recommendation: 'Do NOT go outside. Feels like 48°C+. Risk of heatstroke within 15 minutes of exposure. Hydrate every 20 minutes.',
      activities: ['Stay indoors', 'Rest', 'Hydrate constantly'],
    },
    {
      startHour: 16,
      endHour: 18,
      safety: 'danger',
      label: 'Late afternoon — still dangerous',
      recommendation: 'Heat is subsiding but still dangerous. Continue staying indoors if possible.',
      activities: ['Indoor work', 'Light snack', 'Hydrate'],
    },
    {
      startHour: 18,
      endHour: 20,
      safety: 'caution',
      label: 'Evening — cooling down',
      recommendation: 'Can step out briefly. Carry water. Avoid heavy physical activity.',
      activities: ['Short walk', 'Evening market', 'Light exercise'],
    },
    {
      startHour: 20,
      endHour: 23,
      safety: 'safe',
      label: 'Night — safe',
      recommendation: 'Safe to be outside. Good time for walks, socializing, and errands.',
      activities: ['Walk', 'Dinner out', 'Socializing'],
    },
    {
      startHour: 23,
      endHour: 5,
      safety: 'safe',
      label: 'Late night — sleep',
      recommendation: 'Open windows for cross-ventilation. Use wet cotton sheet if no AC. Stay hydrated before bed.',
      activities: ['Sleep', 'Rest', 'Night ventilation'],
    },
  ];
}

function getHotPlan(): PlanBlock[] {
  return [
    {
      startHour: 5,
      endHour: 8,
      safety: 'safe',
      label: 'Early morning',
      recommendation: 'Best time for outdoor activity. Exercise, walk, or run errands now.',
      activities: ['Exercise', 'Walk', 'Errands', 'Market'],
    },
    {
      startHour: 8,
      endHour: 10,
      safety: 'caution',
      label: 'Late morning — heating up',
      recommendation: 'Wrap up outdoor tasks. Heat is building. Stay in shade if outside.',
      activities: ['Finish errands', 'Hydrate', 'Move indoors'],
    },
    {
      startHour: 10,
      endHour: 16,
      safety: 'danger',
      label: 'Peak heat — avoid outdoors',
      recommendation: 'Stay indoors. Feels like 42°C+. Drink water every 30 min. Eat light cooling foods.',
      activities: ['Indoor work', 'Curd rice for lunch', 'Rest', 'Hydrate'],
    },
    {
      startHour: 16,
      endHour: 18,
      safety: 'caution',
      label: 'Late afternoon',
      recommendation: 'Heat subsiding. Can step out briefly with water and sun protection.',
      activities: ['Quick errands', 'Hydrate', 'Buttermilk'],
    },
    {
      startHour: 18,
      endHour: 21,
      safety: 'safe',
      label: 'Evening — safe window',
      recommendation: 'Good time for outdoor activities, walks, and errands.',
      activities: ['Walk', 'Exercise', 'Market', 'Socializing'],
    },
    {
      startHour: 21,
      endHour: 5,
      safety: 'safe',
      label: 'Night',
      recommendation: 'Ventilate your room. Have a light dinner. Stay hydrated before sleep.',
      activities: ['Dinner', 'Sleep', 'Ventilation'],
    },
  ];
}

function getWarmPlan(): PlanBlock[] {
  return [
    {
      startHour: 5,
      endHour: 9,
      safety: 'safe',
      label: 'Morning',
      recommendation: 'Great time for all outdoor activities. Carry water.',
      activities: ['Exercise', 'Walk', 'Commute', 'Errands'],
    },
    {
      startHour: 9,
      endHour: 11,
      safety: 'safe',
      label: 'Late morning',
      recommendation: 'Still comfortable. Good for commuting and outdoor work.',
      activities: ['Work', 'Commute', 'Outdoor tasks'],
    },
    {
      startHour: 11,
      endHour: 15,
      safety: 'caution',
      label: 'Midday — warm',
      recommendation: 'Getting warm. Limit intense outdoor activity. Stay hydrated.',
      activities: ['Light indoor work', 'Lunch', 'Hydrate'],
    },
    {
      startHour: 15,
      endHour: 18,
      safety: 'safe',
      label: 'Afternoon',
      recommendation: 'Heat subsiding. Fine for outdoor activity with water.',
      activities: ['Errands', 'Walking', 'Sports'],
    },
    {
      startHour: 18,
      endHour: 5,
      safety: 'safe',
      label: 'Evening & night',
      recommendation: 'Comfortable. Enjoy the evening.',
      activities: ['Everything', 'Walk', 'Dinner', 'Exercise'],
    },
  ];
}

function getMildPlan(): PlanBlock[] {
  return [
    {
      startHour: 5,
      endHour: 11,
      safety: 'safe',
      label: 'Morning',
      recommendation: 'Pleasant weather. All activities are fine. Stay hydrated as usual.',
      activities: ['All activities'],
    },
    {
      startHour: 11,
      endHour: 16,
      safety: 'safe',
      label: 'Midday',
      recommendation: 'Comfortable temperature. Carry water if outdoors for long periods.',
      activities: ['All activities'],
    },
    {
      startHour: 16,
      endHour: 5,
      safety: 'safe',
      label: 'Evening & night',
      recommendation: 'Great weather. Enjoy!',
      activities: ['All activities'],
    },
  ];
}
