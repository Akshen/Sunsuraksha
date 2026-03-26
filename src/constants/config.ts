/**
 * SunSuraksha App Configuration
 *
 * All secrets are read from environment variables.
 * Expo automatically exposes variables prefixed with EXPO_PUBLIC_
 *
 * SETUP:
 * 1. Copy .env.example to .env
 * 2. Fill in your real keys
 * 3. Never commit .env to Git
 */

export const Config = {
  // Read from environment — Expo exposes EXPO_PUBLIC_ vars automatically
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ?? '',
  OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',

  // Feature flags
  features: {
    pushNotifications: false,
    weatherApi: false,
    supabaseAuth: true,
    hydrationTracker: false,
    sosScreen: false,
  },

  // App defaults
  defaults: {
    city: 'Mumbai',
    language: 'en',
    tempUnit: 'celsius',
    waterGoalMl: 3000,
    reminderIntervalMin: 45,
  },

  // Heat score thresholds (°C)
  heatThresholds: {
    moderate: 37,
    hot: 42,
    extreme: 45,
  },
} as const;
