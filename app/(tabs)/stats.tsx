import React, { useMemo } from 'react';
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
import { useSessionStats, AchievementId } from '@/context/SessionStatsContext';

export default function StatsScreen() {
  const { width: winW } = useWindowDimensions();
  const { prefs } = usePrefs();
  const uiLang = resolveLang(prefs.language);
  const { stats: sessionStats, achievementStates, difficulty } = useSessionStats();

  const totals = sessionStats.totals;
  const totalSessions = sessionStats.totalSessions;
  const focusMinutes = Math.round(sessionStats.focusSeconds / 60);
  const breakMinutes = Math.round(sessionStats.breakSeconds / 60);
  const focusScore = sessionStats.totalScore;
  const currentStreakDays = sessionStats.currentStreakDays;
  const bestStreakDays = sessionStats.bestStreakDays;
  const currentScoreStreak = sessionStats.currentScoreStreak;
  const bestScoreStreak = sessionStats.bestScoreStreak;

  const productivity = focusMinutes + breakMinutes > 0
    ? Math.round((focusMinutes / (focusMinutes + breakMinutes)) * 100)
    : 0;
  const breakShare = focusMinutes + breakMinutes > 0
    ? Math.round((breakMinutes / (focusMinutes + breakMinutes)) * 100)
    : 0;
  const workShare = totalSessions > 0 ? Math.round((totals.work / totalSessions) * 100) : 0;
  const shortShare = totalSessions > 0 ? Math.round((totals.short / totalSessions) * 100) : 0;
  const longShare = totalSessions > 0 ? Math.round((totals.long / totalSessions) * 100) : 0;

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
    <View style={[styles.statCard, { borderColor: color, width: (winW - s(50)) / 2 }] }>
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

  return (
    <LinearGradient colors={['#000011', '#001122', '#000033']} style={styles.container}>
      <View style={styles.gridOverlay} />

      <View style={styles.header}>
        <Text style={styles.title}>{t('stats.title', uiLang)}</Text>
        <Text style={styles.subtitle}>{t('stats.subtitle', uiLang)}</Text>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyLabel}>{t('stats.difficulty', uiLang)}</Text>
          <Text style={styles.difficultyValue}>{t(`difficulty.${difficulty}`, uiLang)}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Clock size={32} color="#FF00FF" strokeWidth={2} />}
            title={t('stats.focusTime', uiLang)}
            value={formatTime(focusMinutes)}
            subtitle={t('stats.focusSubtitle', uiLang)}
            color="#FF00FF"
          />
          <StatCard
            icon={<Zap size={32} color="#FFFF00" strokeWidth={2} />}
            title={t('stats.focusScore', uiLang)}
            value={focusScore.toString()}
            subtitle={t('stats.scoreSubtitle', uiLang)}
            color="#FFFF00"
          />
          <StatCard
            icon={<Target size={32} color="#00FFFF" strokeWidth={2} />}
            title={t('stats.sessions', uiLang)}
            value={totalSessions.toString()}
            subtitle={t('stats.sessionsSubtitle', uiLang)}
            color="#00FFFF"
          />
          <StatCard
            icon={<Trophy size={32} color="#00FF66" strokeWidth={2} />}
            title={t('stats.streak', uiLang)}
            value={`${currentStreakDays}/${bestStreakDays}`}
            subtitle={t('stats.streakSubtitle', uiLang)}
            color="#00FF66"
          />
          <StatCard
            icon={<Zap size={32} color="#FFA500" strokeWidth={2} />}
            title={t('stats.combo', uiLang)}
            value={`${currentScoreStreak}/${bestScoreStreak}`}
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
            detail={`${totals.work}/${totalSessions}`}
            color="#FF00FF"
          />
          <ProgressBar
            label={t('stats.shortBreaks', uiLang)}
            percentage={shortShare}
            detail={`${totals.short}/${totalSessions}`}
            color="#00FFFF"
          />
          <ProgressBar
            label={t('stats.longBreaks', uiLang)}
            percentage={longShare}
            detail={`${totals.long}/${totalSessions}`}
            color="#00FF66"
          />
          <ProgressBar
            label={t('stats.breakTime', uiLang)}
            percentage={breakShare}
            detail={`${formatTime(breakMinutes)} / ${formatTime(focusMinutes + breakMinutes)}`}
            color="#FFFF00"
          />
        </View>

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
    gap: vs(12),
  },
  title: {
    fontFamily: 'Courier New',
    fontSize: ms(22),
    fontWeight: 'bold',
    color: '#FFFF00',
    letterSpacing: 3,
    textShadowColor: '#FF00FF',
    textShadowRadius: 10,
  },
  subtitle: {
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
    fontSize: ms(11),
    color: '#888899',
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
});
