import { useColorScheme } from '@/hooks/use-color-scheme';
import { THEME } from '@/lib/theme';

/**
 * Single-import theme hook — replaces the dual
 * `useColorScheme` + `THEME[colorScheme]` pattern.
 *
 * Usage:
 *   const { theme, colorScheme } = useTheme();
 *   const { theme, colorScheme, setColorScheme, toggleColorScheme } = useTheme();
 */
export function useTheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();
  const theme = THEME[colorScheme];

  return {
    colorScheme,
    theme,
    setColorScheme,
    toggleColorScheme,
  };
}
