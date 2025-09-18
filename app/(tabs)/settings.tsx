import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, VolumeX, Vibrate, Bell, Clock, Settings2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrateEnabled: true,
    notificationsEnabled: true,
    autoBreaks: true,
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
        <Text style={styles.title}>SYSTEM CONFIG</Text>
        <Text style={styles.subtitle}>CUSTOMIZE PARAMETERS</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUDIO & FEEDBACK</Text>
          
          <SettingRow
            icon={settings.soundEnabled ? 
              <Volume2 size={24} color="#00FFFF" strokeWidth={2} /> :
              <VolumeX size={24} color="#666699" strokeWidth={2} />
            }
            title="SOUND EFFECTS"
            subtitle="Play audio notifications"
            value={settings.soundEnabled}
            onToggle={() => updateSetting('soundEnabled', !settings.soundEnabled)}
          />

          <SettingRow
            icon={<Vibrate size={24} color="#FF00FF" strokeWidth={2} />}
            title="HAPTIC FEEDBACK"
            subtitle="Vibrate on timer events"
            value={settings.vibrateEnabled}
            onToggle={() => updateSetting('vibrateEnabled', !settings.vibrateEnabled)}
          />

          <SettingRow
            icon={<Bell size={24} color="#FFFF00" strokeWidth={2} />}
            title="NOTIFICATIONS"
            subtitle="Push notifications for breaks"
            value={settings.notificationsEnabled}
            onToggle={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TIMER SETTINGS</Text>
          
          <SettingRow
            icon={<Clock size={24} color="#00FF66" strokeWidth={2} />}
            title="AUTO BREAKS"
            subtitle="Automatically start break timers"
            value={settings.autoBreaks}
            onToggle={() => updateSetting('autoBreaks', !settings.autoBreaks)}
          />

          <TimerSetting
            title="WORK SESSION"
            value={settings.workDuration}
            onIncrease={() => updateSetting('workDuration', Math.min(60, settings.workDuration + 5))}
            onDecrease={() => updateSetting('workDuration', Math.max(5, settings.workDuration - 5))}
          />

          <TimerSetting
            title="SHORT BREAK"
            value={settings.shortBreakDuration}
            onIncrease={() => updateSetting('shortBreakDuration', Math.min(15, settings.shortBreakDuration + 1))}
            onDecrease={() => updateSetting('shortBreakDuration', Math.max(1, settings.shortBreakDuration - 1))}
          />

          <TimerSetting
            title="LONG BREAK"
            value={settings.longBreakDuration}
            onIncrease={() => updateSetting('longBreakDuration', Math.min(30, settings.longBreakDuration + 5))}
            onDecrease={() => updateSetting('longBreakDuration', Math.max(5, settings.longBreakDuration - 5))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          
          <View style={styles.aboutCard}>
            <Settings2 size={32} color="#00FFFF" strokeWidth={2} />
            <Text style={styles.aboutTitle}>RETRO FOCUS v1.0</Text>
            <Text style={styles.aboutText}>
              A productivity app inspired by{'\n'}
              classic computing aesthetics
            </Text>
            <Text style={styles.aboutSubtext}>
              Built with React Native & Expo
            </Text>
          </View>
        </View>
      </ScrollView>
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
    backgroundImage: 'linear-gradient(rgba(0,255,102,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,0.05) 1px, transparent 1px)',
    backgroundSize: '30px 30px',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontFamily: 'Courier New',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00FF66',
    letterSpacing: 3,
    textShadowColor: '#00FF66',
    textShadowRadius: 8,
  },
  subtitle: {
    fontFamily: 'Courier New',
    fontSize: 14,
    color: '#666699',
    letterSpacing: 1,
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'Courier New',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF00FF',
    letterSpacing: 2,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#333366',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Courier New',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  settingSubtitle: {
    fontFamily: 'Courier New',
    fontSize: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  valueText: {
    fontFamily: 'Courier New',
    fontSize: 14,
    color: '#00FFFF',
    fontWeight: 'bold',
  },
  timerSetting: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#333366',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  timerTitle: {
    fontFamily: 'Courier New',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 12,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,0,255,0.2)',
    borderWidth: 2,
    borderColor: '#FF00FF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerButtonText: {
    fontFamily: 'Courier New',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF00FF',
  },
  timerValue: {
    fontFamily: 'Courier New',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFF00',
    letterSpacing: 1,
  },
  aboutCard: {
    backgroundColor: 'rgba(0,255,255,0.1)',
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  aboutTitle: {
    fontFamily: 'Courier New',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FFFF',
    letterSpacing: 2,
    marginTop: 12,
    marginBottom: 8,
  },
  aboutText: {
    fontFamily: 'Courier New',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  aboutSubtext: {
    fontFamily: 'Courier New',
    fontSize: 12,
    color: '#666699',
    letterSpacing: 1,
  },
});