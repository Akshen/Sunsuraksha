# Sun Se Suraksha — Technical Documentation

**Version:** 1.0.0
**Last updated:** April 1, 2026
**Target platform:** Android (Google Play Store)
**Status:** Pre-launch, feature-complete

---

## 1. Project Overview

Sun Se Suraksha (सन से सुरक्षा — "Protection from the Sun") is a heatwave survival app for Indian users. It answers one question: **"Given THIS heat, what should I do RIGHT NOW?"**

The app combines real-time weather data, a 38-item Indian food/drink database, 30 NDMA-verified heat survival tips, and a smart daily planner — all designed for zero ongoing infrastructure cost.

### Core Value Proposition

Most weather apps show temperature. Sun Se Suraksha tells you what to DO about it — when to go outside, what to eat, what to drink, when it's dangerous, and what to do if someone has heatstroke.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native (Expo) | SDK 55 |
| Language | TypeScript | Strict mode |
| Navigation | Expo Router | File-based routing |
| Backend | Supabase | PostgreSQL + Auth + RLS |
| Weather (primary) | Open-Meteo | Free, no API key, unlimited |
| Weather (fallback) | OpenWeatherMap | Free tier 1,000 calls/day |
| Testing | Jest 29 | 20 suites, 224 tests |
| CI/CD | GitHub Actions | Type check → Tests → Expo Doctor |
| Build | EAS Build | Dev, Preview APK, Production AAB |

### Why These Choices

- **Open-Meteo as primary weather API** — Free, no API key, unlimited calls, any GPS coordinate. Uses same GFS/ECMWF models as IMD. Cost: $0 at any scale.
- **Supabase** — Free tier covers our needs (50K rows, unlimited reads). PostgreSQL with Row Level Security. Weather cache table shared across all users.
- **Expo/React Native** — Single codebase for iOS + Android. Expo Go for development, EAS for production builds. File-based routing via Expo Router.

---

## 3. Architecture

### Data Flow

```
User opens app
  → L1: AsyncStorage (on-device, 6hr cache) → hit? return instantly
  → L2: Supabase weather_cache (city-level, 2hr cache) → hit? return
  → L3: Open-Meteo API (free, unlimited, exact GPS coords) → save to L1+L2, return
  → L4: OpenWeatherMap API (fallback, only if API key exists) → save to L1+L2, return
  → L5: Mock data + "Offline" banner
```

### Location Detection

```
GPS (high accuracy)
  → Network/cell tower (works indoors)
    → Last known position (expo-location)
      → AsyncStorage cached city (24hr)
        → Default: Mumbai
```

### Weather Cache Strategy

The Supabase `weather_cache` table stores one row per city. ALL users in the same city share one cached entry. This means API calls scale with cities (~646), not users.

```
646 districts × 12 refreshes/day (2hr cache) = ~7,752 API calls/day
Open-Meteo has no limit → cost is always $0
```

### District Coverage

The app ships with `indianDistricts.json` — 646 district headquarters across all 35 Indian states and UTs. When a user's GPS coordinate is detected, `findNearestCity()` maps it to the closest district HQ using Euclidean distance. Average accuracy: <25km for most of populated India.

---

## 4. Project Structure

