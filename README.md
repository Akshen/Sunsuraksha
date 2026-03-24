# ☀️ SunSuraksha — Stay Safe, Stay Cool, Stay Ahead of the Sun

**"Given THIS heat, what should I do RIGHT NOW?"**

SunSuraksha is a real-time, personalized heat survival assistant for Indian users. It combines weather intelligence, Indian nutritional science, hydration tracking, and behavioral nudges to keep people safe during extreme heat and heatwaves.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native (Expo SDK 55) — iOS + Android from one codebase |
| Navigation | Expo Router (file-based routing) |
| Backend | Supabase (auth, PostgreSQL, Row Level Security) |
| Weather | OpenWeatherMap API |
| Language | TypeScript (strict mode) |
| Testing | Jest 29 + React Native Testing Library |
| CI/CD | GitHub Actions (type check → tests → build check) |

## Prerequisites

Before you begin, make sure you have:

- **Node.js** 20+ installed ([download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- A **Supabase** account ([sign up free](https://supabase.com))
- An **OpenWeatherMap** API key ([sign up free](https://openweathermap.org/api))

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/SunSuraksha.git
cd SunSuraksha
```

### 2. Install dependencies

```bash
npm install
```

> Note: The project uses `legacy-peer-deps=true` (set in `.npmrc`) to resolve Expo SDK 55 peer dependency conflicts. This is expected.

### 3. Set up environment variables

```bash
# Copy the example env file
cp .env.example .env
```

Open `.env` and fill in your real keys:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
```

**Where to find these:**

| Key | Where to get it |
|-----|----------------|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → `anon` `public` key |
| `OPENWEATHER_API_KEY` | OpenWeatherMap → Sign in → My API Keys |

> **Security:** The `.env` file is gitignored and will never be pushed to GitHub. Only `.env.example` (with placeholder values) is tracked.

### 4. Set up Supabase database

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (Region: **Mumbai / ap-south-1** recommended)
3. Once created, go to **SQL Editor** → **New Query**
4. Paste the contents of `supabase/schema.sql` and click **Run**

This creates:
- `profiles` table (user data from onboarding)
- `hydration_logs` table (water intake entries)
- `hydration_daily` table (daily summaries for fast reads)
- Row Level Security policies (users can only access their own data)
- Auto-create profile trigger on signup
- Auto-update timestamps

### 5. Start the app

```bash
npx expo start
```

Then:
- **Phone:** Scan QR code with Expo Go
- **iOS Simulator:** Press `i`
- **Android Emulator:** Press `a`

## Project Structure

```
SunSuraksha/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── __tests__/                  # All test files
│   ├── components/             # Component tests
│   ├── data/                   # Database query tests
│   └── utils/                  # Utility function tests
├── app/                        # Screens (Expo Router file-based routing)
│   ├── (tabs)/                 # Bottom tab screens
│   │   ├── _layout.tsx         # Tab bar config
│   │   ├── index.tsx           # Home / Dashboard
│   │   ├── food.tsx            # Food & drink recommendations
│   │   ├── hydration.tsx       # Hydration tracker
│   │   └── planner.tsx         # Daily planner
│   ├── onboarding/
│   │   └── index.tsx           # First-launch onboarding
│   ├── _layout.tsx             # Root layout
│   └── sos.tsx                 # Emergency SOS screen
├── src/
│   ├── components/
│   │   └── common/             # Card, Button, Badge, ScreenHeader
│   ├── constants/
│   │   ├── theme.ts            # Colors, spacing, typography tokens
│   │   └── config.ts           # App config (reads from env vars)
│   ├── data/
│   │   ├── foodDrinks.json     # Bundled food/drink database (76KB)
│   │   └── foodData.ts         # Typed query functions for the DB
│   ├── services/
│   │   ├── supabase.ts         # Supabase client init
│   │   ├── auth.ts             # Sign up, sign in, sign out
│   │   ├── profile.ts          # User profile CRUD
│   │   ├── hydration.ts        # Water intake logging
│   │   └── index.ts            # Barrel export
│   ├── types/
│   │   └── index.ts            # All TypeScript type definitions
│   └── utils/
│       └── heatScore.ts        # Heat danger score algorithm (0-100)
├── supabase/
│   └── schema.sql              # Database schema (run in SQL Editor)
├── assets/                     # Images, fonts, icons
├── .env.example                # Environment variable template
├── .npmrc                      # npm config (legacy-peer-deps)
├── app.json                    # Expo config
├── jest.config.js              # Test configuration
├── tsconfig.json               # TypeScript config with path aliases
└── package.json
```

## Running Tests

```bash
# Run all tests
npx jest

# Run with coverage report
npx jest --coverage

# Run in watch mode (re-runs on file changes)
npx jest --watch

# Run a specific test file
npx jest __tests__/utils/heatScore.test.ts
```

Current test suites:
- **Heat score algorithm** — validates danger score calculation, thresholds, hydration intervals
- **Card component** — renders children, variants, testIDs
- **Button component** — press events, disabled state, loading state, all variants
- **Food database** — data integrity, query functions, smart recommendations

## CI/CD Pipeline

Every push to `main` and every pull request triggers the GitHub Actions pipeline:

| Job | What it does |
|-----|-------------|
| **Code Quality** | TypeScript type checking (`tsc --noEmit --skipLibCheck`) |
| **Tests** | Runs all Jest tests with coverage report |
| **Build Check** | Runs `expo-doctor` to validate project health |

The pipeline config is at `.github/workflows/ci.yml`.

### Adding secrets for CI (when needed)

If future tests need Supabase access:

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_OPENWEATHER_API_KEY`

## Key Design Decisions

**Warm color palette** — Light cream background (`#FFF9F3`) with terracotta accents (`#D4763C`). Designed to be easy on the eyes under bright sunlight, which is when users need this app most.

**Bundled food database** — The food/drink recommendation data ships locally with the app (76KB JSON). No network call needed. Every item includes IFCT 2017 / USDA nutrition data, Ayurvedic classification, preparation steps, and scientific citations.

**Heat score algorithm** — Converts raw weather data into a single 0-100 danger score using: feels-like temperature (50%), humidity (20%), UV index (20%), and time-of-day penalty (10%). This score drives every UI decision, notification, and recommendation.

**Path aliases** — All imports use `@/` prefix (e.g., `@/constants/theme`) instead of relative paths. Configured in `tsconfig.json` and `jest.config.js`.

## Build Progress

- [x] Step 1: Project foundation + folder structure + theme
- [x] Step 2: UI components + testing + GitHub CI/CD
- [x] Step 3: Bundle food/drink database + query layer
- [x] Step 4: Supabase setup (auth + profiles + hydration)
- [x] Step 5: Onboarding screen (name, city, gender, age, body type, weight, diet — all optional)
- [x] Step 6: Home dashboard + heat score ring + action card + hourly timeline
- [x] Step 7: Weather API integration (OpenWeatherMap + 30 Indian city coords + useWeather hook)
- [x] Step 8: Food & drink recommendation screen (Eat / Drink / Avoid tabs)
- [x] Step 9: Hydration tracker (progress ring, quick-add, log history, custom modal)
- [x] Step 10: Daily planner (time blocks, safety levels, meal suggestions)
- [x] Step 11: SOS emergency screen (symptom checker, first aid, emergency helplines)
- [ ] Step 12: Push notifications
- [ ] Step 13: Testing + bug fixes
- [ ] Step 14: Build + deploy beta

## Emergency Helpline Numbers

SunSuraksha integrates the following all-India emergency numbers in the SOS screen:

| Number | Service | Availability |
|--------|---------|-------------|
| **112** | Universal Emergency (police, fire, ambulance) | All states and UTs |
| **108** | Free ambulance + disaster management (GVK EMRI) | 35 states/UTs — covers 1 billion+ people |
| **102** | Government ambulance | Nationwide |
| **104** | Health advice helpline (not ambulance) | Multiple states |
| **1078** | NDMA disaster helpline | Nationwide |

**About 108:** Launched in 2005 in Andhra Pradesh by EMRI (Emergency Management and Research Institute), the 108 service is now the world's largest ambulatory care provider. It operates 10,000+ ambulances with 66,000+ employees across 17+ partnered states including Delhi, Maharashtra, Gujarat, Tamil Nadu, Karnataka, UP, Rajasthan, Kerala, and more. The service is completely free for emergency situations, with trained EMTs on every ambulance. Average dispatch time is 80-90 seconds after call connection. Operated as a public-private partnership with state governments, funded by the National Health Mission under the Ministry of Health and Family Welfare.

## Contributing

This is currently a private project. If you have access:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npx jest`
4. Push and open a PR: `git push origin feature/your-feature`
5. CI must pass before merging

## License

Private — not yet open source.
