import 'react-native-gesture-handler';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, LogBox } from 'react-native';
import { PortalHost } from '@rn-primitives/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../global.css';


import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
(global as any).useTheme = useTheme;
import { NAV_THEME } from '@/lib/theme';
import { Toaster } from '@/components/ui/toaster';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { QueryClientProvider } from '@/providers/query-client-provider';

// Ignore generic third-party Expo SDK push notification library notice on Expo Go
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
]);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
};

import { useRouteGuard } from '@/hooks/use-route-guard';

function RootLayoutContent() {
  const { colorScheme } = useColorScheme();

  // Activate route guarding middleware immediately
  useRouteGuard(true);

  useEffect(() => {
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn("Error hiding splash screen:", e);
      }
    };

    hideSplash();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light}>
      <View className={colorScheme === 'dark' ? 'dark flex-1 bg-background' : 'flex-1 bg-background'}>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false, 
              animation: 'fade' 
            }} 
          />
          <Stack.Screen 
            name="(auth)" 
            options={{ 
              headerShown: false, 
              animation: 'fade' 
            }} 
          />
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false, 
              animation: 'fade' 
            }} 
          />
          <Stack.Screen 
            name="celebration" 
            options={{ 
              headerShown: false, 
              animation: 'slide_from_bottom',
            }} 
          />
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
        <QueryClientProvider>
          <RootLayoutContent />
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
