Retro Focus — Expo App

Retro-styled focus timer built with Expo + React Native (Expo Router). It includes a Pomodoro-like timer with selectable presets, a simple task list, a stats screen, and a settings page with persisted preferences and multi-language support (Türkçe / English).

Features
- Timer presets: Work, Short Break, Long Break with animated dial and progress.
- Preset selector on the Timer screen; durations configurable in Settings.
- Persisted preferences (AsyncStorage): language and timer durations.
- Language support (auto-detect + manual): Turkish and English.
- Responsive layout for phones, tablets, and web; clamped sizes to avoid overflow.
- Bottom tab navigation using Expo Router.

Tech Stack
- Expo SDK 52, React Native 0.76, React 18
- Expo Router for tabs/routing
- expo-localization for language detection
- @react-native-async-storage/async-storage for persisted preferences

Getting Started
1) Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+ (or your preferred package manager)

2) Install dependencies
```
npm install
```

3) Optional health check
```
npx expo-doctor
```

4) Run the app
```
npm run dev
```
- Press “w” in the terminal to open Web, or run on a device/emulator via Expo DevTools.

5) Build for Web
```
npm run build:web
```
Output is written to the `dist/` folder.

Deploying to Netlify
1) Push your latest changes to GitHub so Netlify can access the repository.
2) In the Netlify dashboard choose Add new site -> Import an existing project and connect your Git provider.
3) When prompted for build settings set the build command to `npm run build:web` and the publish directory to `dist`.
4) Add the environment variables `EXPO_USE_STATIC=1` and `EXPO_NO_TELEMETRY=1` under Settings > Build & deploy > Environment in Netlify.
5) Trigger a deploy. Netlify will use the generated static bundle in `dist/` and fall back to `index.html` thanks to `netlify.toml`.


Scripts
- `npm run dev` — Start the Expo dev server.
- `npm run build:web` — Export the app for the Web platform.
- `npm run lint` — Lint with Expo’s ESLint preset.

Project Structure
- `app/` — Expo Router directory
  - `app/_layout.tsx` — Root layout
  - `app/(tabs)/_layout.tsx` — Tab layout (menu)
  - `app/(tabs)/index.tsx` — Timer screen (with preset selector)
  - `app/(tabs)/tasks.tsx` — Task list (add/complete/delete)
  - `app/(tabs)/stats.tsx` — Stats (sample data / UI)
  - `app/(tabs)/settings.tsx` — Settings (language + durations, other toggles)
- `context/PrefsContext.tsx` — Persisted preferences provider (language + durations)
- `lib/responsive.ts` — Utility helpers (`s`, `vs`, `ms`, `clamp`) for responsive sizing
- `lib/i18n.ts` — Minimal i18n helper (TR/EN + system detection)
- `hooks/useFrameworkReady.ts` — Small helper used by root layout

Localization (TR/EN)
- The app auto-detects device/browser language via `expo-localization`.
- You can override the language in Settings → LANGUAGE (System / Türkçe / English).
- To add another language, extend the dictionaries in `lib/i18n.ts` and add it to the `Lang` type.

Timer Presets & Durations
- On the Timer screen, tap a preset (Work / Short Break / Long Break) to switch modes.
- Configure the default durations in Settings → TIMER SETTINGS. These values are saved and used by the Timer.
- Current cycle: Work → Short Break → Work (Long Break can be selected manually). If you want automatic long breaks every N sessions, see the “Ideas / Next” section below.

Known Limitations
- Stats use sample data and do not persist yet.
- Sound/vibration/notifications are UI settings only (no runtime wiring yet).
- Long-break cycling is manual by design in this version.

Troubleshooting
- Clear Metro cache: `npx expo start -c`
- Dependency sanity: `npx expo-doctor`
- If the web UI looks oversized or cramped, ensure you’re not zoomed in the browser and try a hard refresh.

Ideas / Next
- Wire sound, haptics, and notifications to timer events.
- Automatic long break after N work sessions (configurable).
- Persist tasks and stats to storage.
- Add more languages.

License
- No license file included. Add one if you plan to distribute.
