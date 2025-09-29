import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type SessionMode = 'work' | 'short' | 'long';
export type AchievementId = 'focusStarter' | 'breakChampion' | 'timeKeeper' | 'streakMaster' | 'comboBreaker';

export type AchievementState = {
  id: AchievementId;
  unlocked: boolean;
  progress: number;
  target: number;
};

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
  unlockedAchievements: Record<AchievementId, boolean>;
  lastWorkDate: string | null;
  lastSessionDate: string | null;
  lastUpdated: string | null;
  completedSessions: CompletedSession[];
};

type AchievementDefinition = {
  id: AchievementId;
  threshold: number;
  metric: (stats: SessionStats) => number;
};

const SCORE_WEIGHTS: Record<SessionMode, number> = {
  work: 10,
  short: 2,
  long: 5,
};

const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'focusStarter',
    threshold: 10,
    metric: stats => stats.totals.work,
  },
  {
    id: 'breakChampion',
    threshold: 20,
    metric: stats => stats.totals.short + stats.totals.long,
  },
  {
    id: 'timeKeeper',
    threshold: 600 * 60,
    metric: stats => stats.focusSeconds,
  },
  {
    id: 'streakMaster',
    threshold: 7,
    metric: stats => stats.bestStreakDays,
  },
  {
    id: 'comboBreaker',
    threshold: 600,
    metric: stats => stats.bestScoreStreak,
  },
];

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
  unlockedAchievements: {
    focusStarter: false,
    breakChampion: false,
    timeKeeper: false,
    streakMaster: false,
    comboBreaker: false,
  },
  lastWorkDate: null,
  lastSessionDate: null,
  lastUpdated: null,
  completedSessions: [],
};

const KEY = 'session_stats_v2'; // Incremented version due to data structure change
const MAX_SESSION_LOG = 100;

type SessionStatsCtx = {
  stats: SessionStats;
  ready: boolean;
  recordSession: (mode: SessionMode, durationSeconds: number, completedAt?: Date) => void;
  resetStats: () => void;
  resetWorkday: () => void;
  resetAchievements: () => void;
  achievementStates: AchievementState[];
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
    unlockedAchievements: {
      ...DEFAULT_STATS.unlockedAchievements,
      ...partial.unlockedAchievements,
    },
    completedSessions: partial.completedSessions ?? [],
  };
  if (merged.completedSessions.length > MAX_SESSION_LOG) {
    merged.completedSessions = merged.completedSessions.slice(0, MAX_SESSION_LOG);
  }
  return merged;
}

function evaluateAchievements(stats: SessionStats) {
  return ACHIEVEMENTS.reduce<Record<AchievementId, boolean>>((acc, achievement) => {
    acc[achievement.id] = achievement.metric(stats) >= achievement.threshold;
    return acc;
  }, {
    focusStarter: false,
    breakChampion: false,
    timeKeeper: false,
    streakMaster: false,
    comboBreaker: false,
  });
}

function buildAchievementStates(stats: SessionStats): AchievementState[] {
  return ACHIEVEMENTS.map(definition => {
    const value = definition.metric(stats);
    return {
      id: definition.id,
      unlocked: stats.unlockedAchievements[definition.id] ?? false,
      progress: value,
      target: definition.threshold,
    };
  });
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

        const sessionDay = toDayKey(completedAt);

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
          lastWorkDate,
          lastSessionDate: sessionDay,
          lastUpdated: completedAtISO,
          completedSessions: nextCompletedSessions,
        };

        const evaluated = evaluateAchievements(nextStats);
        nextStats.unlockedAchievements = {
          ...nextStats.unlockedAchievements,
          ...evaluated,
        };

        return nextStats;
      });
    },
    [updateStats]
  );

  const resetStats = useCallback(() => {
    setStats(() => {
      const next = { ...DEFAULT_STATS };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
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

  const resetAchievements = useCallback(() => {
    updateStats(prev => ({
      ...prev,
      unlockedAchievements: { ...DEFAULT_STATS.unlockedAchievements },
      totalScore: 0,
      currentScoreStreak: 0,
      bestScoreStreak: 0,
    }));
  }, [updateStats]);

  const achievementStates = useMemo(() => buildAchievementStates(stats), [stats]);

  const value = useMemo<SessionStatsCtx>(() => ({
    stats,
    ready,
    recordSession,
    resetStats,
    resetWorkday,
    resetAchievements,
    achievementStates,
  }), [stats, ready, recordSession, resetStats, resetWorkday, resetAchievements, achievementStates]);

  return <SessionStatsContext.Provider value={value}>{children}</SessionStatsContext.Provider>;
}

export function useSessionStats() {
  const ctx = useContext(SessionStatsContext);
  if (!ctx) throw new Error('useSessionStats must be used within SessionStatsProvider');
  return ctx;
}
