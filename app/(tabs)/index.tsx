import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react-native';
import { s, vs, ms, clamp, msc } from '@/lib/responsive';
import { t, resolveLang } from '@/lib/i18n';
import { usePrefs } from '@/context/PrefsContext';

type Mode = 'work' | 'short' | 'long';

export default function TimerScreen() {
  const { width: winW, height: winH } = useWindowDimensions();
  const { prefs } = usePrefs();
  const uiLang = resolveLang(prefs.language);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // default; synced below
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<Mode>('work');
  const [sessions, setSessions] = useState(0);
  const base = Math.min(winW, winH);
  const circleSize = clamp(base * 0.5, 220, 360);
  const controlIcon = msc(26, 20, 30);
  const buttonSize = clamp(s(64), 56, 84);
  const titleSize = msc(28, 18, 30);
  const subtitleSize = msc(14, 12, 18);
  const timeSize = msc(40, 28, 48);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'work') {
        setSessions(s => s + 1);
        setMode('short');
        setTimeLeft(Math.max(1, prefs.shortBreakDuration) * 60);
      } else {
        setMode('work');
        setTimeLeft(Math.max(1, prefs.workDuration) * 60);
      }
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft, mode, prefs.shortBreakDuration, prefs.workDuration]);

  // Sync timeLeft when mode or preset durations change
  useEffect(() => {
    const work = Math.max(1, prefs.workDuration) * 60;
    const shortB = Math.max(1, prefs.shortBreakDuration) * 60;
    const longB = Math.max(1, prefs.longBreakDuration) * 60;
    setTimeLeft(mode === 'work' ? work : mode === 'short' ? shortB : longB);
  }, [prefs.workDuration, prefs.shortBreakDuration, prefs.longBreakDuration, mode]);

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
  }, [isActive]);

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

  const workSec = Math.max(1, prefs.workDuration) * 60;
  const shortSec = Math.max(1, prefs.shortBreakDuration) * 60;
  const longSec = Math.max(1, prefs.longBreakDuration) * 60;
  const total = mode === 'work' ? workSec : mode === 'short' ? shortSec : longSec;
  const progress = ((total - timeLeft) / total) * 100;

  return (
    <LinearGradient colors={['#000011', '#001122', '#000033']} style={styles.container}>
      <View style={styles.gridOverlay} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: titleSize }]}>{t('timer.heading', uiLang)}</Text>
        <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
          {mode === 'work' ? t('timer.focus', uiLang) : t('timer.break', uiLang)}
        </Text>
      </View>

      <View style={styles.presetRow}>
        <TouchableOpacity
          onPress={() => { setMode('work'); setIsActive(false); setTimeLeft(workSec); }}
          style={[styles.presetButton, mode === 'work' && styles.presetActive]}
        >
          <Text style={[styles.presetText, mode === 'work' && styles.presetTextActive]}>
            {t('settings.work', uiLang)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setMode('short'); setIsActive(false); setTimeLeft(shortSec); }}
          style={[styles.presetButton, mode === 'short' && styles.presetActive]}
        >
          <Text style={[styles.presetText, mode === 'short' && styles.presetTextActive]}>
            {t('settings.shortBreak', uiLang)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setMode('long'); setIsActive(false); setTimeLeft(longSec); }}
          style={[styles.presetButton, mode === 'long' && styles.presetActive]}
        >
          <Text style={[styles.presetText, mode === 'long' && styles.presetTextActive]}>
            {t('settings.longBreak', uiLang)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerSection}>
        <Animated.View 
          style={[
            styles.timerCircle,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              transform: [{ scale: pulseAnim }],
              shadowColor: mode !== 'work' ? '#FFFF00' : '#FF00FF',
              shadowOpacity: glowAnim,
            }
          ]}
        >
          <Text style={[styles.timeText, { color: mode !== 'work' ? '#FFFF00' : '#FF00FF', fontSize: timeSize }]}>
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
                  backgroundColor: mode !== 'work' ? '#FFFF00' : '#FF00FF',
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.controlButtons}>
          <TouchableOpacity style={[styles.controlButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]} onPress={toggleTimer}>
            {isActive ? (
              <Pause size={controlIcon} color="#00FFFF" strokeWidth={2} />
            ) : (
              <Play size={controlIcon} color="#00FFFF" strokeWidth={2} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]} onPress={resetTimer}>
            <RotateCcw size={controlIcon} color="#00FFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Coffee size={24} color="#FFFF00" strokeWidth={2} />
            <Text style={styles.statText}>{t('label.sessions', uiLang)}</Text>
            <Text style={styles.statNumber}>{sessions}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: vs(24),
    paddingBottom: vs(24),
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
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(8),
    marginTop: vs(8),
  },
  presetButton: {
    paddingHorizontal: s(10),
    paddingVertical: s(6),
    borderWidth: 1,
    borderColor: '#333366',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  presetActive: {
    borderColor: '#00FFFF',
    backgroundColor: 'rgba(0,255,255,0.12)',
  },
  presetText: {
    fontFamily: 'Courier New',
    fontSize: ms(10),
    color: '#888899',
    letterSpacing: 1,
  },
  presetTextActive: {
    color: '#00FFFF',
    fontWeight: 'bold',
  },
  title: {
    fontFamily: 'Courier New',
    fontSize: ms(28),
    fontWeight: 'bold',
    color: '#00FFFF',
    letterSpacing: 4,
    textShadowColor: '#00FFFF',
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: 'Courier New',
    fontSize: ms(14),
    color: '#FF00FF',
    letterSpacing: 2,
    marginTop: 8,
  },
  timerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(24),
  },
  timerCircle: {
    borderWidth: 4,
    borderColor: '#FF00FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,0,255,0.05)',
    shadowRadius: s(20),
    elevation: s(6),
  },
  timeText: {
    fontFamily: 'Courier New',
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
    backgroundColor: '#333366',
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
    borderColor: '#00FFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    marginTop: vs(24),
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: s(8),
  },
  statText: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    color: '#666699',
    letterSpacing: 1,
  },
  statNumber: {
    fontFamily: 'Courier New',
    fontSize: ms(22),
    fontWeight: 'bold',
    color: '#FFFF00',
  },
});
