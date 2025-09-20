Retro Focus - Expo App
======================

Retro Focus is a neon-inspired productivity companion built with Expo, React Native, and Expo Router. It combines a flexible Pomodoro-style timer, a lightweight task list, rich productivity analytics, and fully localised settings in English and Turkish. The project demonstrates how to ship a single codebase across mobile and web while keeping the UI responsive and animated.

Table of Contents
-----------------
- Overview
- Feature Highlights
- Screens at a Glance
- Architecture Notes
- State & Persistence
- Commands & Tooling
- Deployment (Netlify)
- Troubleshooting
- Roadmap / Ideas

Overview
--------
Retro Focus helps you stay engaged during study or work blocks. You can switch between work, short break, and long break presets, monitor how many sessions you have completed, track day streaks and score streaks, and ramp up the challenge with achievement difficulties. All preferences are stored locally, and the UI adapts automatically to portrait or landscape orientations.

Feature Highlights
------------------
- Timer & Animations: Circular countdown with pulse and glow effects, responsive sizing, and instant preset switching.
- Session Scoreboard: Live totals for each mode, day streak and combo streak tracking, and a running score powered by a difficulty-aware achievement system.
- Achievements: Configurable difficulty (easy, normal, hard) alters thresholds for milestones such as Focus Starter, Break Champion, Time Keeper, Streak Master, and Combo Breaker.
- Stats Dashboard: Productivity breakdown, focus vs break distribution, streak history, and progress bars for every achievement.
- Tasks List: Quick capture, toggle, and delete workflow with indicators for completed vs total tasks.
- Settings Suite: Language switcher (system/English/Turkce), timer duration controls, audiovisual toggles, difficulty picker, and a guarded "Reset Stats" action.
- Multi-language Support: English and Turkish strings managed through a simple dictionary in `lib/i18n.ts`.
- Responsive Layout: Shared responsive helpers (`s`, `vs`, `ms`, `msc`, `clamp`) keep components proportionate on phones, tablets, and the web.

Screens at a Glance
-------------------
- Timer (`app/(tabs)/index.tsx`): Heart of the app with presets, countdown, animated dial, progress bar, controls, and the session overview scoreboard. Landscape mode swaps to a compact player layout.
- Tasks (`app/(tabs)/tasks.tsx`): Manage tasks with inline add, complete, and delete interactions.
- Stats (`app/(tabs)/stats.tsx`): Visualise productivity through cards, progress bars, and achievement progress adapted to the chosen difficulty.
- Settings (`app/(tabs)/settings.tsx`): Adjust language, timer durations, interface toggles, achievement difficulty, and reset stored stats.

Architecture Notes
------------------
- Navigation: Expo Router tabs defined in `app/(tabs)/_layout.tsx` (Timer, Tasks, Stats, Settings).
- Providers: `PrefsContext` stores language and timer durations; `SessionStatsContext` centralises session totals, streaks, score, achievements, difficulty, and reset logic.
- Styling: Traditional React Native `StyleSheet` plus responsive helper utilities. Linear gradients supply the retro ambience.
- Icons & Motion: `lucide-react-native` for icons, React Native Animated for pulse and glow loops.

State & Persistence
-------------------
- Preferences (`PrefsContext`): Uses `AsyncStorage` to persist language and timer durations across sessions.
- Session Stats (`SessionStatsContext`): Persists per-mode counts, total focus/break seconds, score, streaks, unlocked achievements, and difficulty. Provides helper methods to record sessions, reset data (with optional difficulty retention), and evaluate achievements.
- Internationalisation (`lib/i18n.ts`): Minimal dictionary driven by a `Lang` enum; extend the map to add more locales.

Commands & Tooling
------------------
- `npm run dev` - Start Expo dev server (press `w` for web, or open on a device/emulator via Expo DevTools).
- `npm run build:web` - Export the web bundle into `dist/` (used by Netlify deploys).
- `npm run lint` - Lint via Expo's ESLint preset.
- `npx expo-doctor` - Optional health check of native dependencies.

Deployment (Netlify)
--------------------
1. Push the repository to GitHub (or another supported Git host).
2. In Netlify, choose **Add new site** -> **Import an existing project** and connect the repo.
3. Build command: `npm run build:web`
4. Publish directory: `dist`
5. Environment variables: `EXPO_USE_STATIC=1`, `EXPO_NO_TELEMETRY=1`
6. Deploy. The included `netlify.toml` configures the SPA fallback to `index.html`.

Troubleshooting
---------------
- Clear Metro cache: `npx expo start -c`
- Dependency sanity: `npx expo-doctor`
- Web layout quirks: verify browser zoom is 100%, then hard refresh (Ctrl+Shift+R).
- Reset stats: Use the button in Settings (keeps difficulty, wipes achievements and session history).

Roadmap / Ideas
---------------
- Wire notification, sound, and haptic toggles to real runtime effects.
- Automate long breaks (e.g., every 4th work session) with optional reminders.
- Persist tasks and stats to cloud storage for multi-device sync.
- Expand localisation beyond English and Turkish.
- Add share/export options for streak history and achievements.

License
-------
Retro Focus is distributed under the [Creative Commons Attribution-NonCommercial 4.0 International](LICENSE) license. You may use, remix, and share the project for non-commercial purposes so long as you provide attribution. Contact the authors if you need a commercial license or alternative terms.
