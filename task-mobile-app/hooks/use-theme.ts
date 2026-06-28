/**
 * useTheme hook — re-exported from ThemeContext for backward compatibility.
 *
 * Iska matlab: purani files jo `@/hooks/use-theme` se import karti hain
 * wo bina kisi change ke kaam karengi. Internally ab React Context use hota hai
 * jo theme ek baar root me compute karta hai.
 *
 * Source of truth: @/context/ThemeContext.tsx
 */
export { useTheme } from '@/context/ThemeContext';
export type { ThemeContextValue, ThemeColors } from '@/context/ThemeContext';