```
sun-se-suraksha/
├── app/                            # SCREENS (Expo Router)
│   ├── _layout.tsx                 # Root Stack navigator
│   ├── (tabs)/
│   │   ├── _layout.tsx             # Tab bar (Home, Food, Tips, Plan)
│   │   ├── index.tsx               # Home dashboard
│   │   ├── food.tsx                # Food & drink recommendations
│   │   ├── hydration.tsx           # Tips + water reminders (accordion UI)
│   │   └── planner.tsx             # Daily planner with time blocks
│   ├── onboarding/index.tsx        # 3-step onboarding (all optional)
│   └── sos.tsx                     # Emergency SOS modal
│
├── src/
│   ├── components/
│   │   ├── common/                 # Card, Button, Badge, ScreenHeader
│   │   ├── home/                   # HeatScoreRing, ActionCard, HourlyTimeline,
│   │   │                           # WeatherMini, QuickActions
│   │   ├── food/                   # FoodCard, DrinkCard, AvoidCard
│   │   ├── hydration/              # WaterProgressRing, QuickAddButtons,
│   │   │                           # CustomAmountModal, HydrationLogList
│   │   └── planner/                # TimeBlockCard
│   │
│   ├── constants/
│   │   ├── theme.ts                # Colors, Spacing, Typography, BorderRadius,
│   │   │                           # Shadows + heat color mapping functions
│   │   └── config.ts               # App config (env vars, defaults, feature flags)
│   │
│   ├── data/
│   │   ├── foodDrinks.json         # 38-item database (130KB)
│   │   ├── foodData.ts             # 18 typed query functions
│   │   ├── foodImages.ts           # 11 local image mappings + fallback function
│   │   └── indianDistricts.json    # 646 district HQ coordinates (50KB)
│   │
│   ├── hooks/
│   │   ├── useLocation.ts          # GPS → network → cache → default Mumbai
│   │   └── useWeather.ts           # Fetch + cache + auto-refresh (15 min)
│   │
│   ├── services/
│   │   ├── supabase.ts             # Supabase client (AsyncStorage session)
│   │   ├── openMeteo.ts            # Open-Meteo API (FREE, primary)
│   │   ├── weather.ts              # Orchestrator: cache → Open-Meteo → OWM → mock
│   │   ├── weatherCache.ts         # Supabase read/write for weather_cache table
│   │   ├── notifications.ts        # Push notifications (Expo Go safe)
│   │   ├── auth.ts                 # Supabase auth (sign up/in/out)
│   │   ├── profile.ts              # User profile CRUD
│   │   ├── hydration.ts            # Water intake logging
│   │   └── index.ts                # Barrel export
│   │
│   ├── types/index.ts              # All TypeScript interfaces
│   └── utils/
│       ├── heatScore.ts            # Heat danger score (0-100)
│       └── dailyPlan.ts            # Temperature curve + humidity time blocks
│
├── assets/images/
│   ├── icon.png                    # App icon (1024×1024)
│   ├── adaptive-icon.png           # Android adaptive icon
│   ├── splash.png                  # Splash screen (1284×2778)
│   ├── logo-small.png              # In-app header logo (120×120)
│   ├── favicon.png                 # Notification icon (96×96)
│   └── food/                       # 11 bundled food images (400×400 PNG)
│
├── supabase/
│   ├── schema.sql                  # Profiles + hydration tables + RLS
│   └── weather_cache.sql           # City-level weather cache table
│
├── __tests__/                      # 20 test suites, 224 tests
├── .github/workflows/ci.yml        # GitHub Actions pipeline
├── privacy-policy.html             # Play Store privacy policy
├── jest.config.js + jest.setup.js   # Test config + global mocks
├── tsconfig.json                   # TypeScript config with @/ aliases
├── app.json                        # Expo config
├── eas.json                        # EAS Build profiles (gitignored)
├── .env.example                    # Env var template
└── .npmrc                          # legacy-peer-deps=true
```

---

## 5. Key Modules — Deep Dive

### 5.1 Heat Score Algorithm (`src/utils/heatScore.ts`)

Converts raw weather into a single 0-100 danger score.

**Formula:**
```
score = (feelsLikeScore × 0.50)     # Feels-like temperature
      + (humidityScore × 0.20)       # Humidity contribution
      + (uvScore × 0.20)             # UV index
      + (timePenalty × 0.10)         # Time-of-day modifier
```

**Thresholds:**
- 0-30: Safe (green) — hydration reminder every 60 min
- 31-55: Moderate (amber) — every 45 min
- 56-75: Danger (orange) — every 30 min
- 76-100: Extreme (red) — every 20 min

