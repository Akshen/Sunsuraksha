# ☀️ SunSuraksha — Stay Safe, Stay Cool, Stay Ahead of the Sun

**"Given THIS heat, what should I do RIGHT NOW?"**

SunSuraksha is a real-time, personalized heat survival assistant for Indian users. It combines weather intelligence, Indian nutritional science, NDMA-verified safety tips, and behavioral nudges to keep people safe during extreme heat and heatwaves.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native (Expo SDK 55) — iOS + Android from one codebase |
| Navigation | Expo Router (file-based routing) |
| Backend | Supabase (auth, PostgreSQL, Row Level Security, weather cache) |
| Weather | OpenWeatherMap API + Supabase city-level cache |
| Language | TypeScript (strict mode) |
| Testing | Jest 29 + React Native Testing Library |
| CI/CD | GitHub Actions (type check → tests → build check) |

## Features

**Home Dashboard** — GPS-detected location, live weather, heat score ring (0-100), smart hourly timeline with sinusoidal temperature curve, action cards with safety recommendations.

**Food & Drink Guide** — 38 items (17 foods, 12 drinks, 9 avoids) with full IFCT 2017 / USDA nutrition data, Ayurvedic classification, preparation steps, and scientific citations. Includes jaljeera, kokum sharbat, bael, thandai, khus, sattu, aam panna, and more. 11 locally bundled images for instant loading.

**Tips & Reminders** — 20 NDMA/BMC/AIIMS-verified heat survival tips in 5 categories (Hydration, Body Cooling, Outdoor Protection, Home Cooling, Food & Diet). Adaptive water reminder notifications every 20-60 minutes based on current heat score.

**Daily Planner** — 8 time blocks computed from temperature curve + humidity. Each block shows estimated temperature range, safety level, drink tip, clothing advice. Includes meal plan with timing and a hydration schedule (8 slots, ~3L/day target).

**SOS Emergency** — 10-symptom heatstroke checker, 7 first-aid steps, 5 emergency helplines (112, 108, 102, 104, 1078) with one-tap calling.

**Offline Mode** — Weather cached in AsyncStorage (6hr) and Supabase (30min per city). Location cached 24hr. App works fully offline with cached or estimated data.

## Supported Cities (28)

Agra, Ahmedabad, Bangalore, Bhopal, Bhubaneswar, Chandigarh, Chennai, Coimbatore, Delhi, Gurgaon, Hyderabad, Indore, Jaipur, Kochi, Kolkata, Lucknow, Madurai, Mumbai, Nagpur, Noida, Patna, Pune, Ranchi, Surat, Thiruvananthapuram, Vadodara, Varanasi, Visakhapatnam.

GPS-based location works for any location in India. The 28 cities above have pre-mapped coordinates for instant cache lookup. Unknown cities default to Mumbai coordinates.

## Weather Cache Architecture

The app uses a city-level Supabase cache to minimize API calls:

```
User opens app → Check Supabase: is there a row for this city < 30 min old?
  → YES: return cached data instantly (zero API calls)
  → NO: call OpenWeatherMap, save to Supabase, return data

50 cities × 48 refreshes/day = 2,400 API calls/day
(same cost at 10K users or 100K users)
```

Fallback chain: Supabase cache → OpenWeatherMap API → AsyncStorage local cache → Mock data.

## Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Expo Go** app ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- A **Supabase** account ([sign up free](https://supabase.com))
- An **OpenWeatherMap** API key ([sign up free](https://openweathermap.org/api))

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/SunSuraksha.git
cd SunSuraksha
npm install
```

> Uses `legacy-peer-deps=true` (set in `.npmrc`) for Expo SDK 55 compatibility.

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your keys:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
```

### 3. Set up Supabase database

Go to Supabase Dashboard → SQL Editor → New Query:

1. Run `supabase/schema.sql` (profiles, hydration tables, RLS policies)
2. Run `supabase/weather_cache.sql` (city-level weather cache table)

### 4. Start the app

```bash
npx expo start
```

### 5. Build for production

```bash
npm install -g eas-cli
eas login

# Android APK (for testing)
eas build --platform android --profile preview

# Android AAB (for Play Store)
eas build --platform android --profile production
```

## Project Structure

```
SunSuraksha/
├── .github/workflows/ci.yml       # GitHub Actions CI/CD
├── __tests__/                      # 20 test files, 200+ tests
│   ├── assets/                     # Asset integrity tests
│   ├── components/                 # Badge, Button, Card, ScreenHeader
│   ├── constants/                  # Config validation
│   ├── data/                       # Food database (38 items) + image tests
│   ├── hooks/                      # Location cache, offline mode
│   ├── services/                   # Weather (cache + API), notifications
│   └── utils/                      # Heat score, daily plan, hourly timeline, theme
├── app/                            # Screens (Expo Router)
│   ├── (tabs)/                     # 4 tabs: Home, Food, Tips, Plan
│   ├── onboarding/index.tsx        # 3-step onboarding
│   ├── _layout.tsx                 # Root Stack navigator
│   └── sos.tsx                     # Emergency SOS modal
├── src/
│   ├── components/                 # common, home, food, planner
│   ├── constants/                  # theme.ts, config.ts
│   ├── data/
│   │   ├── foodDrinks.json         # 38-item food database (130KB)
│   │   ├── foodData.ts             # Typed query functions
│   │   └── foodImages.ts           # 11 local image mappings
│   ├── hooks/
│   │   ├── useLocation.ts          # GPS + network + cache fallback
│   │   └── useWeather.ts           # Weather fetch + offline cache
│   ├── services/
│   │   ├── supabase.ts             # Supabase client
│   │   ├── weather.ts              # OpenWeatherMap + Supabase cache
│   │   ├── weatherCache.ts         # City-level Supabase cache layer
│   │   ├── notifications.ts        # Push notifications (Expo Go safe)
│   │   ├── auth.ts, profile.ts, hydration.ts
│   │   └── index.ts                # Barrel export
│   ├── types/index.ts
│   └── utils/
│       ├── heatScore.ts            # Heat danger score (0-100)
│       └── dailyPlan.ts            # Temp curve + humidity time blocks
├── assets/images/                  # App icons, splash, 11 food images
├── supabase/
│   ├── schema.sql                  # Profiles + hydration tables
│   └── weather_cache.sql           # City-level weather cache
├── .env.example                    # Env var template
├── jest.config.js + jest.setup.js  # Test config + global mocks
└── package.json
```

## Running Tests

```bash
npx jest              # Run all tests
npx jest --verbose    # With details
npx jest --coverage   # With coverage report
```

**20 test suites, 200+ tests** covering:

- Heat score algorithm + 6 Indian city scenarios
- Daily planner v2 (temp curve + humidity, drink/clothing tips)
- Hourly timeline (sinusoidal model, heat index, safety mapping)
- Food database (38 items — structure, queries, Hindi names, images, nutrition)
- Weather service (Supabase cache mock, API fallback, city handling)
- Offline mode (AsyncStorage cache, age validation)
- Location detection (GPS cache, coordinate lookup)
- Notifications (Expo Go safe, all environments)
- UI components (ScreenHeader, Badge, Button, Card)
- Config validation, asset integrity, theme utilities

## Key Design Decisions

**Supabase weather cache** — All users in the same city share one cached weather result (30 min freshness). This means 2,400 API calls/day regardless of whether you have 10K or 100K users. The cache chain is: Supabase → OpenWeatherMap → AsyncStorage → mock data.

**GPS-only location** — Auto-detects city via GPS/network on launch. Falls back to cached location (24hr) then Mumbai. Location source shown as emoji: 📍 GPS, 📶 Network, 💾 Cache, 🏙️ Default.

**38-item food database** — Ships locally (130KB JSON + 11 local images). Every item has IFCT 2017/USDA nutrition, Ayurvedic properties, preparation steps, and cited sources. Covers traditional Indian coolers: jaljeera, kokum sharbat, bael, thandai, khus, sattu, aam panna, chaas, and more.

**20 NDMA-verified tips** — Sourced from NDMA Do's & Don'ts, BMC advisories, and AIIMS nutrition guidelines. Organized in 5 categories with source citations visible to users.

**Temperature curve + humidity** — Both the hourly timeline and daily planner use a sinusoidal model (peak 2 PM, trough 5 AM) combined with humidity-based heat index. Mumbai at 34°C + 85% humidity correctly shows danger — while 34°C + 30% humidity shows safe.

**Heat score algorithm** — Single 0-100 score from: feels-like temp (50%), humidity (20%), UV index (20%), time-of-day (10%). Drives all UI, notification frequency, and recommendations.

**Expo Go safe notifications** — Detects Expo Go via `Constants.appOwnership` and skips `expo-notifications` entirely. Safe no-ops in development, fully functional in production builds.

**Default city: Mumbai** — All fallbacks default to Mumbai.

## Build Progress

- [x] Project foundation + UI components + CI/CD
- [x] 38-item food/drink database with IFCT 2017 nutrition data
- [x] Supabase setup (auth, profiles, hydration, weather cache)
- [x] Home dashboard (GPS, heat score ring, hourly timeline, action cards)
- [x] Weather API + Supabase city-level cache (30 min freshness)
- [x] Food & drink screen (17 foods, 12 drinks, 9 avoids, 3 tabs)
- [x] 20 NDMA-verified tips + adaptive water reminders
- [x] Daily planner v2 (temp curve + humidity, drink/clothing tips per block)
- [x] SOS emergency screen (symptoms, first aid, 5 helplines)
- [x] Offline mode (weather 6hr cache, location 24hr cache)
- [x] Push notifications (Expo Go safe, production-ready)
- [x] SunSuraksha logo (app icon, adaptive icon, splash, favicon)
- [x] 20 test suites, 200+ tests, all passing
- [x] EAS Build config (dev, preview APK, production AAB)

## Emergency Helpline Numbers

| Number | Service | Availability |
|--------|---------|-------------|
| **112** | Universal Emergency (police, fire, ambulance) | All states and UTs |
| **108** | Free ambulance + disaster management (GVK EMRI) | 35 states/UTs — 1 billion+ people |
| **102** | Government ambulance | Nationwide |
| **104** | Health advice helpline | Multiple states |
| **1078** | NDMA disaster helpline | Nationwide |

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes + run tests: `npx jest`
3. Push and open a PR: `git push origin feature/your-feature`
4. CI must pass before merging

## License

Private — not yet open source.
