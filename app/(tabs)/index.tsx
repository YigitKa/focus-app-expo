import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Moon,
  Flame,
  Zap,
  Trophy,
  Clock as ClockIcon,
  Target,
  Timer as TimerIcon,
} from 'lucide-react-native';
import { s, vs, ms, clamp, msc } from '@/lib/responsive';
import { t, resolveLang } from '@/lib/i18n';
import { usePrefs } from '@/context/PrefsContext';
import { useSessionStats, AchievementId, CompletedSession } from '@/context/SessionStatsContext';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

type Mode = 'work' | 'short' | 'long' | 'free';
type ScoreItem = { key: string; label: string; value: string; emphasis?: boolean; icon: React.ReactNode };

const TimerScreen = () => {
  const { width: winW, height: winH } = useWindowDimensions();
  const { prefs } = usePrefs();
  const uiLang = resolveLang(prefs.language);
  const { stats: sessionStats, recordSession, achievementStates, difficulty } = useSessionStats();
  const router = useRouter();
  const { theme } = useTheme();
  const palette = theme.colors;
  const styles = makeStyles(palette);
  const totals = sessionStats.totals;
  const totalScore = sessionStats.totalScore;
  const focusSeconds = sessionStats.focusSeconds;
  const formatCompactTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  const scoreItems: ScoreItem[] = useMemo(() => {
    // Larger icons in tiles
    const iconSize = msc(26, 20, 30);
    return [
      {
        key: 'work',
        label: t('timer.score.work', uiLang),
        value: totals.work.toString(),
        icon: <Target size={iconSize} color={palette.secondary} strokeWidth={2} />,
      },
      {
        key: 'short',
        label: t('timer.score.short', uiLang),
        value: totals.short.toString(),
        icon: <Coffee size={iconSize} color={palette.primary} strokeWidth={2} />,
      },
      {
        key: 'long',
        label: t('timer.score.long', uiLang),
        value: totals.long.toString(),
        icon: <Moon size={iconSize} color={palette.success} strokeWidth={2} />,
      },
      {
        key: 'sessions',
        label: t('stats.sessions', uiLang),
        value: sessionStats.totalSessions.toString(),
        icon: <ClockIcon size={iconSize} color={palette.primary} strokeWidth={2} />,
      },
      {
        key: 'focus',
        label: t('stats.focusTime', uiLang),
        value: formatCompactTime(focusSeconds),
        icon: <TimerIcon size={iconSize} color={palette.secondary} strokeWidth={2} />,
      },
      {
        key: 'streak',
        label: t('timer.score.streak', uiLang),
        value: `${sessionStats.currentStreakDays}/${sessionStats.bestStreakDays}`,
        icon: <Flame size={iconSize} color={palette.accent} strokeWidth={2} />,
      },
      {
        key: 'combo',
        label: t('timer.score.combo', uiLang),
        value: `${sessionStats.currentScoreStreak}/${sessionStats.bestScoreStreak}`,
        icon: <Zap size={iconSize} color={palette.warning} strokeWidth={2} />,
      },
      {
        key: 'score',
        label: t('timer.score.total', uiLang),
        value: totalScore.toString(),
        emphasis: true,
        icon: <Trophy size={iconSize} color={palette.warning} strokeWidth={2} />,
      },
    ];
  }, [
    totals.work,
    totals.short,
    totals.long,
    sessionStats.totalSessions,
    focusSeconds,
    sessionStats.currentStreakDays,
    sessionStats.bestStreakDays,
    sessionStats.currentScoreStreak,
    sessionStats.bestScoreStreak,
    totalScore,
    uiLang,
  ]);

  const workSec = Math.max(1, prefs.workDuration) * 60;
  const shortSec = Math.max(1, prefs.shortBreakDuration) * 60;
  const longSec = Math.max(1, prefs.longBreakDuration) * 60;
  const presetTimes: Record<Mode, number> = {
    work: workSec,
    short: shortSec,
    long: longSec,
    free: 0, // counts up
  };

  const [timeLeft, setTimeLeft] = useState(workSec); // default; synced below
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<Mode>('work');
  const base = Math.min(winW, winH);
  const isLandscape = winW > winH;
  const isPortrait = !isLandscape;
  const isCompact = isPortrait ? winW < 420 : winH < 540 || winW < 640;
  const isWeb = Platform.OS === 'web';
  const webDockHeight = 56; // sticky pro bar height on web
  const usePlayerLayout = isLandscape;
  // Make the ring smaller while enlarging time text later
  const circleSize = clamp(
    base * (isCompact && isPortrait ? 0.36 : 0.44),
    isCompact && isPortrait ? 130 : 200,
    isCompact && isPortrait ? 220 : 320
  );
  const controlIcon = usePlayerLayout ? msc(28, 22, 34) : isCompact ? msc(22, 18, 26) : msc(26, 20, 30);
  const buttonSize = isCompact || usePlayerLayout ? clamp(s(56), 50, 80) : clamp(s(64), 56, 84);
  const titleSize = usePlayerLayout ? msc(24, 18, 30) : isCompact ? msc(22, 16, 26) : msc(28, 18, 30);
  const subtitleSize = usePlayerLayout ? msc(13, 11, 18) : isCompact ? msc(12, 10, 16) : msc(14, 12, 18);
  // Bigger time text
  const timeSize = usePlayerLayout ? msc(44, 34, 56) : isCompact ? msc(40, 30, 52) : msc(52, 36, 64);
  const presetWidth = usePlayerLayout
    ? clamp(base * 0.28, 120, 200)
    : clamp(base * (isCompact ? 0.38 : 0.24), isCompact ? 96 : 92, isCompact ? 132 : 148);
  const presetSpacing = usePlayerLayout
    ? clamp(base * 0.14, vs(18), vs(36))
    : clamp(circleSize * 0.18, vs(18), vs(isCompact ? 48 : 60));
  const playerMaxWidth = clamp(
    winW * (usePlayerLayout ? 0.6 : 0.9),
    usePlayerLayout ? 420 : 320,
    usePlayerLayout ? 880 : 560
  );
  const playerButtonSize = clamp(s(usePlayerLayout ? 56 : 48), usePlayerLayout ? 52 : 44, usePlayerLayout ? 74 : 60);
  const useScrollPresets = !usePlayerLayout && isCompact;
  const playerContainerGap = vs(usePlayerLayout ? 20 : 16);
  const playerContainerMarginTop = vs(usePlayerLayout ? 24 : 12);

  const isBreak = mode === 'short' || mode === 'long';
  const total = mode === 'free' ? workSec : presetTimes[mode];
  const progress = mode === 'free'
    ? (Math.min(timeLeft, total) / Math.max(1, total)) * 100
    : ((total - timeLeft) / Math.max(1, total)) * 100;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      interval = setInterval(() =>
        setTimeLeft(prev => (mode === 'free' ? prev + 1 : Math.max(prev - 1, 0))),
      1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, mode]);

  useEffect(() => {
    if (mode !== 'free' && timeLeft === 0) {
      recordSession(mode, total);
      setIsActive(false);
      if (mode === 'work') {
        setMode('short');
      } else {
        setMode('work');
      }
    }
  }, [timeLeft, mode, recordSession, total]);

  // Sync timeLeft when mode or preset durations change
  useEffect(() => {
    setTimeLeft(mode === 'work' ? workSec : mode === 'short' ? shortSec : mode === 'long' ? longSec : 0);
  }, [mode, workSec, shortSec, longSec]);

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [glowAnim, isActive, pulseAnim]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    if (mode === 'free' && timeLeft > 0) {
      // Treat free focus as a work session when finished
      recordSession('work', timeLeft);
    }
    setIsActive(false);
    setMode('work');
    setTimeLeft(Math.max(1, prefs.workDuration) * 60);
  };

  const handlePresetPress = (nextMode: Mode) => {
    // If leaving free mode with elapsed time, record it as work
    if (mode === 'free' && nextMode !== 'free' && timeLeft > 0) {
      recordSession('work', timeLeft);
    }
    setMode(nextMode);
    setIsActive(false);
    setTimeLeft(nextMode === 'free' ? 0 : presetTimes[nextMode]);
  };

  const presetOptions: { key: Mode; label: string }[] = [
    { key: 'work', label: t('settings.work', uiLang) },
    { key: 'short', label: t('settings.shortBreak', uiLang) },
    { key: 'long', label: t('settings.longBreak', uiLang) },
    { key: 'free', label: t('settings.freeFocus', uiLang) },
  ];

  const presetButtons = presetOptions.map(({ key, label }) => (
    <TouchableOpacity
      key={key}
      onPress={() => handlePresetPress(key)}
      style={[
        styles.presetButton,
        // Equal-width grid when not using the horizontal scroller
        useScrollPresets ? { width: presetWidth } : styles.presetButtonEqual,
        isCompact && styles.presetButtonCompact,
        mode === key && styles.presetActive,
      ]}
    >
      <Text
        style={[
          styles.presetText,
          isCompact && styles.presetTextCompact,
          mode === key && styles.presetTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  ));
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Keyboard shortcuts for web (experienced use)
  useEffect(() => {
    if (!isWeb) return;
    const onKeyDown = (ev: any) => {
      const key = (ev?.key || '').toLowerCase();
      const tag = (ev?.target?.tagName || '').toLowerCase();
      const editable = tag === 'input' || tag === 'textarea' || tag === 'select' || ev?.target?.isContentEditable;
      if (editable) return; // don't hijack typing

      // Navigation
      if (key === 's') { router.push('/(tabs)/settings'); return; }
      if (key === 't') { router.push('/(tabs)/tasks'); return; }
      if (key === '?') { setShowShortcuts(prev => !prev); return; }

      // Timer controls
      if (key === ' ') { ev.preventDefault(); toggleTimer(); return; }
      if (key === 'k') { ev.preventDefault(); toggleTimer(); return; }
      if (key === 'r') { ev.preventDefault(); resetTimer(); return; }
      if (key === '1') { handlePresetPress('work'); return; }
      if (key === '2') { handlePresetPress('short'); return; }
      if (key === '3') { handlePresetPress('long'); return; }
      if (key === '4') { handlePresetPress('free'); return; }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isWeb, router, toggleTimer, resetTimer, handlePresetPress]);

  // Shortcuts help overlay state handled above

  // Fixed 4x2 grid for the scoreboard
  const portraitColumns = 4;
  const portraitBasis = '23%';

  const renderScoreBoard = (variant: 'portrait' | 'landscape') => (
    <View
      style={[
        styles.scoreSection,
        variant === 'landscape' ? styles.scoreSectionLandscape : styles.scoreSectionPortrait,
      ]}
    >
      {variant === 'portrait' && (
        <Text style={styles.scoreSectionTitle}>{t('timer.score.title', uiLang)}</Text>
      )}
      <View
        style={[
          styles.scoreBoard,
          variant === 'landscape' ? styles.scoreBoardLandscape : styles.scoreBoardPortrait,
        ]}
      >
        {scoreItems.map(item => (
          <View
            key={item.key}
            style={[
              styles.scoreItem,
              variant === 'landscape' && styles.scoreItemLandscape,
              // On wide web portrait, show smaller side-by-side tiles
              { flexBasis: portraitBasis, maxWidth: portraitBasis },
              item.emphasis && styles.scoreItemEmphasis,
            ]}
          >
            <View style={styles.scoreIcon}>{item.icon}</View>
            <Text style={styles.scoreLabel} numberOfLines={1} ellipsizeMode="tail">{item.label}</Text>
            <Text style={[
              styles.scoreValue,
              {
                color:
                  item.key === 'work' ? palette.secondary :
                  item.key === 'short' ? palette.primary :
                  item.key === 'long' ? palette.success :
                  item.key === 'streak' ? palette.accent :
                  item.key === 'combo' ? palette.warning :
                  palette.warning,
              },
            ]}
            >{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const StatsSection = () => {
    const focusMinutes = Math.round(sessionStats.focusSeconds / 60);
    const breakMinutes = Math.round(sessionStats.breakSeconds / 60);
    const completedSessions = sessionStats.completedSessions ?? [];
  
    const productivity = focusMinutes + breakMinutes > 0
      ? Math.round((focusMinutes / (focusMinutes + breakMinutes)) * 100)
      : 0;
    const breakShare = focusMinutes + breakMinutes > 0
      ? Math.round((breakMinutes / (focusMinutes + breakMinutes)) * 100)
      : 0;
    const workShare = sessionStats.totalSessions > 0 ? Math.round((sessionStats.totals.work / sessionStats.totalSessions) * 100) : 0;
    const shortShare = sessionStats.totalSessions > 0 ? Math.round((sessionStats.totals.short / sessionStats.totalSessions) * 100) : 0;
    const longShare = sessionStats.totalSessions > 0 ? Math.round((sessionStats.totals.long / sessionStats.totalSessions) * 100) : 0;
  
    const achievements = useMemo(() =>
      achievementStates.map(state => {
        const name = t(`stats.achievements.${state.id}.name`, uiLang);
        const description = t(`stats.achievements.${state.id}.description`, uiLang);
        return { ...state, name, description };
      }),
    [achievementStates, uiLang]);
  
    const unlockedCount = achievements.filter(item => item.unlocked).length;
  
    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };
  
    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
    };
  
    const formatAchievementProgress = (id: AchievementId, progress: number, target: number) => {
      switch (id) {
        case 'timeKeeper': {
          const currentHours = Math.floor(progress / 3600);
          const targetHours = Math.floor(target / 3600);
          return `${currentHours}h/${targetHours}h`;
        }
        case 'comboBreaker':
          return `${Math.min(Math.round(progress), Math.round(target))}/${Math.round(target)}`;
        default:
          return `${Math.min(Math.round(progress), Math.round(target))}/${Math.round(target)}`;
      }
    };
  
    const StatCard = ({
      icon,
      title,
      value,
      subtitle,
      color = '#00FFFF',
    }: {
      icon: React.ReactNode;
      title: string;
      value: string;
      subtitle: string;
      color?: string;
    }) => (
      <View style={[
        styles.statCard,
        { borderColor: color },
        // Use percentage-based grid to avoid overflow/misalignment on web
        { flexBasis: '48%', maxWidth: '48%' },
      ]}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}> 
          {icon}
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      </View>
    );
  
    const ProgressBar = ({
      label,
      percentage,
      color = '#FF00FF',
      detail,
    }: {
      label: string;
      percentage: number;
      color?: string;
      detail?: string;
    }) => {
      const clamped = Math.max(0, Math.min(100, percentage));
      return (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarHeader}>
            <Text style={styles.progressLabel}>{label}</Text>
            <Text style={[styles.progressPercentage, { color }]}>{detail ?? `${clamped}%`}</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[styles.progressBarFill, { width: `${clamped}%`, backgroundColor: color }]}
            />
          </View>
        </View>
      );
    };
  
    const SessionLog = ({ sessions }: { sessions: CompletedSession[] }) => (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('stats.sessionLog.title', uiLang)}</Text>
        <View style={styles.sessionLogContainer}>
          <ScrollView nestedScrollEnabled style={styles.sessionLogConsole}>
            {sessions.length > 0 ? (
              sessions.map(session => (
                <Text key={session.id} style={styles.sessionLogEntry}>
                  {`> ${t(`mode.${session.mode}`, uiLang).toUpperCase()} - ${formatDuration(session.durationSeconds)} | ${new Date(session.completedAt).toLocaleString(uiLang)}`}
                </Text>
              ))
            ) : (
              <Text style={styles.sessionLogEmpty}>{t('stats.sessionLog.empty', uiLang)}</Text>
            )}
          </ScrollView>
        </View>
      </View>
    );
  
    return (
      <View style={{marginTop: vs(24)}}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>{t('stats.title', uiLang)}</Text>
          <Text style={styles.statsSubtitle}>{t('stats.subtitle', uiLang)}</Text>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyLabel}>{t('stats.difficulty', uiLang)}</Text>
            <Text style={styles.difficultyValue}>{t(`difficulty.${difficulty}`, uiLang)}</Text>
          </View>
        </View>
  
        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <StatCard
              icon={<ClockIcon size={32} color="#FF00FF" strokeWidth={2} />}
              title={t('stats.focusTime', uiLang)}
              value={formatTime(focusMinutes)}
              subtitle={t('stats.focusSubtitle', uiLang)}
              color="#FF00FF"
            />
            <StatCard
              icon={<Zap size={32} color="#FFFF00" strokeWidth={2} />}
              title={t('stats.focusScore', uiLang)}
              value={sessionStats.totalScore.toString()}
              subtitle={t('stats.scoreSubtitle', uiLang)}
              color="#FFFF00"
            />
            <StatCard
              icon={<Target size={32} color="#00FFFF" strokeWidth={2} />}
              title={t('stats.sessions', uiLang)}
              value={sessionStats.totalSessions.toString()}
              subtitle={t('stats.sessionsSubtitle', uiLang)}
              color="#00FFFF"
            />
            <StatCard
              icon={<Trophy size={32} color="#00FF66" strokeWidth={2} />}
              title={t('stats.streak', uiLang)}
              value={`${sessionStats.currentStreakDays}/${sessionStats.bestStreakDays}`}
              subtitle={t('stats.streakSubtitle', uiLang)}
              color="#00FF66"
            />
            <StatCard
              icon={<Zap size={32} color="#FFA500" strokeWidth={2} />}
              title={t('stats.combo', uiLang)}
              value={`${sessionStats.currentScoreStreak}/${sessionStats.bestScoreStreak}`}
              subtitle={t('stats.comboSubtitle', uiLang)}
              color="#FFA500"
            />
          </View>
  
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('stats.breakdown', uiLang)}</Text>
            <ProgressBar
              label={t('stats.productivity', uiLang)}
              percentage={productivity}
              detail={`${productivity}%`}
              color="#00FFFF"
            />
            <ProgressBar
              label={t('stats.workSessions', uiLang)}
              percentage={workShare}
              detail={`${totals.work}/${sessionStats.totalSessions}`}
              color="#FF00FF"
            />
            <ProgressBar
              label={t('stats.shortBreaks', uiLang)}
              percentage={shortShare}
              detail={`${totals.short}/${sessionStats.totalSessions}`}
              color="#00FFFF"
            />
            <ProgressBar
              label={t('stats.longBreaks', uiLang)}
              percentage={longShare}
              detail={`${totals.long}/${sessionStats.totalSessions}`}
              color="#00FF66"
            />
            <ProgressBar
              label={t('stats.breakTime', uiLang)}
              percentage={breakShare}
              detail={`${formatTime(breakMinutes)} / ${formatTime(focusMinutes + breakMinutes)}`}
              color="#FFFF00"
            />
          </View>
  
          <SessionLog sessions={completedSessions} />
  
          <View style={styles.section}>
            <View style={styles.achievementHeader}>
              <Text style={styles.sectionTitle}>{t('stats.achievements', uiLang)}</Text>
              <Text style={styles.achievementCounter}>
                {`${unlockedCount}/${achievements.length} ${t('stats.unlockedCountLabel', uiLang)}`}
              </Text>
            </View>
            {achievements.map(achievement => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  {
                    borderColor: achievement.unlocked ? '#00FF66' : '#333366',
                    backgroundColor: achievement.unlocked ? 'rgba(0,255,102,0.1)' : 'rgba(51,51,102,0.1)',
                  },
                ]}
              >
                <Trophy
                  size={24}
                  color={achievement.unlocked ? '#00FF66' : '#666699'}
                  strokeWidth={2}
                />
                <View style={styles.achievementText}>
                  <Text
                    style={[
                      styles.achievementName,
                      { color: achievement.unlocked ? '#00FF66' : '#666699' },
                    ]}
                  >
                    {achievement.name}
                  </Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                </View>
                <View style={styles.achievementProgress}>
                  <Text style={styles.achievementProgressText}>
                    {formatAchievementProgress(achievement.id, achievement.progress, achievement.target)}
                  </Text>
                  {achievement.unlocked && (
                    <Text style={styles.unlockedText}>{t('stats.unlocked', uiLang)}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={theme.gradient}
      style={[
        styles.container,
        usePlayerLayout ? styles.landscapeContainer : styles.portraitContainer,
        !usePlayerLayout && isCompact && styles.compactContainer,
      ]}
    >
      <View style={styles.gridOverlay} />
      {isWeb ? (
        <>
          {/* Sticky pro bar for web */}
          <View
            style={[
              styles.webDock,
              { height: webDockHeight },
            ]}
          >
            <Text style={styles.webDockMode}>{mode === 'work' ? t('settings.work', uiLang) : mode === 'short' ? t('settings.shortBreak', uiLang) : mode === 'long' ? t('settings.longBreak', uiLang) : t('settings.freeFocus', uiLang)}</Text>
            <Text style={styles.webDockTime}>{formatTime(timeLeft)}</Text>
            <View style={styles.webDockControls}>
              <TouchableOpacity
                accessibilityLabel="Play/Pause (Space or K)"
                onPress={toggleTimer}
                style={[styles.webDockBtn, { cursor: 'pointer' } as any]}
              >
                {isActive ? (
                  <Pause size={18} color={palette.primary} strokeWidth={2} />
                ) : (
                  <Play size={18} color={palette.primary} strokeWidth={2} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Reset (R)"
                onPress={resetTimer}
                style={[styles.webDockBtn, { cursor: 'pointer' } as any]}
              >
                <RotateCcw size={18} color={palette.primary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={styles.webDockProgressBar}>
              <Animated.View
                style={[styles.webDockProgressFill, { width: `${progress}%`, backgroundColor: isBreak ? palette.accent : palette.secondary }]}
              />
            </View>
          </View>
          {/* Main scrollable content (offset for dock) */}
        <ScrollView
          style={styles.webScroll}
          contentContainerStyle={[styles.webScrollContent, { paddingTop: webDockHeight + vs(8) }]}
          showsVerticalScrollIndicator={true}
        >
          <View style={{ height: 0 }} />
          <View style={[styles.header, isCompact && styles.headerCompact, usePlayerLayout && styles.headerLandscape]}>
            <Text style={[styles.title, { fontSize: titleSize }]}>{t('timer.heading', uiLang)}</Text>
            <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
              {isBreak ? t('timer.break', uiLang) : t('timer.focus', uiLang)} ? {formatTime(timeLeft)}
            </Text>
          </View>

          {useScrollPresets ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.presetScrollContent, { paddingBottom: presetSpacing }]}
            >
              {presetButtons}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.presetRow,
                usePlayerLayout && { width: '100%', maxWidth: playerMaxWidth },
                { marginBottom: presetSpacing },
              ]}
            >
              {presetButtons}
            </View>
          )}

          {usePlayerLayout ? (
            <View
              style={[
                styles.playerContainer,
                {
                  alignSelf: 'center',
                  width: '100%',
                  flexGrow: 1,
                  maxWidth: playerMaxWidth,
                  marginTop: playerContainerMarginTop,
                  gap: playerContainerGap,
                },
              ]}
            >
              <View style={[styles.playerCard, styles.playerCardLandscape]}>
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerMode, { color: isBreak ? palette.accent : palette.primary }]}>
                    {isBreak ? t('timer.break', uiLang) : t('timer.focus', uiLang)}
                  </Text>
                  <Text style={[styles.playerTime, { color: isBreak ? palette.accent : palette.secondary, fontSize: timeSize }]}>
                    {formatTime(timeLeft)}
                  </Text>
                </View>
                <View style={[styles.playerControlsRow, styles.playerControlsRowLandscape]}>
                  <TouchableOpacity
                    style={[
                      styles.playerControlButton,
                      { width: playerButtonSize, height: playerButtonSize, borderRadius: playerButtonSize / 2 },
                    ]}
                    onPress={toggleTimer}
                  >
                    {isActive ? (
                      <Pause size={controlIcon} color={palette.primary} strokeWidth={2} />
                    ) : (
                      <Play size={controlIcon} color={palette.primary} strokeWidth={2} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.playerControlButton,
                      { width: playerButtonSize, height: playerButtonSize, borderRadius: playerButtonSize / 2 },
                    ]}
                    onPress={resetTimer}
                  >
                    <RotateCcw size={controlIcon} color={palette.primary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.playerProgressSection, styles.playerProgressSectionLandscape]}>
                <View style={styles.playerProgressBar}>
                  <Animated.View
                    style={[
                      styles.playerProgressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: isBreak ? palette.accent : palette.secondary,
                      },
                    ]}
                  />
                </View>
              </View>

              {renderScoreBoard('landscape')}
            </View>
          ) : (
            <View style={styles.timerSection}>
              <View style={styles.timerCircleContainer}>
              <Animated.View 
                style={[
                  styles.timerCircle,
                  {
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    transform: [{ scale: pulseAnim }],
                    shadowColor: isBreak ? palette.accent : palette.secondary,
                    shadowOpacity: glowAnim,
                  }
                ]}
              >
                <Text style={[styles.timeText, { color: isBreak ? palette.accent : palette.secondary, fontSize: timeSize }]}>
                  {formatTime(timeLeft)}
                </Text>
              </Animated.View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${progress}%`,
                        backgroundColor: isBreak ? palette.accent : palette.secondary,
                      }
                    ]} 
                  />
                </View>
              </View>

              <View style={styles.controlButtons}>
                <TouchableOpacity style={[styles.controlButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]} onPress={toggleTimer}>
                  {isActive ? (
                    <Pause size={controlIcon} color={palette.primary} strokeWidth={2} />
                  ) : (
                    <Play size={controlIcon} color={palette.primary} strokeWidth={2} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.controlButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]} onPress={resetTimer}>
                  <RotateCcw size={controlIcon} color={palette.primary} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {renderScoreBoard('portrait')}
            </View>
          )}
          <StatsSection />
        </ScrollView>
        {/* Shortcuts overlay */}
        {showShortcuts && (
          <View style={styles.shortcutOverlay}>
            <View style={styles.shortcutCard}>
              <Text style={styles.shortcutTitle}>Shortcuts</Text>
              <Text style={styles.shortcutRow}>Space / K — Play or Pause</Text>
              <Text style={styles.shortcutRow}>R — Reset timer</Text>
              <Text style={styles.shortcutRow}>1 / 2 / 3 / 4 — Work / Short / Long / Free</Text>
              <Text style={styles.shortcutRow}>S — Settings, T — Tasks, ? — Toggle help</Text>
              <TouchableOpacity onPress={() => setShowShortcuts(false)} style={[styles.webDockBtn, { alignSelf: 'center', marginTop: vs(10) }]}>
                <Text style={{ color: palette.primary, fontFamily: 'Courier New' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        </>
      ) : (
        <ScrollView>
          <View style={[styles.header, isCompact && styles.headerCompact, usePlayerLayout && styles.headerLandscape]}>
            <Text style={[styles.title, { fontSize: titleSize }]}>{t('timer.heading', uiLang)}</Text>
            <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
              {isBreak ? t('timer.break', uiLang) : t('timer.focus', uiLang)} ? {formatTime(timeLeft)}
            </Text>
          </View>

          {useScrollPresets ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.presetScrollContent, { paddingBottom: presetSpacing }]}
            >
              {presetButtons}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.presetRow,
                usePlayerLayout && { width: '100%', maxWidth: playerMaxWidth },
                { marginBottom: presetSpacing },
              ]}
            >
              {presetButtons}
            </View>
          )}

          {usePlayerLayout ? (
            <View
              style={[
                styles.playerContainer,
                {
                  alignSelf: 'center',
                  width: '100%',
                  flexGrow: 1,
                  maxWidth: playerMaxWidth,
                  marginTop: playerContainerMarginTop,
                  gap: playerContainerGap,
                },
              ]}
            >
              <View style={[styles.playerCard, styles.playerCardLandscape]}>
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerMode, { color: isBreak ? palette.accent : palette.primary }]}>
                    {isBreak ? t('timer.break', uiLang) : t('timer.focus', uiLang)}
                  </Text>
                  <Text style={[styles.playerTime, { color: isBreak ? palette.accent : palette.secondary, fontSize: timeSize }]}>
                    {formatTime(timeLeft)}
                  </Text>
                </View>
                <View style={[styles.playerControlsRow, styles.playerControlsRowLandscape]}>
                  <TouchableOpacity
                    style={[
                      styles.playerControlButton,
                      { width: playerButtonSize, height: playerButtonSize, borderRadius: playerButtonSize / 2 },
                    ]}
                    onPress={toggleTimer}
                  >
                    {isActive ? (
                      <Pause size={controlIcon} color={palette.primary} strokeWidth={2} />
                    ) : (
                      <Play size={controlIcon} color={palette.primary} strokeWidth={2} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.playerControlButton,
                      { width: playerButtonSize, height: playerButtonSize, borderRadius: playerButtonSize / 2 },
                    ]}
                    onPress={resetTimer}
                  >
                    <RotateCcw size={controlIcon} color={palette.primary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.playerProgressSection, styles.playerProgressSectionLandscape]}>
                <View style={styles.playerProgressBar}>
                  <Animated.View
                    style={[
                      styles.playerProgressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: isBreak ? palette.accent : palette.secondary,
                      },
                    ]}
                  />
                </View>
              </View>

              {renderScoreBoard('landscape')}
            </View>
          ) : (
            <View style={styles.timerSection}>
              <View style={styles.timerCircleContainer}>
              <Animated.View 
                style={[
                  styles.timerCircle,
                  {
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    transform: [{ scale: pulseAnim }],
                    shadowColor: isBreak ? palette.accent : palette.secondary,
                    shadowOpacity: glowAnim,
                  }
                ]}
              >
                <Text style={[styles.timeText, { color: isBreak ? palette.accent : palette.secondary, fontSize: timeSize }]}>
                  {formatTime(timeLeft)}
                </Text>
              </Animated.View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${progress}%`,
                        backgroundColor: isBreak ? palette.accent : palette.secondary,
                      }
                    ]} 
                  />
                </View>
              </View>

              <View style={styles.controlButtons}>
                <TouchableOpacity style={[styles.controlButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]} onPress={toggleTimer}>
                  {isActive ? (
                    <Pause size={controlIcon} color={palette.primary} strokeWidth={2} />
                  ) : (
                    <Play size={controlIcon} color={palette.primary} strokeWidth={2} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.controlButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]} onPress={resetTimer}>
                  <RotateCcw size={controlIcon} color={palette.primary} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {renderScoreBoard('portrait')}
            </View>
          )}
          <StatsSection />
        </ScrollView>
      )}

    </LinearGradient>
  );
}

