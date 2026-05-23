import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_KEYS } from '@/lib/axios-instance';

/**
 * Route guarding middleware for Expo Router.
 * Handles automatic redirection based on onboarding and authentication state.
 */
export function useRouteGuard(isLoaded: boolean) {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded) return;

    const checkRouteProtection = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
        const token = await AsyncStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);

        const segs = segments as any;
        const inAuthGroup = segs[0] === '(auth)';
        const inTabsGroup = segs[0] === '(tabs)';
        const isRoot = segs.length === 0 || (segs.length === 1 && segs[0] === 'index');

        if (!onboardingCompleted) {
          // 1. If onboarding is not done, redirect to index onboarding page
          if (!isRoot) {
            router.replace('/' as any);
          }
        } else if (!token) {
          // 2. If onboarding is done but no auth token exists, redirect to login screen
          if (!inAuthGroup) {
            router.replace('/login' as any);
          }
        } else {
          // 3. If authenticated, redirect away from login or onboarding pages to home page
          if (isRoot || inAuthGroup) {
            router.replace('/home' as any);
          }
        }
      } catch (error) {
        console.error('Route protection middleware check error:', error);
      }
    };

    checkRouteProtection();
  }, [isLoaded, segments]);
}
