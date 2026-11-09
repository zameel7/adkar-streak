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
       └ SQLiteProvider "adkar.db"   (onInit: PRAGMAs + CREATE TABLE IF NOT EXISTS)
          └ ThemeProvider
             └ AppStack (themed headers + StatusBar): index, onboarding, auth, (tabs), pwa, morning-adkar, evening-adkar
```

**Keep `onInit` (`insertMissingDays`) at module scope.** `SQLiteProvider` closes and reopens the database whenever the `onInit` reference changes; an inline function would invalidate the connection screens hold (`NullPointerException` in `prepareAsync`).

### Routing (`app/`)
- `index.tsx`: redirect gate. No `onboardingComplete` → `/onboarding`; `isPWA()` → `/pwa`; else `/(tabs)/home`.
- `(tabs)/`: `home`, `settings`, `profile`, `about`. Tab bar is a floating glass pill (`expo-blur`, Dimezis backend on Android) — screens keep ~100px + inset bottom padding.
- `morning-adkar.tsx` / `evening-adkar.tsx`: thin wrappers around `components/AdkarScreen.tsx`.
- `+native-intent.tsx`: maps incoming links to routes (`/morning` → `/morning-adkar`, `/evening` → `/evening-adkar`; handles `https://adkar.zameel7.me/...`, `adkarchamp://...`, Expo Go `.../--/...`).
- `auth.tsx`: email/password sign-in/sign-up, forgot password (email links to `web` `/reset-password`; that URL must be in Supabase Auth → Redirect URLs). `onboarding.tsx`: first-run flow. `pwa.tsx`: single-page home for installed web app.

### Key directories
- `components/`: `AdkarScreen` (carousel screen), `AdkarCard` (single dhikr + completion logic), `glass/` (`GlassView`/`GlassText`), `Themed*` (`ThemedText` merges caller style over the theme color — don't let `style` replace it).
- `context/`: `AuthContext` (Supabase auth), `ThemeContext`.
- `hooks/useAdkarLogic.ts`: loads adkar JSON, carousel nav, repeat counter.
- `lib/`: `streak.ts` (today's progress + SQLite completion upsert — single source for streak writes), `sync.ts` (`syncStreaks(db)`: two-way OR-merge with Supabase, bulk upsert), `supabase.ts` (client + DB types + AppState token refresh), `notifications.ts`, `date.ts` (`localDateString()` – always use for date keys), `pwa.ts`, `greeting.ts` (time-of-day greeting + Hijri date for home).
- `assets/adkars/{morning,evening}.json`: adkar content.
- `supabase/`: Postgres schema + RLS policies.
- `web/`: Vite + React 18 landing site (privacy policy, account deletion, password reset via Supabase), deployed on Vercel at adkar.zameel7.me. Shares no code with the app.

### Storage layers
| Layer | Contents |
|---|---|
| AsyncStorage `streakData` | Today's per-dhikr progress: `{ date, morning: {idx: true}, evening: {...} }`. Stale dates discarded by `getTodayProgress()`. |
| AsyncStorage (other keys) | `name`, `theme`, `morningTime`, `eveningTime`, `translations`, `onboardingComplete` |
| SQLite `adkarStreaks` | History: `id`, `morning`, `evening`, `date` (TEXT `YYYY-MM-DD`, UNIQUE) |
| Supabase `adkar_streaks` | Cloud mirror per user (`user_id`, `date` unique together), RLS-protected |
| AsyncStorage `syncOwnerUserId` | Account the local history was last synced with. A different account signing in replaces local history with its cloud data instead of uploading it. |
| Supabase `user_preferences` | Schema exists but not yet synced by the app |

### Completion / sync flow
1. `AdkarCard` (check toggle) and `useAdkarLogic` (counter) call `setItemRead` → `recordCompletionIfDone` from `lib/streak.ts`. Progress from a previous day is discarded on read.
2. When a period becomes complete, SQLite is upserted (never downgraded) and `AdkarScreen` calls `syncStreaks(db)`.
3. `home.tsx` reloads on focus and on app foreground; when signed in it runs `syncStreaks` on login, pull-to-refresh and foreground.
4. `reconcileToday(db)` (home/pwa load) self-heals: if today's progress is complete but SQLite missed the write, it records it.
5. `setItemRead` writes are serialized (AsyncStorage read-modify-write is not atomic).

### Known rough edges
- `app/(tabs)/home.tsx` (~900 lines) mixes UI and data loading.
- Completion state lives in both AsyncStorage and SQLite.

## Deep links
- Scheme `adkarchamp` (e.g. `adkarchamp://morning`). Expo Go: `exp://127.0.0.1:8081/--/morning`.
- Android App Links: `intentFilters` (autoVerify) in app.json for `https://adkar.zameel7.me/morning*` and `/evening*`; verified by `web/public/.well-known/assetlinks.json` (Play app-signing + upload key SHA-256). Must be deployed before a build is installed — Android verifies at install.
- Reminder notifications carry `data.url` (`/morning-adkar`, `/evening-adkar`), handled by `useNotificationObserver` in `app/_layout.tsx`.

## Platform Notes
- `ios` branch exists for iOS-specific work (LinearGradient requirements); `main` is Android-focused (adaptive icons, notification channels).
- Builds via EAS (`eas.json`).
- OTA updates via `expo-updates` (EAS Update). `runtimeVersion` policy `appVersion`, so bump `version` in app.json for native changes. Channels: development / preview / production. Publish: `eas update --channel production --message "..."`.

## Testing
- Jest with `jest-expo`; `jest.setup.js` mocks AsyncStorage. Tests in `components/__tests__/`.
- React 19: wrap `react-test-renderer` `create()` in `await act(async () => …)` or `toJSON()` returns null.
- Expo Go on device: open with `adb shell am start -a android.intent.action.VIEW -d exp://127.0.0.1:8081 -p host.exp.exponent` (the phone may also have the native `com.zameel7.adkarstreak` build installed — don't confuse the two).
