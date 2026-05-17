import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, LogBox } from 'react-native';
import { PortalHost } from '@rn-primitives/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../global.css';


import { useColorScheme } from '@/hooks/use-color-scheme';
import { NAV_THEME } from '@/lib/theme';
import { TaskProvider, useTasks } from '@/context/TaskContext';
import { Toaster } from '@/components/ui/toaster';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Ignore generic third-party Expo SDK push notification library notice on Expo Go
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
]);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { colorScheme } = useColorScheme();
  const { isLoaded } = useTasks();

  useEffect(() => {
    let isMounted = true;
    
    if (isLoaded) {
      const hideSplash = async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn("Error hiding splash screen:", e);
        }
      };

      // Hide splash screen once TaskProvider storage retrieval is completely loaded
      hideSplash();

      // Safety fallback: ensure splash hides even if mounting gets delayed or interrupted
      const fallbackTimer = setTimeout(() => {
        if (isMounted) {
          hideSplash();
        }
      }, 500);

      return () => {
        isMounted = false;
        clearTimeout(fallbackTimer);
      };
    }
  }, [isLoaded]);

  // Return null (which keeps the Native Splash Screen active) until all data is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light}>
      <View className={colorScheme === 'dark' ? 'dark flex-1 bg-background' : 'flex-1 bg-background'}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <PortalHost />
        <Toaster richColors closeButton />
      </View>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TaskProvider>
          <RootLayoutContent />
        </TaskProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
