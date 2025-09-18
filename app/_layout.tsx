import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PrefsProvider } from '@/context/PrefsContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <PrefsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </PrefsProvider>
  );
}
