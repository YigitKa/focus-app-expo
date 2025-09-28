import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PrefsProvider } from '@/context/PrefsContext';
import { SessionStatsProvider } from '@/context/SessionStatsContext';
import { ThemeProvider } from '@/context/ThemeContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SessionStatsProvider>
      <PrefsProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PrefsProvider>
    </SessionStatsProvider>
  );
}
