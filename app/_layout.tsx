import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PrefsProvider } from '@/context/PrefsContext';
import { SessionStatsProvider } from '@/context/SessionStatsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TasksProvider } from '@/context/TasksContext';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  useFrameworkReady();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SessionStatsProvider>
      <PrefsProvider>
        <ThemeProvider>
          <TasksProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </TasksProvider>
        </ThemeProvider>
      </PrefsProvider>
    </SessionStatsProvider>
  );
}
