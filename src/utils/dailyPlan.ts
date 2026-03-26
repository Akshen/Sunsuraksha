/**
 * Daily Plan Generator v2
 *
 * Improvements over v1:
 * - Uses sinusoidal temperature curve (same model as HourlyTimeline)
 * - Factors in humidity for heat index per time block
 * - Dynamic recommendations that include actual temperature values
 * - Drink suggestions per block from our database
 * - Clothing tips per block
 */

type Safety = 'safe' | 'caution' | 'danger' | 'extreme';

export interface PlanBlock {
  startHour: number;
  endHour: number;
  safety: Safety;
  label: string;
  recommendation: string;
  activities: string[];
  drinkTip?: string;
  clothingTip?: string;
  estTempRange?: string;
}

// ---- Temperature curve (mirrors HourlyTimeline) ----

function estimateTempAtHour(hour: number, feelsLikeC: number): number {
  const peakHour = 14;
  const offset = ((hour - peakHour) / 24) * 2 * Math.PI;
  const factor = Math.cos(offset);
  const nightRatio = 0.65;
  const midpoint = feelsLikeC * ((1 + nightRatio) / 2);
  const amplitude = feelsLikeC * ((1 - nightRatio) / 2);
  return midpoint + amplitude * factor;
}

function computeHeatIndex(tempC: number, humidity: number): number {
  if (tempC < 27 || humidity < 40) return tempC;
  return tempC + ((humidity - 40) / 10) * 1.5;
}

function getSafety(heatIndex: number): Safety {
  if (heatIndex >= 47) return 'extreme';
  if (heatIndex >= 40) return 'danger';
  if (heatIndex >= 33) return 'caution';
  return 'safe';
}

// ---- Block definitions ----

interface TimeSlot {
  startHour: number;
  endHour: number;
  label: string;
}

const TIME_SLOTS: TimeSlot[] = [
  { startHour: 5, endHour: 7, label: 'Early morning' },
  { startHour: 7, endHour: 9, label: 'Morning' },
  { startHour: 9, endHour: 11, label: 'Late morning' },
  { startHour: 11, endHour: 14, label: 'Midday' },
  { startHour: 14, endHour: 17, label: 'Afternoon' },
  { startHour: 17, endHour: 19, label: 'Evening' },
  { startHour: 19, endHour: 22, label: 'Night' },
  { startHour: 22, endHour: 5, label: 'Late night' },
];

// ---- Recommendations by safety ----

function getRecommendation(safety: Safety, label: string, avgTemp: number): string {
  const temp = Math.round(avgTemp);

  switch (safety) {
    case 'extreme':
      return `EXTREME DANGER (~${temp}°C). Do NOT go outside. Heatstroke risk within 15 min. Hydrate every 20 min. Close curtains and use fans/AC.`;
    case 'danger':
      return `Dangerous heat (~${temp}°C). Stay indoors if possible. If you must go out, carry water, cover your head, and limit exposure to 15 min. Drink water every 30 min.`;
    case 'caution':
      return `Warm (~${temp}°C). Limit intense outdoor activity. Carry a water bottle. Wear light, loose cotton clothes. Take shade breaks.`;
    case 'safe':
      if (label.includes('night') || label.includes('Night')) {
        return `Comfortable (~${temp}°C). Good for walks and outdoor activities. Open windows for cross-ventilation. Stay hydrated before bed.`;
      }
      return `Pleasant (~${temp}°C). Great time for outdoor activity — exercise, walk, errands. Carry water and wear sunscreen.`;
  }
}

function getActivities(safety: Safety, label: string): string[] {
  switch (safety) {
    case 'extreme':
      return ['Stay indoors', 'Rest', 'Hydrate constantly'];
    case 'danger':
      return ['Indoor work only', 'Light meals', 'Hydrate every 30 min'];
    case 'caution':
      if (label.includes('morning') || label.includes('Morning')) {
        return ['Finish errands', 'Move indoors', 'Hydrate'];
      }
      if (label.includes('Evening') || label.includes('Afternoon')) {
        return ['Short walk with water', 'Quick errands', 'Hydrate'];
      }
      return ['Light activity', 'Stay in shade', 'Hydrate'];
    case 'safe':
      if (label.includes('Early morning')) {
        return ['Exercise', 'Walk', 'Yoga', 'Market run'];
      }
      if (label.includes('night') || label.includes('Night')) {
        return ['Walk', 'Dinner', 'Socializing', 'Sleep prep'];
      }
      return ['All activities OK', 'Walk', 'Exercise', 'Errands'];
  }
}

function getDrinkTip(safety: Safety, label: string): string {
  switch (safety) {
    case 'extreme':
      return '💧 ORS or nimbu pani with black salt every 20 min';
    case 'danger':
      return '💧 Coconut water or buttermilk every 30 min';
    case 'caution':
      if (label.includes('morning') || label.includes('Morning')) {
        return '💧 Start with 500ml water + sattu sharbat';
      }
      return '💧 Nimbu pani or plain water every 45 min';
    case 'safe':
      if (label.includes('Early morning')) {
        return '💧 500ml water on waking + fruit juice';
      }
      if (label.includes('Night') || label.includes('night')) {
        return '💧 Light buttermilk with dinner + water before bed';
      }
      return '💧 Regular water intake — aim for a glass per hour';
  }
}

function getClothingTip(safety: Safety): string | undefined {
  switch (safety) {
    case 'extreme':
    case 'danger':
      return '👕 Loose white/light cotton. Wet cloth on neck. Cover head if stepping out.';
    case 'caution':
      return '👕 Light cotton clothes. Sunglasses + hat if outdoors.';
    default:
      return undefined;
  }
}

// ---- Main generator ----

/**
 * Generate a full day plan based on current feels-like and humidity.
 * Each block's safety is computed from the estimated temperature curve.
 */
export function generateDailyPlan(feelsLikeC: number, humidity: number = 50): PlanBlock[] {
  return TIME_SLOTS.map((slot) => {
    // Compute average heat index for this block
    const hours = slot.endHour > slot.startHour
      ? slot.endHour - slot.startHour
      : (24 - slot.startHour) + slot.endHour;

    let totalHI = 0;
    let minTemp = Infinity;
    let maxTemp = -Infinity;

    for (let i = 0; i < hours; i++) {
      const h = (slot.startHour + i) % 24;
      const temp = estimateTempAtHour(h, feelsLikeC);
      const hi = computeHeatIndex(temp, humidity);
      totalHI += hi;
      minTemp = Math.min(minTemp, temp);
      maxTemp = Math.max(maxTemp, temp);
    }

    const avgHI = totalHI / hours;
    const avgTemp = (minTemp + maxTemp) / 2;
    const safety = getSafety(avgHI);

    return {
      startHour: slot.startHour,
      endHour: slot.endHour,
      safety,
      label: safety === 'extreme'
        ? `${slot.label} — EXTREME DANGER`
        : safety === 'danger'
        ? `${slot.label} — stay indoors`
        : safety === 'caution'
        ? `${slot.label} — be careful`
        : slot.label,
      recommendation: getRecommendation(safety, slot.label, avgTemp),
      activities: getActivities(safety, slot.label),
      drinkTip: getDrinkTip(safety, slot.label),
      clothingTip: getClothingTip(safety),
      estTempRange: `${Math.round(minTemp)}–${Math.round(maxTemp)}°C`,
    };
  });
}
