import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type SessionMode = 'work' | 'short' | 'long';
export type DailyGoalId = 'workSessions' | 'shortBreaks' | 'longBreaks' | 'completedTasks';

export type DailyGoal = {
  id: DailyGoalId;
  progress: number;
  target: number;
};

export type DailyGoals = Record<DailyGoalId, DailyGoal>;

export type CompletedSession = {
  id: string;
  mode: SessionMode;
  durationSeconds: number;
  completedAt: string;
};

export type SessionStats = {
  totals: Record<SessionMode, number>;
  totalSessions: number;
  focusSeconds: number;
  breakSeconds: number;
  totalScore: number;
  currentStreakDays: number;
  bestStreakDays: number;
  currentScoreStreak: number;
  bestScoreStreak: number;
  dailyGoals: DailyGoals;
  lastWorkDate: string | null;
  lastSessionDate: string | null;
  lastUpdated: string | null;
  completedSessions: CompletedSession[];
};

const SCORE_WEIGHTS: Record<SessionMode, number> = {
  work: 10,
  short: 2,
  long: 5,
};

const DEFAULT_STATS: SessionStats = {
  totals: { work: 0, short: 0, long: 0 },
  totalSessions: 0,
  focusSeconds: 0,
  breakSeconds: 0,
  totalScore: 0,
  currentStreakDays: 0,
  bestStreakDays: 0,
  currentScoreStreak: 0,
  bestScoreStreak: 0,
  dailyGoals: {
    workSessions: { id: 'workSessions', progress: 0, target: 8 },
    shortBreaks: { id: 'shortBreaks', progress: 0, target: 7 },
    longBreaks: { id: 'longBreaks', progress: 0, target: 1 },
    completedTasks: { id: 'completedTasks', progress: 0, target: 5 },
  },
  lastWorkDate: null,
  lastSessionDate: null,
  lastUpdated: null,
  completedSessions: [],
};

function cloneDefaultStats(): SessionStats {
  return {
    ...DEFAULT_STATS,
    totals: { ...DEFAULT_STATS.totals },
    dailyGoals: {
      workSessions: { ...DEFAULT_STATS.dailyGoals.workSessions },
      shortBreaks: { ...DEFAULT_STATS.dailyGoals.shortBreaks },
      longBreaks: { ...DEFAULT_STATS.dailyGoals.longBreaks },
      completedTasks: { ...DEFAULT_STATS.dailyGoals.completedTasks },
    },
    completedSessions: [...DEFAULT_STATS.completedSessions],
  };
}

const KEY = 'session_stats_v3'; // Incremented version due to data structure change
const MAX_SESSION_LOG = 100;

type SessionStatsCtx = {
  stats: SessionStats;
  ready: boolean;
  recordSession: (mode: SessionMode, durationSeconds: number, completedAt?: Date) => void;
  incrementCompletedTasks: (count?: number) => void;
  resetStats: () => void;
  resetWorkday: () => void;
};

const SessionStatsContext = createContext<SessionStatsCtx | undefined>(undefined);

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function diffInDays(current: string, previous: string) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const now = new Date(`${current}T00:00:00.000Z`);
  const then = new Date(`${previous}T00:00:00.000Z`);
  return Math.floor((now.getTime() - then.getTime()) / msPerDay);
}

function mergeStats(partial: Partial<SessionStats>): SessionStats {
  const merged = {
    ...DEFAULT_STATS,
    ...partial,
    totals: {
      ...DEFAULT_STATS.totals,
      ...partial.totals,
    },
    dailyGoals: {
      ...DEFAULT_STATS.dailyGoals,
      ...partial.dailyGoals,
    },
    completedSessions: partial.completedSessions ?? [],
  };
  if (merged.completedSessions.length > MAX_SESSION_LOG) {
    merged.completedSessions = merged.completedSessions.slice(0, MAX_SESSION_LOG);
  }
  return merged;
}

