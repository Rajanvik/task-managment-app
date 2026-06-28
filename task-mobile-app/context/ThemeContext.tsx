import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';

// ─────────────────────────────────────────────────────────────────────────────
// ThemeContext — Global Theme Provider
//
// SETUP (sirf ek baar _layout.tsx me):
//   <ThemeProvider>
//     <App />
//   </ThemeProvider>
//
// USAGE (kisi bhi component me):
//   import { useTheme } from '@/context/ThemeContext';
//   const { theme, colorScheme } = useTheme();
// ─────────────────────────────────────────────────────────────────────────────

export type ThemeColors = typeof THEME.light;

export type ThemeContextValue = {
  /** Current resolved theme colors object */
  theme: ThemeColors;
  /** Active color scheme: 'light' | 'dark' */
  colorScheme: 'light' | 'dark';
  /** Programmatically set the color scheme */
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
  /** Toggle between light and dark mode */
  toggleColorScheme: () => void;
};

// Sensible light-mode defaults so context is never undefined
const ThemeContext = createContext<ThemeContextValue>({
  theme: THEME.light,
  colorScheme: 'light',
  setColorScheme: () => {},
  toggleColorScheme: () => {},
});

/**
 * ThemeProvider — Wrap your app root with this once.
 * All child components can call useTheme() without any additional setup.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();
  const theme = THEME[colorScheme || 'light'];

  return (
    <ThemeContext.Provider
      value={{ theme, colorScheme: colorScheme || 'light', setColorScheme, toggleColorScheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme — Global theme hook.
 * Works in any component that is a child of <ThemeProvider>.
 * No per-file setup needed — just import and call.
 *
 * @example
 * import { useTheme } from '@/context/ThemeContext';
 * const { theme, colorScheme } = useTheme();
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