export default TimerScreen;

const makeStyles = (palette: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  portraitContainer: {
    paddingHorizontal: s(8),
    paddingTop: vs(12),
    paddingBottom: vs(12),
  },
  compactContainer: {
    paddingTop: vs(8),
    paddingBottom: vs(8),
  },
  landscapeContainer: {
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
  },
  // Scroll wrapper for web to enable vertical scrolling
  webScroll: {
    flex: 1,
    width: '100%',
  },
  webScrollContent: {
    paddingBottom: vs(80), // leave room above the tab bar
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    alignItems: 'center',
    paddingVertical: vs(8),
  },
  statsHeader: {
    alignItems: 'center',
    paddingVertical: vs(16),
    gap: vs(12),
  },
  statsTitle: {
    fontFamily: 'Courier New',
    fontSize: ms(22),
    fontWeight: 'bold',
    color: '#FFFF00',
    letterSpacing: 3,
    textShadowColor: '#FF00FF',
    textShadowRadius: 10,
  },
  statsSubtitle: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    color: '#C3C7FF',
    letterSpacing: 1,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingHorizontal: s(14),
    paddingVertical: vs(6),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00FFFF',
    backgroundColor: 'rgba(0,255,255,0.15)',
  },
  difficultyLabel: {
    fontFamily: 'Courier New',
    fontSize: ms(10),
    color: '#00FFFF',
    letterSpacing: 1,
  },
  difficultyValue: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    fontWeight: 'bold',
    color: '#FFFF00',
    letterSpacing: 1,
  },
  headerCompact: {
    paddingVertical: vs(6),
  },
  headerLandscape: {
    paddingVertical: vs(8),
  },
  presetScrollContent: {
    paddingHorizontal: s(6),
    gap: s(6),
    columnGap: s(6),
    alignItems: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: s(6),
    marginTop: vs(6),
    paddingHorizontal: s(8),
    alignSelf: 'center',
    zIndex: 2,
  },
  presetButton: {
    paddingHorizontal: s(10),
    paddingVertical: s(6),
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Equal-width preset buttons for wide screens (web/tablet)
  presetButtonEqual: {
    flexGrow: 1,
    flexBasis: '24%',
    maxWidth: '24%',
    minWidth: s(120),
  },
  presetButtonCompact: {
    paddingVertical: s(6),
  },
  presetActive: {
    borderColor: palette.borderActive,
    backgroundColor: 'rgba(0,255,255,0.12)',
  },
  presetText: {
    fontFamily: 'monospace',
    fontSize: ms(10),
    color: palette.text,
    letterSpacing: 1,
    textAlign: 'center',
  },
  presetTextCompact: {
    fontSize: ms(9),
  },
  presetTextActive: {
    color: palette.primary,
    fontWeight: '700',
  },
  title: {
    fontFamily: 'monospace',
    fontSize: ms(28),
    fontWeight: 'bold',
    color: palette.primary,
    letterSpacing: 4,
    textShadowColor: palette.primary,
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: 'monospace',
    fontSize: ms(14),
    color: palette.secondary,
    letterSpacing: 2,
    marginTop: 8,
  },
  timerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(16),
    paddingTop: vs(8),
  },
  timerCircle: {
    borderWidth: 4,
    borderColor: palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,0,255,0.05)',
    marginTop: vs(6),
    shadowRadius: s(20),
    elevation: s(6),
  },
  timeText: {
    fontFamily: 'monospace',
    fontSize: ms(40),
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  progressContainer: {
    width: '100%',
    marginTop: vs(16),
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: s(8),
    backgroundColor: palette.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  controlButtons: {
    flexDirection: 'row',
    marginTop: vs(16),
    gap: s(20),
  },
  controlButton: {
    width: s(64),
    height: s(64),
    borderRadius: s(32),
    backgroundColor: 'rgba(0,255,255,0.1)',
    borderWidth: 2,
    borderColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerContainer: {
    width: '100%',
    paddingHorizontal: s(12),
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: s(16),
    paddingVertical: s(14),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.35)',
    backgroundColor: 'rgba(0,0,50,0.35)',
    gap: s(16),
  },
  playerCardLandscape: {
    paddingHorizontal: s(24),
    paddingVertical: s(18),
    gap: s(20),
  },
  playerInfo: {
    flex: 1,
    gap: vs(6),
  },
  playerMode: {
    fontFamily: 'monospace',
    fontSize: ms(12),
    letterSpacing: 2,
    color: palette.text,
  },
  playerTime: {
    fontFamily: 'monospace',
    fontSize: ms(32),
    fontWeight: '700',
    letterSpacing: 2,
  },
  playerControlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: s(12),
  },
  playerControlsRowLandscape: {
    justifyContent: 'flex-end',
    gap: s(16),
  },
  playerControlButton: {
    borderWidth: 2,
    borderColor: palette.primary,
    backgroundColor: 'rgba(0,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerProgressSection: {
    width: '100%',
    paddingHorizontal: s(4),
  },
  playerProgressSectionLandscape: {
    paddingHorizontal: s(12),
  },
  playerProgressBar: {
    width: '100%',
    height: s(8),
    backgroundColor: palette.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  playerProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreSection: {
    width: '100%',
    alignItems: 'stretch',
    marginTop: vs(16),
    paddingHorizontal: s(8),
  },
  scoreSectionPortrait: {},
  scoreSectionLandscape: {
    marginTop: vs(16),
  },
  scoreSectionTitle: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    color: palette.primary,
    letterSpacing: 2,
    marginBottom: vs(12),
    textAlign: 'center',
  },
  scoreBoard: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: s(12),
  },
  scoreBoardPortrait: {
    justifyContent: 'space-between',
  },
  scoreBoardLandscape: {
    justifyContent: 'space-between',
  },
  scoreItem: {
    flexGrow: 1,
    flexBasis: '48%',
    minWidth: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    backgroundColor: 'rgba(0,0,50,0.35)',
    borderRadius: 12,
    paddingVertical: vs(8),
    paddingHorizontal: s(8),
    alignItems: 'stretch',
    gap: vs(6),
  },
  scoreItemLandscape: {
    flexBasis: '23%',
    maxWidth: '23%',
  },
  scoreItemEmphasis: {
    borderColor: palette.accent,
    backgroundColor: 'rgba(255,255,0,0.12)',
  },
  scoreIcon: {
    marginBottom: vs(2),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  scoreLabel: {
    fontFamily: 'monospace',
    fontSize: ms(11),
    color: palette.text,
    letterSpacing: 1,
    textAlign: 'right',
  },
  scoreValue: {
    fontFamily: 'monospace',
    fontSize: ms(20),
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'right',
  },
  content: {
    paddingHorizontal: s(16),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: s(12),
    marginBottom: vs(20),
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderRadius: 12,
    padding: s(12),
    alignItems: 'center',
    marginBottom: vs(12),
  },
  iconContainer: {
    width: s(54),
    height: s(54),
    borderRadius: s(27),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(10),
  },
  statValue: {
    fontFamily: 'Courier New',
    fontSize: ms(18),
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontFamily: 'Courier New',
    fontSize: ms(11),
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statSubtitle: {
    fontFamily: 'Courier New',
    fontSize: ms(10),
    color: '#666699',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: vs(20),
  },
  sectionTitle: {
    fontFamily: 'Courier New',
    fontSize: ms(16),
    fontWeight: 'bold',
    color: '#00FFFF',
    letterSpacing: 2,
    marginBottom: vs(12),
  },
  progressBarContainer: {
    marginBottom: vs(14),
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(6),
  },
  progressLabel: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  progressPercentage: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: s(8),
    backgroundColor: '#333366',
    borderRadius: 4,
    overflow: 'hidden',
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  achievementCounter: {
    fontFamily: 'Courier New',
    fontSize: ms(11),
    color: '#FFFF00',
    letterSpacing: 1,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(12),
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: vs(10),
    gap: s(12),
  },
  achievementText: {
    flex: 1,
    gap: vs(4),
  },
  achievementName: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  achievementDescription: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    lineHeight: ms(16),
    color: '#B8BCFF',
    letterSpacing: 0.5,
  },
  achievementProgress: {
    alignItems: 'flex-end',
    gap: vs(4),
  },
  achievementProgressText: {
    fontFamily: 'Courier New',
    fontSize: ms(11),
    color: '#C3C7FF',
  },
  unlockedText: {
    fontFamily: 'Courier New',
    fontSize: ms(10),
    color: '#00FF66',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sessionLogContainer: {
    height: vs(200),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    borderColor: '#00FFFF',
    borderWidth: 1,
    padding: s(8),
  },
  sessionLogConsole: {
    flex: 1,
  },
  sessionLogEntry: {
    fontFamily: 'monospace',
    fontSize: ms(11),
    color: '#00FF41',
    marginBottom: vs(4),
  },
  sessionLogEmpty: {
    fontFamily: 'monospace',
    fontSize: ms(11),
    color: '#666699',
    textAlign: 'center',
  },
  // Web pro dock (sticky header)
  webDock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,20,0.9)',
    borderBottomColor: '#FF00FF',
    borderBottomWidth: 2,
    paddingHorizontal: s(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: s(12),
  },
  webDockMode: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    color: '#C3C7FF',
    letterSpacing: 1,
  },
  webDockTime: {
    fontFamily: 'monospace',
    fontSize: ms(20),
    fontWeight: '700',
    color: palette.secondary,
    letterSpacing: 1,
  },
  webDockControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  webDockBtn: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    borderWidth: 2,
    borderColor: palette.primary,
    backgroundColor: 'rgba(0,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webDockProgressBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: '#222244',
  },
  webDockProgressFill: {
    height: '100%',
  },
  // Shortcuts overlay
  shortcutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  },
  shortcutCard: {
    width: '90%',
    maxWidth: 520,
    backgroundColor: 'rgba(0,0,50,0.95)',
    borderWidth: 1,
    borderColor: '#333366',
    borderRadius: 12,
    padding: s(16),
  },
  shortcutTitle: {
    fontFamily: 'Courier New',
    fontSize: ms(16),
    color: '#00FFFF',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: vs(8),
  },
  shortcutRow: {
    fontFamily: 'monospace',
    fontSize: ms(12),
    color: '#C3C7FF',
    marginBottom: vs(4),
  },
});
