import * as Localization from 'expo-localization';

export type Lang = 'en' | 'tr';
export type LanguagePref = 'system' | Lang;

export function detectLang(): Lang {
  try {
    const locales = Localization.getLocales?.();
    const code = locales && locales.length ? (locales[0].languageCode || '').toLowerCase() : '';
    if (code?.startsWith('tr')) return 'tr';
  } catch {}
  return 'en';
}

export function resolveLang(pref: LanguagePref | undefined): Lang {
  if (!pref || pref === 'system') return detectLang();
  return pref;
}

const dict: Record<Lang, Record<string, string>> = {
  en: {
    'tabs.timer': 'Timer',
    'tabs.tasks': 'Tasks',
    'tabs.stats': 'Stats',
    'tabs.settings': 'Settings',

    'timer.heading': 'RETRO FOCUS',
    'timer.focus': 'FOCUS MODE',
    'timer.break': 'BREAK TIME',
    'label.sessions': 'SESSIONS',

    'tasks.title': 'TASK QUEUE',
    'tasks.addNew': 'ADD NEW TASK',
    'tasks.placeholder': 'ENTER TASK NAME...',
    'tasks.completed': 'COMPLETED',
    'tasks.total': 'TOTAL',

    'stats.title': 'PRODUCTIVITY MATRIX',
    'stats.subtitle': 'PERFORMANCE ANALYTICS',
    'stats.weekly': 'WEEKLY PROGRESS',
    'stats.achievements': 'ACHIEVEMENTS',
    'stats.focusTime': 'FOCUS TIME',
    'stats.sessions': 'SESSIONS',
    'stats.streak': 'STREAK',
    'stats.tasks': 'TASKS',

    'settings.title': 'SYSTEM CONFIG',
    'settings.subtitle': 'CUSTOMIZE PARAMETERS',
    'settings.language': 'LANGUAGE',
    'settings.system': 'System',
    'settings.english': 'English',
    'settings.turkish': 'Turkish',
    'settings.audio': 'AUDIO & FEEDBACK',
    'settings.sound': 'SOUND EFFECTS',
    'settings.haptics': 'HAPTIC FEEDBACK',
    'settings.notifications': 'NOTIFICATIONS',
    'settings.timers': 'TIMER SETTINGS',
    'settings.autoBreaks': 'AUTO BREAKS',
    'settings.work': 'WORK SESSION',
    'settings.shortBreak': 'SHORT BREAK',
    'settings.longBreak': 'LONG BREAK',
    'settings.about': 'ABOUT',
    'about.text': 'A productivity app inspired by\nclassic computing aesthetics',
    'about.subtext': 'Built with React Native & Expo',
  },
  tr: {
    'tabs.timer': 'Zamanlayıcı',
    'tabs.tasks': 'Görevler',
    'tabs.stats': 'İstatistik',
    'tabs.settings': 'Ayarlar',

    'timer.heading': 'RETRO ODAK',
    'timer.focus': 'ODAK MODU',
    'timer.break': 'MOLA',
    'label.sessions': 'OTURUMLAR',

    'tasks.title': 'GÖREV SIRASI',
    'tasks.addNew': 'YENİ GÖREV EKLE',
    'tasks.placeholder': 'GÖREV ADI GİRİN...',
    'tasks.completed': 'TAMAMLANDI',
    'tasks.total': 'TOPLAM',

    'stats.title': 'VERİMLİLİK MATRİSİ',
    'stats.subtitle': 'PERFORMANS ANALİZİ',
    'stats.weekly': 'HAFTALIK İLERLEME',
    'stats.achievements': 'BAŞARILAR',
    'stats.focusTime': 'ODAK SÜRESİ',
    'stats.sessions': 'OTURUM',
    'stats.streak': 'SERİ',
    'stats.tasks': 'GÖREV',

    'settings.title': 'SİSTEM AYARLARI',
    'settings.subtitle': 'PARAMETRELERİ ÖZELLEŞTİR',
    'settings.language': 'DİL',
    'settings.system': 'Sistem',
    'settings.english': 'İngilizce',
    'settings.turkish': 'Türkçe',
    'settings.audio': 'SES & GERİ BİLDİRİM',
    'settings.sound': 'SES EFEKTLERİ',
    'settings.haptics': 'HAPTİK GERİ BİLDİRİM',
    'settings.notifications': 'BİLDİRİMLER',
    'settings.timers': 'ZAMANLAYICI AYARLARI',
    'settings.autoBreaks': 'OTOMATİK MOLALAR',
    'settings.work': 'ÇALIŞMA',
    'settings.shortBreak': 'KISA MOLA',
    'settings.longBreak': 'UZUN MOLA',
    'settings.about': 'HAKKINDA',
    'about.text': 'Klasik bilgisayar estetiğinden ilham alan\nverimlilik uygulaması',
    'about.subtext': 'React Native & Expo ile geliştirildi',
  },
};

export function t(key: string, lang?: Lang): string {
  const l = lang || detectLang();
  const table = dict[l] || dict.en;
  return table[key] || dict.en[key] || key;
}
