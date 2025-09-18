import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Target, Clock, Zap } from 'lucide-react-native';
import { s, vs, ms } from '@/lib/responsive';
import { t, resolveLang } from '@/lib/i18n';
import { usePrefs } from '@/context/PrefsContext';

export default function StatsScreen() {
  const { width: winW } = useWindowDimensions();
  const { prefs } = usePrefs();
  const uiLang = resolveLang(prefs.language);
  const [stats, setStats] = useState({
    totalSessions: 147,
    totalFocusTime: 3675, // in minutes
    streakDays: 12,
    completedTasks: 89,
    productivity: 87,
  });

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const StatCard = ({ 
    icon, 
    title, 
    value, 
    subtitle, 
    color = '#00FFFF' 
  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    color?: string;
  }) => (
    <View style={[
      styles.statCard, 
      { borderColor: color, width: (winW - s(50)) / 2 }
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
    color = '#FF00FF' 
  }: {
    label: string;
    percentage: number;
    color?: string;
  }) => (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={[styles.progressPercentage, { color }]}>{percentage}%</Text>
      </View>
      <View style={styles.progressBarTrack}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );

  const achievements = [
    { name: 'FOCUS MASTER', description: 'Complete 100 focus sessions!', unlocked: true },
    { name: 'STREAK LEGEND', description: 'Maintain 30-day streak', unlocked: false },
    { name: 'TASK CRUSHER', description: 'Complete 200 tasks', unlocked: false },
    { name: 'PRODUCTIVITY KING', description: 'Achieve 95% productivity', unlocked: false },
  ];

  return (
    <LinearGradient colors={['#000011', '#001122', '#000033']} style={styles.container}>
      <View style={styles.gridOverlay} />
      
      <View style={styles.header}>
        <Text style={styles.title}>{t('stats.title', uiLang)}</Text>
        <Text style={styles.subtitle}>{t('stats.subtitle', uiLang)}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Clock size={32} color="#FF00FF" strokeWidth={2} />}
            title={t('stats.focusTime', uiLang)}
            value={formatTime(stats.totalFocusTime)}
            subtitle="Total Hours"
            color="#FF00FF"
          />
          <StatCard
            icon={<Target size={32} color="#00FFFF" strokeWidth={2} />}
            title={t('stats.sessions', uiLang)}
            value={stats.totalSessions.toString()}
            subtitle="Completed"
            color="#00FFFF"
          />
          <StatCard
            icon={<Zap size={32} color="#FFFF00" strokeWidth={2} />}
            title={t('stats.streak', uiLang)}
            value={`${stats.streakDays}`}
            subtitle="Days"
            color="#FFFF00"
          />
          <StatCard
            icon={<Trophy size={32} color="#00FF66" strokeWidth={2} />}
            title={t('stats.tasks', uiLang)}
            value={stats.completedTasks.toString()}
            subtitle="Completed"
            color="#00FF66"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('stats.weekly', uiLang)}</Text>
          <ProgressBar label="FOCUS GOALS" percentage={stats.productivity} color="#FF00FF" />
          <ProgressBar label="TASK COMPLETION" percentage={76} color="#00FFFF" />
          <ProgressBar label="CONSISTENCY" percentage={92} color="#FFFF00" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('stats.achievements', uiLang)}</Text>
          {achievements.map((achievement, index) => (
            <View 
              key={index} 
              style={[
                styles.achievementItem,
                { 
                  borderColor: achievement.unlocked ? '#00FF66' : '#333366',
                  backgroundColor: achievement.unlocked ? 'rgba(0,255,102,0.1)' : 'rgba(51,51,102,0.1)'
                }
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
                    { color: achievement.unlocked ? '#00FF66' : '#666699' }
                  ]}
                >
                  {achievement.name}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
              </View>
              {achievement.unlocked && (
                <Text style={styles.unlockedText}>UNLOCKED</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: vs(48),
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
  title: {
    fontFamily: 'Courier New',
    fontSize: ms(22),
    fontWeight: 'bold',
    color: '#FFFF00',
    letterSpacing: 2,
    textShadowColor: '#FFFF00',
    textShadowRadius: 8,
  },
  subtitle: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    color: '#666699',
    letterSpacing: 1,
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: s(16),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(12),
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: vs(10),
  },
  achievementText: {
    flex: 1,
    marginLeft: s(12),
  },
  achievementName: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  achievementDescription: {
    fontFamily: 'Courier New',
    fontSize: ms(11),
    color: '#888899',
    marginTop: 4,
  },
  unlockedText: {
    fontFamily: 'Courier New',
    fontSize: ms(10),
    color: '#00FF66',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
