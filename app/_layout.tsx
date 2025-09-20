import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PrefsProvider } from '@/context/PrefsContext';
import { SessionStatsProvider } from '@/context/SessionStatsContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SessionStatsProvider>
      <PrefsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </PrefsProvider>
    </SessionStatsProvider>
  );
}
