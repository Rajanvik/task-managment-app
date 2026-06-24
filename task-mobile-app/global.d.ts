import { useTheme as _useTheme } from './hooks/use-theme';

declare global {
  var useTheme: typeof _useTheme;
}
