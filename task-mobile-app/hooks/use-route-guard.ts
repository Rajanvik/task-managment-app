import { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_KEYS } from '@/lib/axios-instance';

/**
 * Route guarding middleware for Expo Router.
 * Handles automatic redirection based on onboarding and authentication state.
 *
 * FIX: Strong navigation lock added to prevent double-navigation crash in production APK builds.
 * Problem was: login screen was ALSO calling router.replace('/home') in onSuccess at the same
 * time as useRouteGuard — causing a fatal "navigator not ready" / concurrent navigation crash.
 *
 * Solution: Remove router.replace from login/register screens entirely.
 * Only useRouteGuard navigates. isNavigating ref ensures only ONE navigation happens at a time.
 */
export function useRouteGuard(isLoaded: boolean) {
  const router = useRouter();
  const segments = useSegments();
  // Strong lock: prevent ANY concurrent navigation calls
  const isNavigating = useRef(false);
  // Track last navigated destination to prevent duplicate navigate-to-same-route
  const lastDestination = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    // If a navigation is already in progress, skip
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

        // Skip if same destination as last navigation (avoids re-triggers on re-renders)
        if (destination && destination === lastDestination.current) {
          return;
        }

        if (shouldNavigate && destination) {
          isNavigating.current = true;
          lastDestination.current = destination;

          // Delay ensures Expo Router navigator is fully mounted in production APK before navigation
          setTimeout(() => {
            router.replace(destination as any);
            // Reset lock after a safe delay — long enough to allow navigator state to settle
            setTimeout(() => {
              isNavigating.current = false;
            }, 1000);
          }, 150);
        }
      } catch (error) {
        isNavigating.current = false;
        console.error('Route protection middleware check error:', error);
      }
    };

    checkRouteProtection();
  }, [isLoaded, segments]);
}

