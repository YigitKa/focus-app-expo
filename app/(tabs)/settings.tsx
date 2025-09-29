import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { s, vs, ms } from '@/lib/responsive';
import { t, resolveLang } from '@/lib/i18n';
import { usePrefs } from '@/context/PrefsContext';
import { useSessionStats } from '@/context/SessionStatsContext';
import { useTasks } from '@/context/TasksContext';
import { Volume2, VolumeX, Vibrate, Bell, Clock, Settings2 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Palette } from '@/lib/theme';

const getStyles = (palette: Palette) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: vs(48),
  },
  header: {
    alignItems: 'center',
    paddingVertical: vs(16),
  },
  title: {
    fontFamily: 'Courier New',
    fontSize: ms(22),
    fontWeight: 'bold',
    color: palette.success,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    color: palette.text,
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
    color: palette.secondary,
    letterSpacing: 1,
    marginBottom: vs(12),
  },
  languageRow: {
    flexDirection: 'row',
    gap: s(8),
  },
  langPill: {
    backgroundColor: palette.background2,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    paddingHorizontal: s(10),
    paddingVertical: s(6),
  },
  langPillActive: {
    borderColor: palette.primary,
    backgroundColor: palette.background3,
  },
  langText: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    color: palette.text,
  },
  langTextActive: {
    color: palette.primary,
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: vs(12),
    paddingVertical: vs(10),
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.warning,
    backgroundColor: palette.background3,
  },
  resetButtonFirst: {
    marginTop: 0,
  },
  resetButtonText: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    fontWeight: 'bold',
    color: palette.warning,
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.background2,
    borderWidth: 1,
    borderColor: palette.border,
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
    color: palette.textEmphasis,
    letterSpacing: 1,
  },
  settingSubtitle: {
    fontFamily: 'Courier New',
    fontSize: ms(11),
    color: palette.text,
    marginTop: 4,
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  timerSetting: {
    backgroundColor: palette.background2,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    padding: s(12),
    marginBottom: vs(10),
  },
  timerTitle: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    fontWeight: 'bold',
    color: palette.textEmphasis,
    letterSpacing: 1,
    marginBottom: vs(8),
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerButton: {
    width: ms(36),
    height: ms(36),
    backgroundColor: palette.background3,
    borderWidth: 2,
    borderColor: palette.secondary,
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerButtonText: {
    fontFamily: 'Courier New',
    fontSize: ms(18),
    fontWeight: 'bold',
    color: palette.secondary,
  },
  timerValue: {
    fontFamily: 'Courier New',
    fontSize: ms(16),
    fontWeight: 'bold',
    color: palette.accent,
    letterSpacing: 1,
  },
  aboutCard: {
    backgroundColor: palette.background3,
    borderWidth: 2,
    borderColor: palette.primary,
    borderRadius: 12,
    padding: s(16),
    alignItems: 'center',
  },
  aboutTitle: {
    fontFamily: 'Courier New',
    fontSize: ms(16),
    fontWeight: 'bold',
    color: palette.primary,
    letterSpacing: 2,
    marginTop: vs(10),
    marginBottom: vs(8),
  },
  aboutText: {
    fontFamily: 'Courier New',
    fontSize: ms(12),
    color: palette.textEmphasis,
    textAlign: 'center',
    lineHeight: vs(18),
    marginBottom: vs(10),
  },
  aboutSubtext: {
    fontFamily: 'Courier New',
    fontSize: ms(11),
    color: palette.text,
    letterSpacing: 1,
  },
});

