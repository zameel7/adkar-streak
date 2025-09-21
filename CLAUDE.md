# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adkar Champ is a React Native app built with Expo Router that helps Muslims track daily Islamic remembrances (adkar). The app features morning and evening adkar with streak tracking, push notifications, and theme support.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start
# or
npx expo start

# Run on specific platforms
npm run android    # Android emulator/device
npm run ios        # iOS simulator/device
npm run web        # Web browser

# Testing and quality
npm test           # Run Jest tests
npm run lint       # Run ESLint

# Reset project (removes example code)
npm run reset-project
```

## Architecture

### App Structure
- **Expo Router**: File-based routing with app directory structure
- **SQLite Database**: Local storage for streak data using `expo-sqlite`
- **AsyncStorage**: User preferences and daily streak tracking
- **Push Notifications**: Daily reminders using `expo-notifications`
- **Theme System**: Light/dark mode with custom theme context

### Key Directories
- `app/`: Main application screens using Expo Router
  - `(tabs)/`: Tab-based navigation (home, settings, about)
  - `_layout.tsx`: Root layout with database and theme providers
- `components/`: Reusable UI components
  - `AdkarCard.tsx`: Main component for displaying adkar content
  - `ThemedText.tsx`, `ThemedView.tsx`: Theme-aware components
- `context/`: React contexts (ThemeContext)
- `constants/`: App constants (Colors)
- `hooks/`: Custom React hooks for theme and color scheme
- `assets/`: Static assets including adkar JSON data files

### Database Schema
SQLite table `adkarStreaks`:
- `id`: Primary key
- `morning`: Boolean for morning completion
- `evening`: Boolean for evening completion
- `date`: Date string (YYYY-MM-DD format)

### Data Flow
1. Adkar content loaded from JSON files in `assets/adkars/`
2. Daily progress stored in AsyncStorage as `streakData`
3. Long-term streaks stored in SQLite database
4. Theme preferences managed through ThemeContext
5. Notification scheduling handled in root layout

### Key Features
- **Streak Tracking**: Tracks consecutive days of completing morning/evening adkar
- **Push Notifications**: Configurable daily reminders
- **Offline Support**: All adkar content available offline
- **Multi-language**: Arabic text with English translations
- **Theme Support**: Light/dark mode toggle

## Platform Notes

### iOS Development
Switch to the `ios` branch for iOS development as LinearGradient component has iOS-specific requirements.

### Android Focus
Main branch optimized for Android with adaptive icons and proper notification channels.

## Testing
- Uses Jest with `jest-expo` preset
- Component tests in `components/__tests__/`
- Snapshot testing enabled for UI components

## Dependencies Notes
- **@rneui/themed**: UI component library (React Native Elements)
- **expo-sqlite**: Local database storage
- **expo-notifications**: Push notification system
- **hijri-now**: Hijri calendar functionality
- **react-native-reanimated-carousel**: Swipeable adkar cards