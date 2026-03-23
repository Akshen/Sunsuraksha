/**
 * SunSuraksha App Configuration
 * 
 * API keys and feature flags.
 * In production, move secrets to environment variables.
 */

export const Config = {
  // OpenWeatherMap — free tier gives 1000 calls/day
  // Sign up at: https://openweathermap.org/api
  OPENWEATHER_API_KEY: 'YOUR_API_KEY_HERE',
  OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',

  // Supabase — project credentials
  // Get these from: https://supabase.com/dashboard → Settings → API
  SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE',

  // Feature flags — toggle features during development
  features: {
    pushNotifications: false,   // Enable in Step 12
    weatherApi: false,          // Enable in Step 7
    supabaseAuth: false,        // Enable in Step 4
    hydrationTracker: false,    // Enable in Step 9
    sosScreen: false,           // Enable in Step 11
  },

  // App defaults
  defaults: {
    city: 'Delhi',
    language: 'en',
    tempUnit: 'celsius',       // Always celsius for India
    waterGoalMl: 3000,         // 3L default daily target
    reminderIntervalMin: 45,   // Default reminder interval
  },

  // Heat score thresholds (°C)
  heatThresholds: {
    moderate: 37,
    hot: 42,
    extreme: 45,
  },
} as const;