**Exported functions:**
- `calculateHeatScore(weather: WeatherData): HeatScore` — main scorer
- `getHydrationInterval(score: number): number` — minutes between reminders
- `calculateWaterTarget(weightKg, tempC, isOutdoor): number` — daily ml target

### 5.2 Daily Plan Generator (`src/utils/dailyPlan.ts`)

Uses a sinusoidal temperature curve to model temperature through the day.

**Temperature model:**
```
temp(hour) = midpoint + amplitude × cos((hour - 14) / 24 × 2π)
where:
  midpoint = feelsLike × (1 + 0.65) / 2
  amplitude = feelsLike × (1 - 0.65) / 2
  peak at hour 14 (2 PM), trough at hour 2 (2 AM)
  nighttime ratio = 0.65 of peak
```

**Heat index (humidity factoring):**
```
if temp < 27°C OR humidity < 40%: heatIndex = temp
else: heatIndex = temp + ((humidity - 40) / 10) × 1.5
```

**Safety levels per block:**
- Safe: heatIndex < 33
- Caution: 33-39.9
- Danger: 40-46.9
- Extreme: 47+

**Output:** 8 time blocks, each with: safety level, estimated temp range, recommendation text (with actual temps), drink tip, clothing tip.

### 5.3 Weather Service (`src/services/weather.ts`)

Orchestrates the weather data pipeline:

```typescript
fetchWeather(city: string): Promise<WeatherData>
  1. readWeatherCache(city)          // Supabase, 2hr TTL
  2. fetchFromOpenMeteo(lat, lon)    // Free, no key
  3. fetchFromOpenWeatherMap(...)     // Fallback, needs key
  4. throw Error                     // Triggers useWeather local cache fallback

fetchWeatherByCoords(lat, lon): Promise<WeatherData>
  1. findNearestCity(lat, lon)       // From 646-district dataset
  2. Same pipeline as above
```