export function SessionStatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<SessionStats>(DEFAULT_STATS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => {
        if (!raw) return mergeStats({});
        try {
          const parsed = JSON.parse(raw) as Partial<SessionStats>;
          return mergeStats(parsed);
        } catch {
          return mergeStats({});
        }
      })
      .then(initial => {
        setStats(initial);
      })
      .finally(() => setReady(true));
  }, []);

  const updateStats = useCallback((updater: (prev: SessionStats) => SessionStats) => {
    setStats(prev => {
      const next = updater(prev);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const recordSession = useCallback(
    (mode: SessionMode, durationSeconds: number, completedAt: Date = new Date()) => {
      updateStats(prev => {
        const completedAtISO = completedAt.toISOString();
        const sessionDay = toDayKey(completedAt);

        let dailyGoals = { ...prev.dailyGoals };
        // Reset daily goals if it's a new day
        if (prev.lastUpdated && toDayKey(new Date(prev.lastUpdated)) !== sessionDay) {
          dailyGoals = {
            workSessions: { ...dailyGoals.workSessions, progress: 0 },
            shortBreaks: { ...dailyGoals.shortBreaks, progress: 0 },
            longBreaks: { ...dailyGoals.longBreaks, progress: 0 },
            completedTasks: { ...dailyGoals.completedTasks, progress: 0 },
          };
        }

        // Update daily goal progress based on session mode
        if (mode === 'work') {
          dailyGoals.workSessions.progress += 1;
        } else if (mode === 'short') {
          dailyGoals.shortBreaks.progress += 1;
        } else if (mode === 'long') {
          dailyGoals.longBreaks.progress += 1;
        }

        const newSession: CompletedSession = {
          id: completedAtISO,
          mode,
          durationSeconds,
          completedAt: completedAtISO,
        };

        const nextCompletedSessions = [newSession, ...(prev.completedSessions ?? [])].slice(0, MAX_SESSION_LOG);

        const totals: Record<SessionMode, number> = {
          ...prev.totals,
          [mode]: prev.totals[mode] + 1,
        };

        const focusSeconds = mode === 'work' ? prev.focusSeconds + durationSeconds : prev.focusSeconds;
        const breakSeconds = mode !== 'work' ? prev.breakSeconds + durationSeconds : prev.breakSeconds;
        const totalSessions = prev.totalSessions + 1;

        let currentStreakDays = prev.currentStreakDays;
        let bestStreakDays = prev.bestStreakDays;
        let lastWorkDate = prev.lastWorkDate;
        let streakBonus = 0;

        if (mode === 'work') {
          if (lastWorkDate) {
            const delta = diffInDays(sessionDay, lastWorkDate);
            if (delta === 1) {
              currentStreakDays++;
              streakBonus = Math.min(10, currentStreakDays) * 5;
            } else if (delta > 1) {
              currentStreakDays = 1;
            }
          } else {
            currentStreakDays = 1;
          }
          lastWorkDate = sessionDay;
          bestStreakDays = Math.max(bestStreakDays, currentStreakDays);
        }

        let currentScoreStreak = prev.currentScoreStreak;
        let comboBonus = 0;
        if (prev.lastSessionDate && diffInDays(sessionDay, prev.lastSessionDate) === 0) {
          currentScoreStreak++;
          comboBonus = Math.min(5, currentScoreStreak) * 2;
        } else {
          currentScoreStreak = 1;
        }
        const bestScoreStreak = Math.max(prev.bestScoreStreak, currentScoreStreak);

        const baseScore = SCORE_WEIGHTS[mode];
        const totalScore = prev.totalScore + baseScore + streakBonus + comboBonus;

        const nextStats: SessionStats = {
          ...prev,
          totals,
          totalSessions,
          focusSeconds,
          breakSeconds,
          totalScore,
          currentStreakDays,
          bestStreakDays,
          currentScoreStreak,
          bestScoreStreak,
          dailyGoals,
          lastWorkDate,
          lastSessionDate: sessionDay,
          lastUpdated: completedAtISO,
          completedSessions: nextCompletedSessions,
        };

        return nextStats;
      });
    },
    [updateStats]
  );

  const incrementCompletedTasks = useCallback(
    (count = 1) => {
      updateStats(prev => {
        const today = toDayKey(new Date());
        let dailyGoals = { ...prev.dailyGoals };

        // Reset progress if last update was on a different day
        if (prev.lastUpdated && toDayKey(new Date(prev.lastUpdated)) !== today) {
          dailyGoals = {
            workSessions: { ...dailyGoals.workSessions, progress: 0 },
            shortBreaks: { ...dailyGoals.shortBreaks, progress: 0 },
            longBreaks: { ...dailyGoals.longBreaks, progress: 0 },
            completedTasks: { ...dailyGoals.completedTasks, progress: 0 },
          };
        }

        return {
          ...prev,
          dailyGoals: {
            ...dailyGoals,
            completedTasks: {
              ...dailyGoals.completedTasks,
              progress: dailyGoals.completedTasks.progress + count,
            },
          },
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    [updateStats]
  );

  const resetStats = useCallback(() => {
    const next = cloneDefaultStats();
    setStats(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const resetWorkday = useCallback(() => {
    updateStats(prev => ({
      ...prev,
      currentStreakDays: 0,
      currentScoreStreak: 0,
      lastWorkDate: null,
      lastSessionDate: null,
    }));
  }, [updateStats]);

  const value = useMemo<SessionStatsCtx>(() => ({
    stats,
    ready,
    recordSession,
    incrementCompletedTasks,
    resetStats,
    resetWorkday,
  }), [stats, ready, recordSession, incrementCompletedTasks, resetStats, resetWorkday]);

  return <SessionStatsContext.Provider value={value}>{children}</SessionStatsContext.Provider>;
}

export function useSessionStats() {
  const ctx = useContext(SessionStatsContext);
  if (!ctx) throw new Error('useSessionStats must be used within SessionStatsProvider');
  return ctx;
}
