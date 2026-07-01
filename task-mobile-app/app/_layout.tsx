import 'react-native-gesture-handler';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, LogBox } from 'react-native';
import { PortalHost } from '@rn-primitives/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../global.css';

// ─── Global Theme Provider (ek jagah setup) ───────────────────────────────────
// ThemeProvider yahan sirf ek baar wrap kiya gaya hai.
// Ab puri app me koi bhi component useTheme() call kar sakta hai
// bina kisi extra import ki zarurat ke — Context se automatically milega.
// ──────────────────────────────────────────────────────────────────────────────
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

import { NAV_THEME } from '@/lib/theme';
import { Toaster } from '@/components/ui/toaster';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { QueryClientProvider } from '@/providers/query-client-provider';
import { useRouteGuard } from '@/hooks/use-route-guard';
export { ErrorBoundary } from './error-boundary';
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
  // useTheme ab ThemeContext se aata hai — ek baar root me compute hoga
  const { colorScheme } = useTheme();

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
    <NavThemeProvider value={colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light}>
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
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider>
          {/* 
            ThemeProvider — Global theme setup (sirf yahan ek baar).
            Poori app ke andar koi bhi component useTheme() use kar sakta hai.
          */}
          <ThemeProvider>
            <RootLayoutContent />
          </ThemeProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