**Important:** `fetchWeather` throws on failure (doesn't return mock data). The `useWeather` hook catches the throw and falls back to AsyncStorage cache, then mock data.

### 5.4 Open-Meteo Service (`src/services/openMeteo.ts`)

Calls `https://api.open-meteo.com/v1/forecast` with:
```
current=temperature_2m,apparent_temperature,relative_humidity_2m,
        wind_speed_10m,uv_index,weather_code
```

Includes WMO weather code → description mapper (95 codes) and WMO → OpenWeatherMap icon code mapper (for UI compatibility).

### 5.5 Food Database (`src/data/foodDrinks.json` + `foodData.ts`)

**38 items total:**
- 17 cooling foods (watermelon, cucumber, ash gourd, bael, mint, yogurt, etc.)
- 12 cooling drinks (nimbu pani, chaas, coconut water, jaljeera, kokum, thandai, etc.)
- 9 foods to avoid (spicy, alcohol, soft drinks, stale food, ice cream, etc.)

**Every food item contains:**
- IFCT 2017 / USDA nutrition data (per 100g)
- Ayurvedic classification (rasa, virya, vipaka)
- Temperature range suitability
- Time-of-day suitability
- Preparation steps
- Data source citations

**Query functions (18 total):** Filter by temperature, time, diet (veg/vegan), tags, hydration score. `getRecommendations()` is the main function — takes temp + time → returns top 5 foods, 4 drinks, 3 avoids.

### 5.6 Notifications (`src/services/notifications.ts`)

Uses `expo-notifications` with an Expo Go safety check:
```typescript
if (Constants.appOwnership === 'expo') return; // Skip in Expo Go
const N = require('expo-notifications');        // Lazy import
```

Notification frequency adapts to heat score: 20 min (extreme) → 60 min (safe).

### 5.7 Location Hook (`src/hooks/useLocation.ts`)

GPS-only detection with multi-strategy fallback:
1. GPS (accuracy < 50m)
2. Network/cell tower
3. Last known position
4. AsyncStorage cached city (24hr TTL)
5. Default: Mumbai

Returns: `{ city, coords, source, loading, error, refresh }`
Source indicator: 📍 GPS, 📶 Network, 💾 Cache, 🏙️ Default

---

## 6. Database Schema (Supabase)

### Tables

**profiles** — User onboarding data
```sql
id (uuid, PK, references auth.users)
name, city, age, weight_kg, gender, body_type
diet_preference ('vegetarian' | 'vegan' | 'non-vegetarian')
onboarded (boolean), created_at, updated_at
```

**hydration_logs** — Individual water intake entries
```sql
id (uuid, PK), user_id (FK → profiles)
amount_ml (1-2000), logged_at (timestamp)
```

**hydration_daily** — Daily aggregates for fast reads
```sql
user_id + date (unique), total_ml, target_ml, log_count
```

**weather_cache** — City-level shared weather cache
```sql
city (text, PK), temp_c, feels_like_c, humidity_pct
uv_index, wind_speed_kmh, description, icon
lat, lon, fetched_at (timestamp)
```

### Row Level Security

All tables have RLS enabled. Profiles/hydration: users can only access their own data. Weather cache: publicly readable, authenticated users can write.

---

## 7. Screens

| Screen | Route | Key Components |
|--------|-------|---------------|
| Home | `/(tabs)/` | HeatScoreRing, WeatherMini, ActionCard, HourlyTimeline, QuickActions |
| Food | `/(tabs)/food` | 3 tabs (Eat/Drink/Avoid), FoodCard with local images + emoji fallback |
| Tips | `/(tabs)/hydration` | Collapsible accordion (7 categories), water reminder toggle |
| Planner | `/(tabs)/planner` | 8 time blocks, meal plan with timing, hydration schedule |
| Onboarding | `/onboarding/` | 3-step flow (all fields optional), skip anytime |
| SOS | `/sos` | 10-symptom checker, 7 first-aid steps, 5 helplines with one-tap call |

---

## 8. Testing

**20 test suites, 224 tests, all passing.**

### Test Architecture

```
jest.setup.js — Global mocks:
  - @react-native-async-storage/async-storage (jest mock)
  - expo-location (function mocks)
  - @supabase/supabase-js (client mock — returns null for cache reads)
```

Individual test files additionally mock:
- `expo-notifications` + `expo-constants` (notification tests)
- `@/services/weatherCache` (weather tests)
- `@/services/openMeteo` (weather tests)

### Coverage Areas

| Area | Files | Tests | What's Tested |
|------|-------|-------|--------------|
| Heat score | 2 | ~45 | Algorithm, thresholds, 6 Indian city scenarios, water targets |
| Daily plan | 2 | ~25 | Temp curve, humidity impact, block structure, city scenarios |
| Hourly timeline | 1 | ~16 | Sinusoidal model, heat index, safety mapping |
| Food database | 3 | ~50 | 38 items integrity, queries, Hindi names, images, nutrition |
| Weather | 1 | ~15 | Dual API fallback, cache hit/miss, mock data, city handling |
| Offline | 1 | ~12 | AsyncStorage cache, age validation, mock fallback |
| Location | 1 | ~5 | Cache read/write, age validation |
| Notifications | 1 | ~6 | Permission flow, scheduling, Expo Go safety |
| Components | 4 | ~20 | ScreenHeader, Badge, Button, Card rendering |
| Config + Assets | 2 | ~15 | Config defaults, feature flags, asset integrity |
| Theme | 1 | ~6 | Heat color/label mapping at boundaries |

---

## 9. Environment Variables

```bash
# Required for Supabase features (auth, profile, weather cache)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Optional — app works without it (Open-Meteo is primary)
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_key_here
```

Config reads from `process.env.EXPO_PUBLIC_*` with empty string defaults. The app is fully functional without any API keys (uses Open-Meteo + mock data).

---

## 10. CI/CD Pipeline

**.github/workflows/ci.yml** runs on every push to `main` and every PR:

1. **Code Quality** — `npx tsc --noEmit --skipLibCheck`
2. **Tests** — `npx jest --coverage`
3. **Build Check** — `npx expo-doctor`

### Build Commands

```bash
# Development (Expo Go)
npx expo start

# Preview APK (shareable, no Play Store)
eas build --platform android --profile preview

# Production AAB (for Play Store)
eas build --platform android --profile production
```

---

## 11. Color System

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#FFF9F3` | Page background (cream) |
| Card | `#FFFFFF` | Card surfaces |
| Primary | `#D4763C` | Terracotta — buttons, accents, logo |
| Safe | `#4A9B6E` | Green — score 0-30 |
| Moderate | `#D4963C` | Amber — score 31-55 |
| Danger | `#C95A3C` | Orange — score 56-75 |
| Extreme | `#A63D2B` | Deep red — score 76-100 |
| Text | `#3D2E22` | Primary text (dark brown) |

Designed for readability under bright sunlight — when users need the app most.

---

## 12. Known Limitations

1. **No Hindi UI** — All text is English. Hindi names exist in the food database but the UI isn't translated.
2. **No auth required** — Onboarding data is local-only (AsyncStorage). Supabase auth exists but isn't enforced.
3. **No offline food images** — 11 of 38 food items have bundled local images. The rest use Unsplash URLs with emoji fallback.
4. **Weather accuracy** — Open-Meteo uses GFS/ECMWF models, not IMD station data. Accuracy is generally within 1-2°C of actual readings.
5. **Push notifications** — Don't work in Expo Go (removed in SDK 53). Only functional in production builds.

---

## 13. Common Development Tasks

### Adding a new food item
1. Add entry to `src/data/foodDrinks.json` following existing structure
2. If bundling a local image: add PNG to `assets/images/food/`, add mapping in `src/data/foodImages.ts`
3. Update test counts in `__tests__/data/foodData.test.ts`

### Adding a new district
1. Add entry to `src/data/indianDistricts.json`: `"city_name": {"lat": X, "lon": Y, "state": "XX"}`
2. No code changes needed — `findNearestCity()` auto-discovers new entries

### Adding a new tip
1. Add to the appropriate `TIP_SECTIONS` array in `app/(tabs)/hydration.tsx`
2. Include: emoji, title, body text, source citation

### Modifying the heat score algorithm
1. Edit `src/utils/heatScore.ts`
2. Run `npx jest __tests__/utils/heatScore` to verify
3. Scenario tests in `__tests__/utils/heatScoreScenarios.test.ts` cover 6 Indian cities

### Adding a new weather API
1. Create `src/services/newApi.ts` with a function returning `WeatherData`
2. Add it to the fallback chain in `src/services/weather.ts`
3. Mock it in `__tests__/services/weather.test.ts`

---

## 14. Emergency Helplines

Integrated in the SOS screen (`app/sos.tsx`):

| Number | Service |
|--------|---------|
| 112 | Universal Emergency (police, fire, ambulance) |
| 108 | Free ambulance (GVK EMRI) — 35 states, 10K+ ambulances |
| 102 | Government ambulance |
| 104 | Health advice helpline |
| 1078 | NDMA disaster helpline |

---

## 15. Deployment Checklist

- [ ] Run `npx jest --verbose` — all 224 tests pass
- [ ] Run `npx expo-doctor` — no errors
- [ ] Supabase: `weather_cache` table created (run `supabase/weather_cache.sql`)
- [ ] Privacy policy hosted at a public URL
- [ ] Google Play Developer account ($25 one-time)
- [ ] `eas build --platform android --profile production` → download AAB
- [ ] Play Store: fill store listing, screenshots, content rating, data safety
- [ ] Internal testing track → verify → promote to production
