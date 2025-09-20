import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import { s, vs, ms, clamp, msc } from '@/lib/responsive';
import { t, resolveLang } from '@/lib/i18n';
import { usePrefs } from '@/context/PrefsContext';
import { useSessionStats } from '@/context/SessionStatsContext';

type Mode = 'work' | 'short' | 'long';

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
  const scoreItems = useMemo(() => [
    { key: 'work', label: t('timer.score.work', uiLang), value: totals.work.toString() },
    { key: 'short', label: t('timer.score.short', uiLang), value: totals.short.toString() },
    { key: 'long', label: t('timer.score.long', uiLang), value: totals.long.toString() },
    { key: 'streak', label: t('timer.score.streak', uiLang), value: `${sessionStats.currentStreakDays}/${sessionStats.bestStreakDays}` },
    { key: 'combo', label: t('timer.score.combo', uiLang), value: `${sessionStats.currentScoreStreak}/${sessionStats.bestScoreStreak}` },
    { key: 'score', label: t('timer.score.total', uiLang), value: totalScore.toString(), emphasis: true },
  ], [
    totals.work,
    totals.short,
    totals.long,
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
  };

  const [timeLeft, setTimeLeft] = useState(workSec); // default; synced below
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<Mode>('work');
  const base = Math.min(winW, winH);
  const isLandscape = winW > winH;
  const isPortrait = !isLandscape;
  const isCompact = isPortrait ? winW < 420 : winH < 540 || winW < 640;
  const usePlayerLayout = isLandscape;
  const circleSize = clamp(
    base * (isCompact && isPortrait ? 0.42 : 0.5),
    isCompact && isPortrait ? 150 : 220,
    isCompact && isPortrait ? 260 : 360
  );
  const controlIcon = usePlayerLayout ? msc(28, 22, 34) : isCompact ? msc(22, 18, 26) : msc(26, 20, 30);
  const buttonSize = isCompact || usePlayerLayout ? clamp(s(56), 50, 80) : clamp(s(64), 56, 84);
  const titleSize = usePlayerLayout ? msc(24, 18, 30) : isCompact ? msc(22, 16, 26) : msc(28, 18, 30);
  const subtitleSize = usePlayerLayout ? msc(13, 11, 18) : isCompact ? msc(12, 10, 16) : msc(14, 12, 18);
  const timeSize = usePlayerLayout ? msc(34, 26, 44) : isCompact ? msc(32, 24, 40) : msc(40, 28, 48);
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

  const total = presetTimes[mode];
  const progress = ((total - timeLeft) / Math.max(1, total)) * 100;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
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
    setTimeLeft(mode === 'work' ? workSec : mode === 'short' ? shortSec : longSec);
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
    setIsActive(false);
    setMode('work');
    setTimeLeft(Math.max(1, prefs.workDuration) * 60);
  };

  const handlePresetPress = (nextMode: Mode) => {
    setMode(nextMode);
    setIsActive(false);
    setTimeLeft(presetTimes[nextMode]);
  };

  const presetOptions: { key: Mode; label: string }[] = [
    { key: 'work', label: t('settings.work', uiLang) },
    { key: 'short', label: t('settings.shortBreak', uiLang) },
    { key: 'long', label: t('settings.longBreak', uiLang) },
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
              item.emphasis && styles.scoreItemEmphasis,
            ]}
          >
            <Text style={styles.scoreLabel}>{item.label}</Text>
            <Text style={[styles.scoreValue, { color: item.key === 'work' ? palette.secondary : item.key === 'short' ? palette.primary : item.key === 'long' ? palette.success : item.key === 'streak' ? palette.accent : palette.warning }]}>{item.value}</Text>
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
      
      <View style={[styles.header, isCompact && styles.headerCompact, usePlayerLayout && styles.headerLandscape]}>
        <Text style={[styles.title, { fontSize: titleSize }]}>{t('timer.heading', uiLang)}</Text>
        <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
          {mode === 'work' ? t('timer.focus', uiLang) : t('timer.break', uiLang)} ? {formatTime(timeLeft)}
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
              <Text style={[styles.playerMode, { color: mode !== 'work' ? palette.accent : palette.primary }]}>
                {mode === 'work' ? t('timer.focus', uiLang) : t('timer.break', uiLang)}
              </Text>
              <Text style={[styles.playerTime, { color: mode !== 'work' ? palette.accent : palette.secondary, fontSize: timeSize }]}>
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
                    backgroundColor: mode !== 'work' ? palette.accent : palette.secondary,
                  },
                ]}
              />
            </View>
          </View>

          {renderScoreBoard('landscape')}
        </View>
      ) : (
        <View style={styles.timerSection}>
          <Animated.View 
            style={[
              styles.timerCircle,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                transform: [{ scale: pulseAnim }],
                shadowColor: mode !== 'work' ? palette.accent : palette.secondary,
                shadowOpacity: glowAnim,
              }
            ]}
          >
            <Text style={[styles.timeText, { color: mode !== 'work' ? palette.accent : palette.secondary, fontSize: timeSize }]}>
              {formatTime(timeLeft)}
            </Text>
          </Animated.View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${progress}%`,
                    backgroundColor: mode !== 'work' ? palette.accent : palette.secondary,
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

    </LinearGradient>
  );
}

export default TimerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  portraitContainer: {
    paddingHorizontal: s(16),
    paddingTop: vs(24),
    paddingBottom: vs(24),
  },
  compactContainer: {
    paddingTop: vs(16),
    paddingBottom: vs(16),
  },
  landscapeContainer: {
    paddingHorizontal: s(28),
    paddingVertical: vs(18),
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
    paddingVertical: vs(16),
  },
  headerCompact: {
    paddingVertical: vs(10),
  },
  headerLandscape: {
    paddingVertical: vs(12),
  },
  presetScrollContent: {
    paddingHorizontal: s(12),
    gap: s(8),
    columnGap: s(8),
    alignItems: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: s(8),
    marginTop: vs(10),
    paddingHorizontal: s(12),
    alignSelf: 'center',
    zIndex: 2,
  },
  presetButton: {
    paddingHorizontal: s(12),
    paddingVertical: s(8),
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
    paddingHorizontal: s(24),
    paddingTop: vs(12),
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
    marginTop: vs(24),
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
    marginTop: vs(24),
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
    paddingHorizontal: s(16),
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
    marginTop: vs(24),
  },
  scoreSectionPortrait: {
    paddingHorizontal: s(12),
  },
  scoreSectionLandscape: {
    marginTop: vs(16),
  },
  scoreSectionTitle: {
    fontFamily: 'monospace',
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
    minWidth: s(120),
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    backgroundColor: 'rgba(0,0,50,0.35)',
    borderRadius: 12,
    paddingVertical: vs(10),
    paddingHorizontal: s(10),
    alignItems: 'center',
    gap: vs(6),
  },
  scoreItemLandscape: {
    flexBasis: '22%',
    maxWidth: '24%',
  },
  scoreItemEmphasis: {
    borderColor: palette.accent,
    backgroundColor: 'rgba(255,255,0,0.12)',
  },
  scoreLabel: {
    fontFamily: 'monospace',
    fontSize: ms(11),
    color: palette.text,
    letterSpacing: 1,
  },
  scoreValue: {
    fontFamily: 'monospace',
    fontSize: ms(20),
    fontWeight: '700',
    letterSpacing: 1,
  },
});