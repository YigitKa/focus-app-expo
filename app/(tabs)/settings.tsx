import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { s, vs, ms } from '@/lib/responsive';
import { t, resolveLang } from '@/lib/i18n';
import { usePrefs } from '@/context/PrefsContext';
import { useSessionStats, DifficultyLevel } from '@/context/SessionStatsContext';
import { Volume2, VolumeX, Vibrate, Bell, Clock, Settings2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const { prefs, updatePrefs } = usePrefs();
  const { difficulty, setAchievementDifficulty, resetStats } = useSessionStats();
  const uiLang = resolveLang(prefs.language);
  const difficultyOptions: DifficultyLevel[] = ['easy', 'normal', 'hard'];
  const difficultyDetails = difficultyOptions.map(level => ({
    level,
    label: t(`difficulty.${level}`, uiLang),
    description: t(`settings.difficulty.${level}`, uiLang),
  }));
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrateEnabled: true,
    notificationsEnabled: true,
    autoBreaks: true,
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  });

  // Sync local UI state with persisted prefs (for timer durations)
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      workDuration: prefs.workDuration,
      shortBreakDuration: prefs.shortBreakDuration,
      longBreakDuration: prefs.longBreakDuration,
    }));
  }, [prefs.workDuration, prefs.shortBreakDuration, prefs.longBreakDuration]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDifficultySelect = (level: DifficultyLevel) => {
    if (level !== difficulty) {
      setAchievementDifficulty(level);
    }
  };

  const handleResetStats = () => {
    Alert.alert(
      t('settings.resetStats', uiLang),
      t('settings.resetStatsConfirm', uiLang),
      [
        { text: t('common.cancel', uiLang), style: 'cancel' },
        {
          text: t('settings.resetStatsConfirmButton', uiLang),
          style: 'destructive',
          onPress: () => resetStats({ keepDifficulty: true }),
        },
      ],
    );
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle, 
    type = 'switch' 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    value: boolean | number;
    onToggle: () => void;
    type?: 'switch' | 'button';
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value as boolean}
          onValueChange={onToggle}
          trackColor={{ false: '#333366', true: '#FF00FF' }}
          thumbColor={value ? '#00FFFF' : '#666699'}
          style={styles.switch}
        />
      ) : (
        <TouchableOpacity style={styles.valueButton} onPress={onToggle}>
          <Text style={styles.valueText}>{value}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const TimerSetting = ({ 
    title, 
    value, 
    onIncrease, 
    onDecrease 
  }: {
    title: string;
    value: number;
    onIncrease: () => void;
    onDecrease: () => void;
  }) => (
    <View style={styles.timerSetting}>
      <Text style={styles.timerTitle}>{title}</Text>
      <View style={styles.timerControls}>
        <TouchableOpacity style={styles.timerButton} onPress={onDecrease}>
          <Text style={styles.timerButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.timerValue}>{value} MIN</Text>
        <TouchableOpacity style={styles.timerButton} onPress={onIncrease}>
          <Text style={styles.timerButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#000011', '#001122', '#000033']} style={styles.container}>
      <View style={styles.gridOverlay} />
      
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.title', uiLang)}</Text>
        <Text style={styles.subtitle}>{t('settings.subtitle', uiLang)}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language', uiLang)}</Text>
          <View style={styles.languageRow}>
            <TouchableOpacity
              onPress={() => updatePrefs({ language: 'system' })}
              style={[styles.langPill, prefs.language === 'system' && styles.langPillActive]}
            >
              <Text style={[styles.langText, prefs.language === 'system' && styles.langTextActive]}>
                {t('settings.system', uiLang)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updatePrefs({ language: 'tr' })}
              style={[styles.langPill, prefs.language === 'tr' && styles.langPillActive]}
            >
              <Text style={[styles.langText, prefs.language === 'tr' && styles.langTextActive]}>
                {t('settings.turkish', uiLang)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updatePrefs({ language: 'en' })}
              style={[styles.langPill, prefs.language === 'en' && styles.langPillActive]}
            >
              <Text style={[styles.langText, prefs.language === 'en' && styles.langTextActive]}>
                {t('settings.english', uiLang)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.audio', uiLang)}</Text>
          
          <SettingRow
            icon={settings.soundEnabled ? 
              <Volume2 size={24} color="#00FFFF" strokeWidth={2} /> :
              <VolumeX size={24} color="#666699" strokeWidth={2} />
            }
            title={t('settings.sound', uiLang)}
            subtitle="Play audio notifications"
            value={settings.soundEnabled}
            onToggle={() => updateSetting('soundEnabled', !settings.soundEnabled)}
          />

          <SettingRow
            icon={<Vibrate size={24} color="#FF00FF" strokeWidth={2} />}
            title={t('settings.haptics', uiLang)}
            subtitle="Vibrate on timer events"
            value={settings.vibrateEnabled}
            onToggle={() => updateSetting('vibrateEnabled', !settings.vibrateEnabled)}
          />

          <SettingRow
            icon={<Bell size={24} color="#FFFF00" strokeWidth={2} />}
            title={t('settings.notifications', uiLang)}
            subtitle="Push notifications for breaks"
            value={settings.notificationsEnabled}
            onToggle={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.timers', uiLang)}</Text>
          
          <SettingRow
            icon={<Clock size={24} color="#00FF66" strokeWidth={2} />}
            title={t('settings.autoBreaks', uiLang)}
            subtitle="Automatically start break timers"
            value={settings.autoBreaks}
            onToggle={() => updateSetting('autoBreaks', !settings.autoBreaks)}
          />

          <TimerSetting
            title={t('settings.work', uiLang)}
            value={settings.workDuration}
            onIncrease={() => {
              const val = Math.min(60, settings.workDuration + 5);
              updateSetting('workDuration', val);
              updatePrefs({ workDuration: val });
            }}
            onDecrease={() => {
              const val = Math.max(5, settings.workDuration - 5);
              updateSetting('workDuration', val);
              updatePrefs({ workDuration: val });
            }}
          />

          <TimerSetting
            title={t('settings.shortBreak', uiLang)}
            value={settings.shortBreakDuration}
            onIncrease={() => {
              const val = Math.min(15, settings.shortBreakDuration + 1);
              updateSetting('shortBreakDuration', val);
              updatePrefs({ shortBreakDuration: val });
            }}
            onDecrease={() => {
              const val = Math.max(1, settings.shortBreakDuration - 1);
              updateSetting('shortBreakDuration', val);
              updatePrefs({ shortBreakDuration: val });
            }}
          />

          <TimerSetting
            title={t('settings.longBreak', uiLang)}
            value={settings.longBreakDuration}
            onIncrease={() => {
              const val = Math.min(30, settings.longBreakDuration + 5);
              updateSetting('longBreakDuration', val);
              updatePrefs({ longBreakDuration: val });
            }}
            onDecrease={() => {
              const val = Math.max(5, settings.longBreakDuration - 5);
              updateSetting('longBreakDuration', val);
              updatePrefs({ longBreakDuration: val });
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.achievementDifficulty', uiLang)}</Text>
          <View style={styles.difficultyRow}>
            {difficultyOptions.map(level => (
              <TouchableOpacity
                key={level}
                onPress={() => handleDifficultySelect(level)}
                style={[
                  styles.difficultyPill,
                  difficulty === level && styles.difficultyPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    difficulty === level && styles.difficultyTextActive,
                  ]}
                >
                  {t(`difficulty.${level}`, uiLang)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetStats}>
            <Text style={styles.resetButtonText}>{t('settings.resetStats', uiLang)}</Text>
          </TouchableOpacity>
          <Text style={styles.resetHint}>{t('settings.resetStatsHint', uiLang)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about', uiLang)}</Text>
          
          <View style={styles.aboutCard}>
            <Settings2 size={32} color="#00FFFF" strokeWidth={2} />
            <Text style={styles.aboutTitle}>RETRO FOCUS v1.0</Text>
            <Text style={styles.aboutText}>{t('about.text', uiLang)}</Text>
            <Text style={styles.aboutSubtext}>{t('about.subtext', uiLang)}</Text>
          </View>
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
    color: '#00FF66',
    letterSpacing: 3,
    textShadowColor: '#00FF66',
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
  section: {
    marginBottom: vs(20),
  },
  sectionTitle: {
    fontFamily: 'Courier New',
    fontSize: ms(14),
    fontWeight: 'bold',
    color: '#FF00FF',
    letterSpacing: 2,
    marginBottom: vs(12),
  },
  languageRow: {
    flexDirection: 'row',
    gap: s(8),
  },
  langPill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#333366',
    borderRadius: 16,
    paddingHorizontal: s(10),
    paddingVertical: s(6),
  },
  langPillActive: {
    borderColor: '#00FFFF',
    backgroundColor: 'rgba(0,255,255,0.12)',
  },
  langText: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    color: '#888899',
  },
  langTextActive: {
    color: '#00FFFF',
    fontWeight: 'bold',
  },
  difficultyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(10),
    marginTop: vs(12),
  },
  difficultyPill: {
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333366',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  difficultyPillActive: {
    borderColor: '#00FFFF',
    backgroundColor: 'rgba(0,255,255,0.15)',
  },
  difficultyText: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    color: '#C3C7FF',
    letterSpacing: 1,
  },
  difficultyTextActive: {
    color: '#00FFFF',
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: vs(16),
    paddingVertical: vs(10),
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF00FF',
    backgroundColor: 'rgba(255,0,255,0.12)',
  },
  resetButtonText: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    fontWeight: 'bold',
    color: '#FF00FF',
    letterSpacing: 1,
  },
  resetHint: {
    fontFamily: 'Courier New',
    fontSize: ms(10),
    color: '#666699',
    marginTop: vs(8),
    textAlign: 'center',
    lineHeight: vs(14),
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#333366',
    borderRadius: 8,
    padding: s(12),
    marginBottom: vs(10),
  },
  settingIcon: {
    marginRight: s(12),
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  settingSubtitle: {
    fontFamily: 'Courier New',
    fontSize: ms(11),
    color: '#888899',
    marginTop: 4,
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  valueButton: {
    backgroundColor: 'rgba(0,255,255,0.2)',
    borderWidth: 1,
    borderColor: '#00FFFF',
    borderRadius: 6,
    paddingHorizontal: s(10),
    paddingVertical: s(6),
  },
  valueText: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    color: '#00FFFF',
    fontWeight: 'bold',
  },
  timerSetting: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#333366',
    borderRadius: 8,
    padding: s(12),
    marginBottom: vs(10),
  },
  timerTitle: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: vs(8),
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerButton: {
    width: s(36),
    height: s(36),
    backgroundColor: 'rgba(255,0,255,0.2)',
    borderWidth: 2,
    borderColor: '#FF00FF',
    borderRadius: s(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerButtonText: {
    fontFamily: 'Courier New',
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#FF00FF',
  },
  timerValue: {
    fontFamily: 'Courier New',
    fontSize: ms(16),
    fontWeight: 'bold',
    color: '#FFFF00',
    letterSpacing: 1,
  },
  aboutCard: {
    backgroundColor: 'rgba(0,255,255,0.1)',
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 12,
    padding: s(16),
    alignItems: 'center',
  },
  aboutTitle: {
    fontFamily: 'Courier New',
    fontSize: ms(16),
    fontWeight: 'bold',
    color: '#00FFFF',
    letterSpacing: 2,
    marginTop: vs(10),
    marginBottom: vs(8),
  },
  aboutText: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: vs(18),
    marginBottom: vs(10),
  },
  aboutSubtext: {
    fontFamily: 'Courier New',
    fontSize: ms(11),
    color: '#666699',
    letterSpacing: 1,
  },
});
