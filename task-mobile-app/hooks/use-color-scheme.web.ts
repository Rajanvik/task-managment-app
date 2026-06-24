import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 * and must conform to the same object interface { colorScheme, setColorScheme, toggleColorScheme }
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const { colorScheme, setColorScheme, toggleColorScheme } = useNativewindColorScheme();
  const deviceColorScheme = useRNColorScheme();

  const activeColorScheme = (colorScheme === 'light' || colorScheme === 'dark')
    ? colorScheme
    : (deviceColorScheme === 'dark' ? 'dark' : 'light');

  return {
    colorScheme: hasHydrated ? activeColorScheme : 'light',
    setColorScheme,
    toggleColorScheme,
  };
}
