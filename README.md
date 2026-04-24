# PocketPilot (Expo + Supabase, Free Tier)

Cross-platform personal finance app with:
- Expense tracking (CRUD)
- Budgets + burn-rate monitoring
- Subscription reminders
- Rule-based insights
- Offline queue + sync

## Tech Stack
- Expo + React Native + TypeScript
- Zustand state management
- Supabase Auth + Database + RLS
- Victory Native charts
- Expo Notifications
- AsyncStorage + SecureStore

## 1) Local setup
1. Copy `.env.example` to `.env`
2. Fill Supabase values:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Install dependencies:
   - `npm install`
4. Start app:
   - `npm run start`

## 2) Supabase setup (free tier)
1. Create a free Supabase project.
2. Run SQL from `supabase/schema.sql` in SQL Editor.
3. In Auth settings, enable email/password sign-in.
4. Keep **RLS enabled** on all app tables (`expenses`, `budgets`, `subscriptions`, `profiles`).

## 3) Notifications
- Works through `expo-notifications`.
- App schedules 2 local reminders for each subscription:
  - 3 days before renewal
  - Renewal date

## 4) Testing
- Run unit tests:
  - `npm test`

## If you already ran older SQL
- The app supports existing `budgets.spending_limit` column for backward compatibility.
- You can keep that column as-is; no data reset required.
- For latest server-side profile support, run: `supabase/migrations/20260423_profile_and_budget_patch.sql`

## Folder structure
`src/` contains:
- `components/`
- `screens/`
- `navigation/`
- `services/`
- `store/`
- `hooks/`
- `utils/`
- `config/`
- `types/`


