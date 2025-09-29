import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { Timer, SquareCheck as CheckSquare, ChartBar as BarChart3, Settings } from 'lucide-react-native';
import { s, msc, clamp } from '@/lib/responsive';
import { t, resolveLang } from '@/lib/i18n';
import { usePrefs } from '@/context/PrefsContext';
import { useTheme } from '@/context/ThemeContext';

const FONT_SEMIBOLD = 'Poppins-SemiBold';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const tabHeight = clamp(s(56), 52, 64);
  const tabPaddingV = clamp(s(8), 6, 10);
  const labelSize = msc(isTablet ? 12 : 11, 10, 12);
  const { prefs } = usePrefs();
  const uiLang = resolveLang(prefs.language);
  const { theme } = useTheme();
  const palette = theme.colors;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopColor: palette.secondary,
          borderTopWidth: 2,
          height: tabHeight,
          paddingBottom: tabPaddingV,
          paddingTop: tabPaddingV,
        },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: '#666699',
        tabBarLabelStyle: {
          fontFamily: FONT_SEMIBOLD,
          fontSize: Math.max(13, labelSize),
          letterSpacing: 1,
        },
        tabBarItemStyle: { paddingVertical: 4 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.timer', uiLang).toUpperCase(),
          tabBarIcon: ({ size, color }) => (
            <Timer size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t('tabs.tasks', uiLang).toUpperCase(),
          tabBarIcon: ({ size, color }) => (
            <CheckSquare size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings', uiLang).toUpperCase(),
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

