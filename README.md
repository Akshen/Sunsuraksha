# ☀️ SunSuraksha — Stay Safe, Stay Cool, Stay Ahead of the Sun

**"Given THIS heat, what should I do RIGHT NOW?"**

SunSuraksha is a real-time, personalized heat survival assistant for Indian users. It combines weather intelligence, Indian nutritional science, hydration tracking, and behavioral nudges to keep people safe during extreme heat.

## Tech Stack

- **Mobile**: React Native (Expo SDK 52) — iOS + Android from one codebase
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (auth, database, edge functions)
- **Weather**: OpenWeatherMap API
- **Language**: TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `i` for iOS simulator / `a` for Android emulator.

## Project Structure

```
SunSuraksha/
├── app/                    # Screens (Expo Router file-based routing)
│   ├── (tabs)/             # Bottom tab screens
│   ├── onboarding/         # First-launch onboarding
│   └── sos.tsx             # Emergency screen
├── src/
│   ├── components/         # Reusable UI components
│   ├── constants/          # Theme, config, design tokens
│   ├── data/               # Bundled JSON databases
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API clients (Supabase, weather)
│   ├── types/              # TypeScript definitions
│   └── utils/              # Helper functions
└── assets/                 # Images, fonts
```

## Build Progress

- [x] Step 1: Project foundation + folder structure + theme
- [ ] Step 2: Navigation + design system components
- [ ] Step 3: Bundle food/drink database
- [ ] Step 4: Supabase setup
- [ ] Step 5: Onboarding screen
- [ ] Step 6: Home dashboard + heat score
- [ ] Step 7: Weather API integration
- [ ] Step 8: Food & drink recommendation screen
- [ ] Step 9: Hydration tracker
- [ ] Step 10: Daily planner
- [ ] Step 11: SOS emergency screen
- [ ] Step 12: Push notifications
- [ ] Step 13: Testing + bug fixes
- [ ] Step 14: Build + deploy beta

## License

Private — not yet open source.
