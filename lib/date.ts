/**
 * lib/date.ts
 * ──────────────────────────────────────────────
 * Timezone-safe date helpers for the whole app.
 * Avoids UTC-to-local shift that `new Date(string)` causes
 * when the string is a bare YYYY-MM-DD value.
 */

/**
 * Parse a "YYYY-MM-DD" local date string into a Date object
 * whose local year/month/day match exactly (no timezone shift).
 */
export const parseLocalDate = (dateStr?: string): Date => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/**
 * Format a Date into a "YYYY-MM-DD" local date string
 * using the device's local calendar (not UTC).
 */
export const formatLocalDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
