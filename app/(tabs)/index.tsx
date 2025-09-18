import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function TimerScreen() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (!isBreak) {
        setSessions(prev => prev + 1);
        setIsBreak(true);
        setTimeLeft(5 * 60); // 5 minute break
      } else {
        setIsBreak(false);
        setTimeLeft(25 * 60); // Back to work
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isBreak]);

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
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const progress = isBreak 
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <LinearGradient colors={['#000011', '#001122', '#000033']} style={styles.container}>
      <View style={styles.gridOverlay} />
      
      <View style={styles.header}>
        <Text style={styles.title}>RETRO FOCUS</Text>
        <Text style={styles.subtitle}>
          {isBreak ? 'BREAK TIME' : 'FOCUS MODE'}
        </Text>
      </View>

      <View style={styles.timerSection}>
        <Animated.View 
          style={[
            styles.timerCircle,
            {
              transform: [{ scale: pulseAnim }],
              shadowColor: isBreak ? '#FFFF00' : '#FF00FF',
              shadowOpacity: glowAnim,
            }
          ]}
        >
          <Text style={[styles.timeText, { color: isBreak ? '#FFFF00' : '#FF00FF' }]}>
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
                  backgroundColor: isBreak ? '#FFFF00' : '#FF00FF',
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.controlButtons}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleTimer}>
            {isActive ? (
              <Pause size={32} color="#00FFFF" strokeWidth={2} />
            ) : (
              <Play size={32} color="#00FFFF" strokeWidth={2} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
            <RotateCcw size={32} color="#00FFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Coffee size={24} color="#FFFF00" strokeWidth={2} />
            <Text style={styles.statText}>SESSIONS</Text>
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
    paddingTop: 60,
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
    paddingVertical: 20,
  },
  title: {
    fontFamily: 'Courier New',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00FFFF',
    letterSpacing: 4,
    textShadowColor: '#00FFFF',
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: 'Courier New',
    fontSize: 16,
    color: '#FF00FF',
    letterSpacing: 2,
    marginTop: 8,
  },
  timerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  timerCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    borderWidth: 4,
    borderColor: '#FF00FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,0,255,0.05)',
    shadowRadius: 20,
    elevation: 10,
  },
  timeText: {
    fontFamily: 'Courier New',
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  progressContainer: {
    width: '100%',
    marginTop: 40,
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 8,
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
    marginTop: 40,
    gap: 30,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,255,255,0.1)',
    borderWidth: 2,
    borderColor: '#00FFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    marginTop: 40,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontFamily: 'Courier New',
    fontSize: 12,
    color: '#666699',
    letterSpacing: 1,
  },
  statNumber: {
    fontFamily: 'Courier New',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFF00',
  },
});