export default function SettingsScreen() {
  const { prefs, updatePrefs } = usePrefs();
  const { resetStats, resetWorkday, resetAchievements } = useSessionStats();
  const { resetTasks } = useTasks();
  const uiLang = resolveLang(prefs.language);
  const { theme, name: themeName, setThemeName } = useTheme();
  const palette = theme.colors;
  const styles = getStyles(palette);
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrateEnabled: true,
    notificationsEnabled: true,
    autoProgress: true,
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  });

  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      workDuration: prefs.workDuration,
      shortBreakDuration: prefs.shortBreakDuration,
      longBreakDuration: prefs.longBreakDuration,
      autoProgress: prefs.autoProgress ?? true,
    }));
  }, [prefs.workDuration, prefs.shortBreakDuration, prefs.longBreakDuration, prefs.autoProgress]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const confirmReset = (
    titleKey: string,
    messageKey: string,
    confirmKey: string,
    action: () => void
  ) => {
    const title = t(titleKey, uiLang);
    const message = t(messageKey, uiLang);
    const confirmLabel = t(confirmKey, uiLang);

    if (Platform.OS === 'web') {
      const globalConfirm =
        typeof globalThis !== 'undefined' && typeof (globalThis as any).confirm === 'function'
          ? (globalThis as any).confirm
          : undefined;
      const ok = globalConfirm ? globalConfirm(`${title}

${message}`) : true;
      if (ok) action();
      return;
    }

    Alert.alert(title, message, [
      { text: t('common.cancel', uiLang), style: 'cancel' },
      { text: confirmLabel, style: 'destructive', onPress: action },
    ]);
  };

  const handleResetStats = () =>
    confirmReset(
      'settings.resetStats',
      'settings.resetStatsConfirm',
      'settings.resetStatsConfirmButton',
      () => {
        resetStats();
        resetWorkday();
        resetAchievements();
        resetTasks();
      }
    );

  const handleResetWorkday = () =>
    confirmReset(
      'settings.resetWorkday',
      'settings.resetWorkdayConfirm',
      'settings.resetWorkdayConfirmButton',
      resetWorkday
    );

  const handleResetAchievements = () =>
    confirmReset(
      'settings.resetAchievements',
      'settings.resetAchievementsConfirm',
      'settings.resetAchievementsConfirmButton',
      resetAchievements
    );

  const handleResetTasks = () =>
    confirmReset(
      'settings.resetTasks',
      'settings.resetTasksConfirm',
      'settings.resetTasksConfirmButton',
      resetTasks
    );

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: palette.border, true: palette.secondary }}
        thumbColor={value ? palette.primary : palette.background3}
        style={styles.switch}
      />
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
    <LinearGradient colors={theme.gradient} style={styles.container}>
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
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.languageRow}>
            {(['nova', 'retro', 'arctic'] as const).map(opt => (
              <TouchableOpacity
                key={opt}
                onPress={() => setThemeName(opt)}
                style={[styles.langPill, themeName === opt && styles.langPillActive]}
              >
                <Text style={[styles.langText, themeName === opt && styles.langTextActive]}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.audio', uiLang)}</Text>
          
          <SettingRow
            icon={settings.soundEnabled ? 
              <Volume2 size={24} color={palette.primary} strokeWidth={2} /> :
              <VolumeX size={24} color={palette.text} strokeWidth={2} />
            }
            title={t('settings.sound', uiLang)}
            subtitle="Play audio notifications"
            value={settings.soundEnabled}
            onToggle={() => updateSetting('soundEnabled', !settings.soundEnabled)}
          />

          <SettingRow
            icon={<Vibrate size={24} color={palette.secondary} strokeWidth={2} />}
            title={t('settings.haptics', uiLang)}
            subtitle="Vibrate on timer events"
            value={settings.vibrateEnabled}
            onToggle={() => updateSetting('vibrateEnabled', !settings.vibrateEnabled)}
          />

          <SettingRow
            icon={<Bell size={24} color={palette.accent} strokeWidth={2} />}
            title={t('settings.notifications', uiLang)}
            subtitle="Push notifications for breaks"
            value={settings.notificationsEnabled}
            onToggle={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.timers', uiLang)}</Text>
          
          <SettingRow
            icon={<Clock size={24} color={palette.success} strokeWidth={2} />}
            title={t('settings.autoProgress', uiLang)}
            subtitle={t('settings.autoProgressSubtitle', uiLang)}
            value={settings.autoProgress}
            onToggle={() => {
              const next = !settings.autoProgress;
              updateSetting('autoProgress', next);
              updatePrefs({ autoProgress: next });
            }}
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
          <Text style={styles.sectionTitle}>{t('settings.data', uiLang)}</Text>
          <TouchableOpacity
            style={[styles.resetButton, styles.resetButtonFirst]}
            onPress={handleResetStats}
          >
            <Text style={styles.resetButtonText}>{t('settings.resetStats', uiLang)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetWorkday}>
            <Text style={styles.resetButtonText}>{t('settings.resetWorkday', uiLang)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetAchievements}>
            <Text style={styles.resetButtonText}>{t('settings.resetAchievements', uiLang)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetTasks}>
            <Text style={styles.resetButtonText}>{t('settings.resetTasks', uiLang)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about', uiLang)}</Text>
          
          <View style={styles.aboutCard}>
            <Settings2 size={32} color={palette.primary} strokeWidth={2} />
            <Text style={styles.aboutTitle}>RETRO FOCUS v1.0</Text>
            <Text style={styles.aboutText}>{t('about.text', uiLang)}</Text>
            <Text style={styles.aboutSubtext}>{t('about.subtext', uiLang)}</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
