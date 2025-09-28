import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, THEMES, NovaTheme } from '@/lib/theme';

type ThemeName = Theme['name'];

type ThemeCtx = {
  theme: Theme;
  name: ThemeName;
  setThemeName: (name: ThemeName) => void;
};

const KEY = 'theme_pref_v1';

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState<ThemeName>('nova');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(KEY);
        if (stored && (stored === 'nova' || stored === 'retro')) setName(stored as ThemeName);
      } catch {}
    })();
  }, []);

  const setThemeName = useCallback((next: ThemeName) => {
    setName(next);
    AsyncStorage.setItem(KEY, next).catch(() => {});
  }, []);

  const value = useMemo<ThemeCtx>(() => ({
    theme: THEMES[name] || NovaTheme,
    name,
    setThemeName,
  }), [name, setThemeName]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

