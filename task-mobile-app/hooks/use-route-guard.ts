import { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_KEYS } from '@/lib/axios-instance';

/**
 * Route guarding middleware for Expo Router.
 * Handles automatic redirection based on onboarding and authentication state.
 *
 * FIX: Added navigation readiness guard to prevent crash in production APK builds.
 * In release builds, the JS bundle loads asynchronously so the navigator may not
 * be mounted when this hook first fires — causing a "navigator not ready" crash.
 */
export function useRouteGuard(isLoaded: boolean) {
  const router = useRouter();
  const segments = useSegments();
  // Track whether we've attempted navigation to avoid duplicate triggers
  const isNavigating = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    // Prevent concurrent navigation calls (double-navigation crash)
    if (isNavigating.current) return;

    const checkRouteProtection = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
        const token = await AsyncStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);

        const segs = segments as any;
        const inAuthGroup = segs[0] === '(auth)';
        const isRoot = segs.length === 0 || (segs.length === 1 && segs[0] === 'index');

        let shouldNavigate = false;
        let destination: string | null = null;

        if (!onboardingCompleted) {
          // 1. Onboarding nahi hua — index page par bhejo
          if (!isRoot) {
            destination = '/';
            shouldNavigate = true;
          }
        } else if (!token) {
          // 2. Token nahi hai — login par bhejo
          if (!inAuthGroup) {
            destination = '/login';
            shouldNavigate = true;
          }
        } else {
          // 3. Authenticated — home par bhejo (login/onboarding se door)
          if (isRoot || inAuthGroup) {
            destination = '/home';
            shouldNavigate = true;
          }
        }

        if (shouldNavigate && destination) {
          isNavigating.current = true;
          // Small delay ensures the Expo Router navigator is fully mounted
          // before navigation — critical for production/release APK builds
          setTimeout(() => {
            router.replace(destination as any);
            // Reset after a short delay to allow future segment changes
            setTimeout(() => {
              isNavigating.current = false;
            }, 500);
          }, 100);
        }
      } catch (error) {
        isNavigating.current = false;
        console.error('Route protection middleware check error:', error);
      }
    };

    checkRouteProtection();
  }, [isLoaded, segments]);
}
