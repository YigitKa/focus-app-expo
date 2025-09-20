import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type SessionMode = 'work' | 'short' | 'long';
export type DifficultyLevel = 'easy' | 'normal' | 'hard';
export type AchievementId = 'focusStarter' | 'breakChampion' | 'timeKeeper' | 'streakMaster' | 'comboBreaker';

export type AchievementState = {
  id: AchievementId;
  unlocked: boolean;
  progress: number;
  target: number;
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
  achievementDifficulty: DifficultyLevel;
  unlockedAchievements: Record<AchievementId, boolean>;
  lastWorkDate: string | null;
  lastSessionDate: string | null;
  lastUpdated: string | null;
};

type AchievementDefinition = {
  id: AchievementId;
  thresholds: Record<DifficultyLevel, number>;
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
    thresholds: { easy: 5, normal: 10, hard: 20 },
    metric: stats => stats.totals.work,
  },
  {
    id: 'breakChampion',
    thresholds: { easy: 10, normal: 20, hard: 40 },
    metric: stats => stats.totals.short + stats.totals.long,
  },
  {
    id: 'timeKeeper',
    thresholds: { easy: 300 * 60, normal: 600 * 60, hard: 1200 * 60 },
    metric: stats => stats.focusSeconds,
  },
  {
    id: 'streakMaster',
    thresholds: { easy: 3, normal: 7, hard: 14 },
    metric: stats => stats.bestStreakDays,
  },
  {
    id: 'comboBreaker',
    thresholds: { easy: 300, normal: 600, hard: 900 },
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
  achievementDifficulty: 'normal',
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
};

const KEY = 'session_stats_v1';

type ResetOptions = { keepDifficulty?: boolean };

type SessionStatsCtx = {
  stats: SessionStats;
  ready: boolean;
  recordSession: (mode: SessionMode, durationSeconds: number, completedAt?: Date) => void;
  resetStats: (options?: ResetOptions) => void;
  setAchievementDifficulty: (level: DifficultyLevel) => void;
  achievementStates: AchievementState[];
  difficulty: DifficultyLevel;
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
  return {
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
  };
}

function evaluateAchievements(stats: SessionStats, difficulty: DifficultyLevel) {
  return ACHIEVEMENTS.reduce<Record<AchievementId, boolean>>((acc, achievement) => {
    const target = achievement.thresholds[difficulty];
    acc[achievement.id] = achievement.metric(stats) >= target;
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
  const difficulty = stats.achievementDifficulty;
  return ACHIEVEMENTS.map(definition => {
    const target = definition.thresholds[difficulty];
    const value = definition.metric(stats);
    return {
      id: definition.id,
      unlocked: stats.unlockedAchievements[definition.id] ?? false,
      progress: value,
      target,
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
              streakBonus = Math.min(10, currentStreakDays) * 5; // Bonus increases with streak, capped at 50
            } else if (delta > 1) {
              currentStreakDays = 1; // Reset streak
            }
          } else {
            currentStreakDays = 1; // First work session
          }
          lastWorkDate = sessionDay;
          bestStreakDays = Math.max(bestStreakDays, currentStreakDays);
        }

        let currentScoreStreak = prev.currentScoreStreak;
        let comboBonus = 0;
        if (prev.lastSessionDate && diffInDays(sessionDay, prev.lastSessionDate) === 0) {
          currentScoreStreak++;
          comboBonus = Math.min(5, currentScoreStreak) * 2; // Bonus increases with combo, capped at 10
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
          lastUpdated: completedAt.toISOString(),
        };

        const evaluated = evaluateAchievements(nextStats, nextStats.achievementDifficulty);
        nextStats.unlockedAchievements = {
          ...nextStats.unlockedAchievements,
          ...evaluated,
        };

        return nextStats;
      });
    },
    [updateStats]
  );

  const resetStats = useCallback((options?: ResetOptions) => {
    setStats(prev => {
      const base = options?.keepDifficulty
        ? { ...DEFAULT_STATS, achievementDifficulty: prev.achievementDifficulty }
        : DEFAULT_STATS;
      const evaluated = evaluateAchievements(base, base.achievementDifficulty);
      const next = {
        ...base,
        unlockedAchievements: {
          ...base.unlockedAchievements,
          ...evaluated,
        },
      };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setAchievementDifficulty = useCallback((level: DifficultyLevel) => {
    updateStats(prev => {
      const next = {
        ...prev,
        achievementDifficulty: level,
      };
      next.unlockedAchievements = evaluateAchievements(next, level);
      return next;
    });
  }, [updateStats]);

  const achievementStates = useMemo(() => buildAchievementStates(stats), [stats]);

  const value = useMemo<SessionStatsCtx>(() => ({
    stats,
    ready,
    recordSession,
    resetStats,
    setAchievementDifficulty,
    achievementStates,
    difficulty: stats.achievementDifficulty,
  }), [stats, ready, recordSession, resetStats, setAchievementDifficulty, achievementStates]);

  return <SessionStatsContext.Provider value={value}>{children}</SessionStatsContext.Provider>;
}

export function useSessionStats() {
  const ctx = useContext(SessionStatsContext);
  if (!ctx) throw new Error('useSessionStats must be used within SessionStatsProvider');
  return ctx;
}
