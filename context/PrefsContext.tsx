import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LanguagePref = 'system' | 'en' | 'tr';

export type Prefs = {
  language: LanguagePref;
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  autoProgress: boolean;
};

const DEFAULT_PREFS: Prefs = {
  language: 'system',
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoProgress: true,
};

const KEY = 'app_prefs_v1';

type Ctx = {
  prefs: Prefs;
  ready: boolean;
  updatePrefs: (patch: Partial<Prefs>) => Promise<void>;
  reload: () => Promise<void>;
};

const PrefsContext = createContext<Ctx | undefined>(undefined);

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Prefs>;
        setPrefs({ ...DEFAULT_PREFS, ...parsed });
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updatePrefs = useCallback(async (patch: Partial<Prefs>) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <PrefsContext.Provider value={{ prefs, ready, updatePrefs, reload: load }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used within PrefsProvider');
  return ctx;
}
