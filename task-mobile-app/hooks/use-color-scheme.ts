import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativewindColorScheme();
  const deviceColorScheme = useDeviceColorScheme();

  const activeColorScheme = (colorScheme === 'light' || colorScheme === 'dark')
    ? colorScheme
    : (deviceColorScheme === 'dark' ? 'dark' : 'light');

  return {
    colorScheme: activeColorScheme,
    setColorScheme,
    toggleColorScheme,
  };
}
