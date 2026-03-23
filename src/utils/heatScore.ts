/**
 * Heat Score Calculator
 *
 * Computes a 0-100 heat danger score from weather data.
 * This is the core intelligence of SunSuraksha — it turns
 * raw weather numbers into a single actionable score.
 *
 * Formula weights (tuned for Indian conditions):
 *   - Feels-like temperature: 50%
 *   - Humidity:               20%
 *   - UV index:               20%
 *   - Time-of-day penalty:    10%
 */

import { getHeatColor, getHeatBgColor, getHeatLabel } from '@/constants/theme';
import type { WeatherData, HeatScore } from '@/types';

/**
 * Compute the heat danger score (0-100)
 */
export function calculateHeatScore(
  weather: WeatherData,
  currentHour: number = new Date().getHours()
): HeatScore {
  // 1. Temperature component (0-50 points)
  //    Starts scoring at 30°C, maxes out at 48°C
  const tempScore = clamp(((weather.feels_like_c - 30) / 18) * 50, 0, 50);

  // 2. Humidity component (0-20 points)
  //    High humidity blocks sweat evaporation — dangerous above 60%
  const humidityScore = clamp(((weather.humidity_pct - 40) / 50) * 20, 0, 20);

  // 3. UV component (0-20 points)
  //    UV index 6+ is high, 11+ is extreme
  const uvScore = clamp((weather.uv_index / 11) * 20, 0, 20);

  // 4. Time-of-day penalty (0-10 points)
  //    Peak danger: 11 AM to 4 PM
  const timePenalty = getTimePenalty(currentHour);

  const rawScore = tempScore + humidityScore + uvScore + timePenalty;
  const score = Math.round(clamp(rawScore, 0, 100));

  return {
    score,
    label: getHeatLabel(score),
    color: getHeatColor(score),
    bgColor: getHeatBgColor(score),
    primaryAction: getPrimaryAction(score, weather.feels_like_c),
    safeWindowStart: getSafeWindowStart(weather.feels_like_c),
    safeWindowEnd: getSafeWindowEnd(weather.feels_like_c),
  };
}

/**
 * Time-of-day penalty — peak hours get extra danger points
 */
function getTimePenalty(hour: number): number {
  if (hour >= 11 && hour <= 15) return 10;   // Peak danger
  if (hour >= 9 && hour <= 17) return 6;     // Active sun hours
  if (hour >= 7 && hour <= 19) return 3;     // Daylight
  return 0;                                    // Night — no penalty
}

/**
 * Generate the primary action message based on score
 */
function getPrimaryAction(score: number, feelsLike: number): string {
  if (score <= 20) return 'Great weather! Stay hydrated as usual.';
  if (score <= 35) return 'Warm outside. Carry water if stepping out.';
  if (score <= 50) return 'Getting hot. Limit outdoor time to mornings and evenings.';
  if (score <= 65) return `Hot outside (${Math.round(feelsLike)}°C feels like). Stay indoors if possible.`;
  if (score <= 80) return `Dangerous heat (${Math.round(feelsLike)}°C feels like). Avoid going outside.`;
  return `EXTREME HEAT (${Math.round(feelsLike)}°C feels like). Stay indoors. Hydrate every 20 minutes.`;
}

/**
 * Estimate safe outdoor window start time
 */
function getSafeWindowStart(feelsLike: number): string {
  if (feelsLike < 35) return '6:00 AM';
  if (feelsLike < 40) return '5:30 AM';
  if (feelsLike < 44) return '5:00 AM';
  return '4:30 AM';
}

/**
 * Estimate safe outdoor window end time (evening)
 */
function getSafeWindowEnd(feelsLike: number): string {
  if (feelsLike < 35) return '9:00 AM';
  if (feelsLike < 40) return '8:30 AM';
  if (feelsLike < 44) return '7:30 AM';
  return '7:00 AM';
}

/**
 * Clamp a number between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get hydration reminder interval based on heat score
 * Returns interval in minutes
 */
export function getHydrationInterval(score: number): number {
  if (score <= 30) return 60;
  if (score <= 55) return 45;
  if (score <= 75) return 30;
  return 20;
}

/**
 * Calculate daily water target in ml based on weight and temperature
 */
export function calculateWaterTarget(
  weightKg: number,
  feelsLikeC: number,
  isOutdoor: boolean
): number {
  const base = weightKg * 35; // 35ml per kg baseline

  let tempMultiplier = 1.0;
  if (feelsLikeC >= 42) tempMultiplier = 1.8;
  else if (feelsLikeC >= 37) tempMultiplier = 1.5;
  else if (feelsLikeC >= 30) tempMultiplier = 1.2;

  const activityMultiplier = isOutdoor ? 1.4 : 1.0;

  return Math.round(base * tempMultiplier * activityMultiplier);
}
