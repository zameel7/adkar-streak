# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adkar Champ is a React Native app (Expo SDK 54, RN 0.81, React 19, Expo Router 6) that helps Muslims track daily morning and evening adkar. Features: streak tracking, push reminders, light/dark theme, optional cloud sync via Supabase, and a PWA mode on web. The repo also contains a separate Vite landing site in `web/`.

## Development Commands

```bash
npm install
npm start            # expo start
npm run android      # expo run:android (dev client)
npm run ios          # expo run:ios
npm run web          # expo start --web
npm test             # jest --watchAll (jest-expo preset)
npm run lint         # expo lint

# Landing site (separate package)
cd web && npm install && npm run dev
```

Cloud sync needs `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Without them, `isSupabaseConfigured` is false and the app runs fully offline (auth calls return a "not configured" error).

## Architecture

### Provider tree (`app/_layout.tsx`)
```
RootErrorBoundary
 └ AuthProvider              (Supabase session)
    └ AuthenticatedApp        (notification observer, splash, daily streakData reset, schedule notifications)
       └ SQLiteProvider "adkar.db"   (onInit: PRAGMAs + CREATE TABLE IF NOT EXISTS, retries transient Android errors)
          └ ThemeProvider
             └ Stack: index, onboarding, auth, (tabs), pwa, morning-adkar, evening-adkar
```

### Routing (`app/`)
- `index.tsx`: redirect gate. No `onboardingComplete` → `/onboarding`; `isPWA()` → `/pwa`; else `/(tabs)/home`.
- `(tabs)/`: `home`, `settings`, `profile`, `about`.
- `morning-adkar.tsx` / `evening-adkar.tsx`: thin wrappers around `components/AdkarScreen.tsx`.
- `auth.tsx`: email/password sign-in/sign-up. `onboarding.tsx`: first-run flow. `pwa.tsx`: single-page home for installed web app.

### Key directories
- `components/`: `AdkarScreen` (carousel screen), `AdkarCard` (single dhikr + completion logic), `glass/` (Glass* UI kit), `Themed*`.
- `context/`: `AuthContext` (Supabase auth), `ThemeContext`, `SyncContext` (callback bridge so adkar screens can trigger home's reload/sync).
- `hooks/useAdkarLogic.ts`: loads adkar JSON, carousel nav, repeat counter.
- `lib/`: `supabase.ts` (client + DB types), `notifications.ts`, `date.ts` (`localDateString()` – always use for date keys), `pwa.ts`.
- `assets/adkars/{morning,evening}.json`: adkar content.
- `supabase/`: Postgres schema + RLS policies.
- `web/`: Vite + React 18 landing site (privacy policy, account deletion via Supabase), deployed on Vercel at adkar.zameel7.me. Shares no code with the app.

### Storage layers
| Layer | Contents |
|---|---|
| AsyncStorage `streakData` | Today's per-dhikr progress: `{ date, morning: {idx: true}, evening: {...} }`. Reset on date change in root layout. |
| AsyncStorage (other keys) | `name`, `theme`, `morningTime`, `eveningTime`, `translations`, `onboardingComplete` |
| SQLite `adkarStreaks` | History: `id`, `morning`, `evening`, `date` (TEXT `YYYY-MM-DD`, UNIQUE) |
| Supabase `adkar_streaks` | Cloud mirror per user (`user_id`, `date` unique together), RLS-protected |
| Supabase `user_preferences` | Schema exists but not yet synced by the app |

### Completion / sync flow
1. `AdkarCard` / `useAdkarLogic` mark `streakData[type][index] = true` in AsyncStorage.
2. `AdkarCard.checkAndMarkStreak` sets today's `morning`/`evening` in SQLite when all items are done, then calls `onStreakUpdated`.
3. Via `SyncContext`, `home.tsx` → `handleStreakUpdated` → `loadAllData` (ensures today's row, reads last 100 rows, computes streak/week view).
4. If signed in, `home.tsx` runs `downloadAndMergeSupabaseData` and `syncLocalDataToSupabase`. Merge rule is OR (completion never un-set).

### Known rough edges
- `app/(tabs)/home.tsx` (~1100 lines) mixes UI, data loading and Supabase sync logic.
- Supabase sync does one request per day; could be a bulk upsert on `(user_id, date)`.
- Completion state lives in both AsyncStorage and SQLite.

## Platform Notes
- `ios` branch exists for iOS-specific work (LinearGradient requirements); `main` is Android-focused (adaptive icons, notification channels).
- Builds via EAS (`eas.json`).

## Testing
- Jest with `jest-expo`; tests in `components/__tests__/` (snapshot tests).
