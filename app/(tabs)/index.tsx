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
import { useSessionStats } from '@/context/SessionStatsContext';

type Mode = 'work' | 'short' | 'long' | 'free';
type ScoreItem = { key: string; label: string; value: string; emphasis?: boolean; icon: React.ReactNode };

const palette = {
  primary: '#00FFFF', // Cyan
  secondary: '#FF00FF', // Magenta
  accent: '#FFFF00', // Yellow
  background: '#000011',
  background2: '#001122',
  background3: '#000033',
  text: '#C3C7FF',
  textEmphasis: '#FFFFFF',
  border: '#333366',
  borderActive: '#00FFFF',
  success: '#00FF66',
  warning: '#FFA500',
};

const TimerScreen = () => {
  const { width: winW, height: winH } = useWindowDimensions();
  const { prefs } = usePrefs();
  const uiLang = resolveLang(prefs.language);
  const { stats: sessionStats, recordSession } = useSessionStats();
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
        { width: presetWidth },
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
            <Text style={styles.scoreLabel}>{item.label}</Text>
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

  return (
    <LinearGradient
      colors={[palette.background, palette.background2, palette.background3]}
      style={[
        styles.container,
        usePlayerLayout ? styles.landscapeContainer : styles.portraitContainer,
        !usePlayerLayout && isCompact && styles.compactContainer,
      ]}
    >
      <View style={styles.gridOverlay} />
      {isWeb ? (
        <ScrollView
          style={styles.webScroll}
          contentContainerStyle={styles.webScrollContent}
          showsVerticalScrollIndicator={true}
        >
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
        </ScrollView>
      ) : (
        <>
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
        </>
      )}

    </LinearGradient>
  );
}

export default TimerScreen;

const styles = StyleSheet.create({
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
    justifyContent: 'center',
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
});
