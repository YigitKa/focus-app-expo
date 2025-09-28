# Retro Focus - Expo Uygulaması

Retro Focus, Expo, React Native ve Expo Router ile oluşturulmuş, neon esintili bir üretkenlik yardımcısıdır. Esnek bir Pomodoro tarzı zamanlayıcıyı, hafif bir görev listesini, zengin üretkenlik analizlerini ve İngilizce ile Türkçe dillerinde tamamen yerelleştirilmiş ayarları bir araya getirir. Proje, kullanıcı arayüzünü duyarlı ve animasyonlu tutarken tek bir kod tabanının mobil ve web platformlarında nasıl dağıtılabileceğini göstermektedir.

## İçindekiler
- [Genel Bakış](#genel-bakış)
- [Öne Çıkan Özellikler](#öne-çıkan-özellikler)
- [Ekran Görüntüleri](#ekran-görüntüleri)
- [Mimari Notları](#mimari-notları)
- [Durum ve Kalıcılık](#durum-ve-kalıcılık)
- [Komutlar ve Araçlar](#komutlar-ve-araçlar)
- [Dağıtım (Netlify)](#dağıtım-netlify)
- [Sorun Giderme](#sorun-giderme)
- [Yol Haritası / Fikirler](#yol-haritası--fikirler)
- [Lisans](#lisans)

## Genel Bakış
Retro Focus, ders çalışma veya iş blokları sırasında odaklanmanıza yardımcı olur. Çalışma, kısa mola ve uzun mola ön ayarları arasında geçiş yapabilir, kaç seans tamamladığınızı izleyebilir, gün serilerini ve kombo serilerini takip edebilir ve başarı zorluklarıyla mücadeleyi artırabilirsiniz. Tüm tercihler yerel olarak saklanır ve kullanıcı arayüzü dikey veya yatay yönlendirmelere otomatik olarak uyum sağlar.

## Öne Çıkan Özellikler
- **Zamanlayıcı ve Animasyonlar**: Nabız ve parlama efektleriyle dairesel geri sayım, duyarlı boyutlandırma ve anında ön ayar değiştirme.
- **Seans Skorbordu**: Her mod için canlı toplamlar, gün serisi ve kombo serisi takibi ve zorluk derecesine duyarlı bir başarı sistemiyle desteklenen bir puanlama.
- **Başarılar**: Yapılandırılabilir zorluk (kolay, normal, zor), Odak Başlangıcı, Mola Şampiyonu, Zaman Tutucu, Seri Ustası ve Kombo Kırıcı gibi kilometre taşları için eşikleri değiştirir.
- **İstatistik Paneli**: Üretkenlik dökümü, odaklanma ve mola dağılımı, seri geçmişi ve her başarı için ilerleme çubukları.
- **Görev Listesi**: Tamamlanan ve toplam görevleri gösteren göstergelerle hızlı yakalama, geçiş yapma ve silme iş akışı.
- **Ayarlar Paketi**: Dil değiştirici (sistem/İngilizce/Türkçe), zamanlayıcı süre kontrolleri, görsel-işitsel geçişler, zorluk seçici ve korumalı bir "İstatistikleri Sıfırla" eylemi.
- **Çoklu Dil Desteği**: `lib/i18n.ts` içinde basit bir sözlük aracılığıyla yönetilen İngilizce ve Türkçe metinler.
- **Duyarlı Düzen**: Paylaşılan duyarlı yardımcılar (`s`, `vs`, `ms`, `msc`, `clamp`), bileşenlerin telefonlarda, tabletlerde ve web'de orantılı kalmasını sağlar.
- **Web Pro Çubuğu**: Web'de yapışkan bir üst çubuk, zamanı, modu ve hızlı kontrolleri gösterir. Global klavye kısayolları uzman iş akışlarını hızlandırır.
- **Temalar**: Daha yüksek okunabilirlik için modern "Nova" teması ve klasik bir "Retro" tema. Ayarlar'dan değiştirilebilir.
- **Web Kısayolları (Masaüstü)**:
    - `Boşluk` / `K` — Oynat veya duraklat
    - `R` — Zamanlayıcıyı sıfırla
    - `1` / `2` / `3` / `4` — Çalışma / Kısa / Uzun / Serbest
    - `S` — Ayarlar, `T` — Görevler
    - `?` — Kısayol yardım katmanını aç/kapat

## Ekran Görüntüleri
- **Zamanlayıcı** (`app/(tabs)/index.tsx`): Ön ayarlar, geri sayım, animasyonlu kadran, ilerleme çubuğu, kontroller ve seans genel bakış skorbordu ile uygulamanın kalbi. Yatay mod, kompakt bir oynatıcı düzenine geçer.
- **Görevler** (`app/(tabs)/tasks.tsx`): Satır içi ekleme, tamamlama ve silme etkileşimleriyle görevleri yönetin.
- **İstatistikler** (`app/(tabs)/stats.tsx`): Kartlar, ilerleme çubukları ve seçilen zorluğa uyarlanmış başarı ilerlemesi aracılığıyla üretkenliği görselleştirin.
- **Ayarlar** (`app/(tabs)/settings.tsx`): Dil, zamanlayıcı süreleri, arayüz geçişleri, başarı zorluğu ve saklanan istatistikleri sıfırlama ayarlarını yapın.

## Mimari Notları
- **Navigasyon**: `app/(tabs)/_layout.tsx` içinde tanımlanan Expo Router sekmeleri (Zamanlayıcı, Görevler, İstatistikler, Ayarlar).
- **Sağlayıcılar**: `PrefsContext` dil ve zamanlayıcı sürelerini saklar; `SessionStatsContext` seans toplamlarını, serileri, puanı, başarıları, zorluğu ve sıfırlama mantığını merkezileştirir.
- **Stil**: Geleneksel React Native `StyleSheet` artı duyarlı yardımcı programlar. Doğrusal gradyanlar retro atmosferi sağlar.
- **İkonlar ve Hareket**: İkonlar için `lucide-react-native`, nabız ve parlama döngüleri için React Native Animated.

## Durum ve Kalıcılık
- **Tercihler** (`PrefsContext`): Dil ve zamanlayıcı sürelerini seanslar arasında kalıcı kılmak için `AsyncStorage` kullanır.
- **Seans İstatistikleri** (`SessionStatsContext`): Mod başına sayıları, toplam odaklanma/mola saniyelerini, puanı, serileri, kilidi açılmış başarıları ve zorluğu kalıcı kılar. Seansları kaydetmek, verileri sıfırlamak (isteğe bağlı zorluk korumasıyla) ve başarıları değerlendirmek için yardımcı yöntemler sağlar.
- **Uluslararasılaştırma** (`lib/i18n.ts`): Bir `Lang` enum'u tarafından yönlendirilen minimal sözlük; daha fazla yerel ayar eklemek için haritayı genişletin.

## Komutlar ve Araçlar
- `npm run dev` - Expo geliştirme sunucusunu başlatır (`w` tuşuna basarak web için açın veya Expo Geliştirici Araçları aracılığıyla bir cihazda/emülatörde açın).
- `npm run build:web` - Web paketini `dist/` içine dışa aktarır (Netlify dağıtımları tarafından kullanılır).
- `npm run lint` - Expo'nun ESLint ön ayarı aracılığıyla kod denetimi yapar.
- `npx expo-doctor` - Yerel bağımlılıkların isteğe bağlı sağlık kontrolü.

## Dağıtım (Netlify)
1. Depoyu GitHub'a (veya başka bir desteklenen Git ana bilgisayarına) itin.
2. Netlify'de **Yeni site ekle** -> **Mevcut bir projeyi içe aktar**'ı seçin ve depoyu bağlayın.
3. Derleme komutu: `npm run build:web`
4. Yayınlama dizini: `dist`
5. Ortam değişkenleri: `EXPO_USE_STATIC=1`, `EXPO_NO_TELEMETRY=1`
6. Dağıtın. Dahil edilen `netlify.toml` dosyası, SPA geri dönüşünü `index.html` olarak yapılandırır.

## Sorun Giderme
- Metro önbelleğini temizle: `npx expo start -c`
- Bağımlılık sağlığı: `npx expo-doctor`
- Web düzeni tuhaflıkları: tarayıcı yakınlaştırmasının %100 olduğunu doğrulayın, ardından sert yenileme yapın (Ctrl+Shift+R).
- İstatistikleri sıfırla: Ayarlar'daki düğmeyi kullanın (zorluğu korur, başarıları ve seans geçmişini siler).

## Yol Haritası / Fikirler
- Bildirim, ses ve dokunsal geri bildirim geçişlerini gerçek çalışma zamanı efektlerine bağlayın.
- Uzun molaları otomatikleştirin (örneğin, her 4. çalışma seansında bir) ve isteğe bağlı hatırlatıcılar ekleyin.
- Görevleri ve istatistikleri çoklu cihaz senkronizasyonu için bulut depolamaya kalıcı olarak kaydedin.
- Yerelleştirmeyi İngilizce ve Türkçe'nin ötesine genişletin.
- Seri geçmişi ve başarılar için paylaşma/dışa aktarma seçenekleri ekleyin.

## Lisans
Retro Focus, [Creative Commons Attribution-NonCommercial 4.0 International](LICENSE) lisansı altında dağıtılmaktadır. Projeyi ticari olmayan amaçlarla, atıfta bulunmak koşuluyla kullanabilir, yeniden düzenleyebilir ve paylaşabilirsiniz. Ticari bir lisans veya alternatif koşullar için yazarlarla iletişime geçin.

---

# Retro Focus - Expo App

Retro Focus is a neon-inspired productivity companion built with Expo, React Native, and Expo Router. It combines a flexible Pomodoro-style timer, a lightweight task list, rich productivity analytics, and fully localised settings in English and Turkish. The project demonstrates how to ship a single codebase across mobile and web while keeping the UI responsive and animated.

## Table of Contents
- [Overview](#overview)
- [Feature Highlights](#feature-highlights)
- [Screens at a Glance](#screens-at-a-glance)
- [Architecture Notes](#architecture-notes)
- [State & Persistence](#state--persistence)
- [Commands & Tooling](#commands--tooling)
- [Deployment (Netlify)](#deployment-netlify)
- [Troubleshooting](#troubleshooting)
- [Roadmap / Ideas](#roadmap--ideas)
- [License](#license)

## Overview
Retro Focus helps you stay engaged during study or work blocks. You can switch between work, short break, and long break presets, monitor how many sessions you have completed, track day streaks and score streaks, and ramp up the challenge with achievement difficulties. All preferences are stored locally, and the UI adapts automatically to portrait or landscape orientations.

## Feature Highlights
- **Timer & Animations**: Circular countdown with pulse and glow effects, responsive sizing, and instant preset switching.
- **Session Scoreboard**: Live totals for each mode, day streak and combo streak tracking, and a running score powered by a difficulty-aware achievement system.
- **Achievements**: Configurable difficulty (easy, normal, hard) alters thresholds for milestones such as Focus Starter, Break Champion, Time Keeper, Streak Master, and Combo Breaker.
- **Stats Dashboard**: Productivity breakdown, focus vs break distribution, streak history, and progress bars for every achievement.
- **Tasks List**: Quick capture, toggle, and delete workflow with indicators for completed vs total tasks.
- **Settings Suite**: Language switcher (system/English/Turkce), timer duration controls, audiovisual toggles, difficulty picker, and a guarded "Reset Stats" action.
- **Multi-language Support**: English and Turkish strings managed through a simple dictionary in `lib/i18n.ts`.
- **Responsive Layout**: Shared responsive helpers (`s`, `vs`, `ms`, `msc`, `clamp`) keep components proportionate on phones, tablets, and the web.
- **Web Pro Bar**: A sticky top bar on web shows time, mode and quick controls. Global keyboard shortcuts speed up expert workflows.
- **Themes**: Modern “Nova” theme for higher readability and a classic “Retro” theme. Switch in Settings.
- **Web Shortcuts (Desktop)**:
    - `Space` / `K` — Play or pause
    - `R` — Reset timer
    - `1` / `2` / `3` / `4` — Work / Short / Long / Free
    - `S` — Settings, `T` — Tasks
    - `?` — Toggle the shortcuts help overlay

## Screens at a Glance
- **Timer** (`app/(tabs)/index.tsx`): Heart of the app with presets, countdown, animated dial, progress bar, controls, and the session overview scoreboard. Landscape mode swaps to a compact player layout.
- **Tasks** (`app/(tabs)/tasks.tsx`): Manage tasks with inline add, complete, and delete interactions.
- **Stats** (`app/(tabs)/stats.tsx`): Visualise productivity through cards, progress bars, and achievement progress adapted to the chosen difficulty.
- **Settings** (`app/(tabs)/settings.tsx`): Adjust language, timer durations, interface toggles, achievement difficulty, and reset stored stats.

## Architecture Notes
- **Navigation**: Expo Router tabs defined in `app/(tabs)/_layout.tsx` (Timer, Tasks, Stats, Settings).
- **Providers**: `PrefsContext` stores language and timer durations; `SessionStatsContext` centralises session totals, streaks, score, achievements, difficulty, and reset logic.
- **Styling**: Traditional React Native `StyleSheet` plus responsive helper utilities. Linear gradients supply the retro ambience.
- **Icons & Motion**: `lucide-react-native` for icons, React Native Animated for pulse and glow loops.

## State & Persistence
- **Preferences** (`PrefsContext`): Uses `AsyncStorage` to persist language and timer durations across sessions.
- **Session Stats** (`SessionStatsContext`): Persists per-mode counts, total focus/break seconds, score, streaks, unlocked achievements, and difficulty. Provides helper methods to record sessions, reset data (with optional difficulty retention), and evaluate achievements.
- **Internationalisation** (`lib/i18n.ts`): Minimal dictionary driven by a `Lang` enum; extend the map to add more locales.

## Commands & Tooling
- `npm run dev` - Start Expo dev server (press `w` for web, or open on a device/emulator via Expo DevTools).
- `npm run build:web` - Export the web bundle into `dist/` (used by Netlify deploys).
- `npm run lint` - Lint via Expo's ESLint preset.
- `npx expo-doctor` - Optional health check of native dependencies.

## Deployment (Netlify)
1. Push the repository to GitHub (or another supported Git host).
2. In Netlify, choose **Add new site** -> **Import an existing project** and connect the repo.
3. Build command: `npm run build:web`
4. Publish directory: `dist`
5. Environment variables: `EXPO_USE_STATIC=1`, `EXPO_NO_TELEMETRY=1`
6. Deploy. The included `netlify.toml` configures the SPA fallback to `index.html`.

## Troubleshooting
- Clear Metro cache: `npx expo start -c`
- Dependency sanity: `npx expo-doctor`
- Web layout quirks: verify browser zoom is 100%, then hard refresh (Ctrl+Shift+R).
- Reset stats: Use the button in Settings (keeps difficulty, wipes achievements and session history).

## Roadmap / Ideas
- Wire notification, sound, and haptic toggles to real runtime effects.
- Automate long breaks (e.g., every 4th work session) with optional reminders.
- Persist tasks and stats to cloud storage for multi-device sync.
- Expand localisation beyond English and Turkish.
- Add share/export options for streak history and achievements.

## License
Retro Focus is distributed under the [Creative Commons Attribution-NonCommercial 4.0 International](LICENSE) license. You may use, remix, and share the project for non-commercial purposes so long as you provide attribution. Contact the authors if you need a commercial license or alternative terms.