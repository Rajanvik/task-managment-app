import React from 'react';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { THEME } from '@/lib/theme';

interface IllustrationProps {
  width?: number;
  height?: number;
  hideBackgroundCircle?: boolean;
}

/**
 * Robust HSL-to-RGB parser to convert standard design tokens (like 'hsl(0, 0%, 96.1%)')
 * into standard 'rgb(r, g, b)' values. This avoids compatibility bugs on older Android/iOS SVG engines
 * which cannot parse HSL strings directly in stroke or fill attributes.
 */
function parseHsl(hslString: string): string {
  if (!hslString) return 'rgb(255, 255, 255)';
  if (!hslString.startsWith('hsl')) return hslString;
  
  const match = hslString.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/);
  if (!match) return hslString;
  
  const h = parseFloat(match[1]);
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  const ri = Math.round((r + m) * 255);
  const gi = Math.round((g + m) * 255);
  const bi = Math.round((b + m) * 255);
  
  return `rgb(${ri}, ${gi}, ${bi})`;
}

const getIllustrationColors = (colorScheme: 'light' | 'dark') => {
  const theme = THEME[colorScheme || 'light'];
  
  return {
    primary: parseHsl(theme.primary),
    secondary: parseHsl(theme.mutedForeground),
    accent: parseHsl(theme.secondary),
    border: parseHsl(theme.border),
    cardBg: parseHsl(theme.card),
    highlight: colorScheme === 'dark' ? '#f59e0b' : '#d97706', // Beautiful warm amber focal point
  };
};

export function PlanIllustration({ width = 280, height = 220, hideBackgroundCircle = false }: IllustrationProps) {
  const { colorScheme } = useColorScheme();
  const colors = getIllustrationColors(colorScheme);

  return (
    <Svg width={width} height={height} viewBox="0 0 280 220" fill="none">
      <Defs>
        <LinearGradient id="planGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.9} />
          <Stop offset="100%" stopColor={colors.secondary} stopOpacity={0.7} />
        </LinearGradient>
        <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.accent} stopOpacity={0.4} />
          <Stop offset="100%" stopColor={colors.accent} stopOpacity={0.0} />
        </LinearGradient>
      </Defs>

      {/* Giant Background Spotlight Circle (Dynamically styled from theme.secondary) */}
      {!hideBackgroundCircle && <Circle cx="140" cy="110" r="100" fill="url(#bgGrad)" />}

      {/* Foreground elements scaled down to 0.76 so they sit beautifully inside the large circle */}
      <G transform="translate(140, 110) scale(0.76) translate(-140, -110)">
        {/* Giant Calendar Clipboard */}
        <Rect x="60" y="30" width="160" height="150" rx="16" fill={colors.cardBg} stroke={colors.border} strokeWidth="2" />
        
        {/* Calendar Header clip */}
        <Rect x="110" y="20" width="60" height="20" rx="6" fill="url(#planGrad)" />
        <Circle cx="125" cy="20" r="4" fill={colorScheme === 'dark' ? '#09090b' : '#ffffff'} />
        <Circle cx="155" cy="20" r="4" fill={colorScheme === 'dark' ? '#09090b' : '#ffffff'} />

        {/* Task Line 1 */}
        <Rect x="90" y="70" width="100" height="12" rx="4" fill="url(#planGrad)" opacity="0.85" />
        <Circle cx="80" cy="76" r="6" fill={colors.highlight} />
        <Path d="M78 76L79.5 77.5L82 74.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Task Line 2 */}
        <Rect x="90" y="100" width="80" height="12" rx="4" fill={colors.accent} />
        <Circle cx="80" cy="106" r="6" fill={colors.accent} />

        {/* Task Line 3 */}
        <Rect x="90" y="130" width="90" height="12" rx="4" fill="url(#planGrad)" opacity="0.85" />
        <Circle cx="80" cy="136" r="6" fill={colors.highlight} />
        <Path d="M78 136L79.5 137.5L82 134.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Clock overlay representing time management */}
        <G transform="translate(190, 140)">
          <Circle cx="25" cy="25" r="25" fill={colors.cardBg} stroke="url(#planGrad)" strokeWidth="3" />
          <Path d="M25 10V25H35" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" />
          <Circle cx="25" cy="25" r="2" fill={colors.highlight} />
        </G>

        {/* Pencil Graphic */}
        <G transform="translate(45, 120) rotate(-45)">
          <Rect x="0" y="0" width="12" height="60" rx="3" fill="url(#planGrad)" />
          <Path d="M0 0 L6 -8 L12 0 Z" fill={colors.highlight} />
        </G>
      </G>
    </Svg>
  );
}

export function OrganizeIllustration({ width = 280, height = 220 }: IllustrationProps) {
  const { colorScheme } = useColorScheme();
  const colors = getIllustrationColors(colorScheme);

  return (
    <Svg width={width} height={height} viewBox="0 0 280 220" fill="none">
      <Defs>
        <LinearGradient id="orgGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={colors.secondary} stopOpacity={0.8} />
          <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.9} />
        </LinearGradient>
        <LinearGradient id="bgGrad2" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.accent} stopOpacity={0.4} />
          <Stop offset="100%" stopColor={colors.accent} stopOpacity={0.0} />
        </LinearGradient>
      </Defs>

      {/* Giant Background Spotlight Circle (Dynamically styled from theme.secondary) */}
      <Circle cx="140" cy="110" r="100" fill="url(#bgGrad2)" />

      {/* Foreground elements scaled down to 0.76 so they sit beautifully inside the large circle */}
      <G transform="translate(140, 110) scale(0.76) translate(-140, -110)">
        {/* Card 1 (Bottom Back Card) */}
        <G transform="translate(60, 45) rotate(-6)">
          <Rect x="0" y="0" width="130" height="90" rx="12" fill={colors.cardBg} stroke={colors.border} strokeWidth="1.5" />
          <Rect x="15" y="15" width="60" height="8" rx="3" fill={colors.border} />
          <Rect x="15" y="32" width="100" height="6" rx="2" fill={colors.border} opacity="0.6" />
          <Rect x="15" y="44" width="80" height="6" rx="2" fill={colors.border} opacity="0.6" />
          <Rect x="15" y="60" width="45" height="15" rx="6" fill={colors.highlight} opacity="0.2" />
          <Circle cx="105" cy="68" r="10" fill={colors.border} />
        </G>

        {/* Card 2 (Middle Active Card) */}
        <G transform="translate(85, 60) rotate(4)">
          <Rect x="0" y="0" width="135" height="95" rx="12" fill={colors.cardBg} stroke="url(#orgGrad)" strokeWidth="2.5" />
          <Rect x="15" y="18" width="70" height="10" rx="3" fill="url(#orgGrad)" />
          <Rect x="15" y="38" width="105" height="6" rx="2" fill={colors.border} />
          <Rect x="15" y="50" width="90" height="6" rx="2" fill={colors.border} opacity="0.8" />
          
          {/* Category Tag */}
          <Rect x="15" y="66" width="50" height="16" rx="8" fill={colors.highlight} opacity="0.15" />
          <Rect x="25" y="71" width="30" height="6" rx="2" fill={colors.highlight} />

          {/* User avatar mockup */}
          <Circle cx="110" cy="74" r="10" fill={colors.primary} />
          <Circle cx="110" cy="81" r="7" fill={colors.cardBg} />
        </G>

        {/* Floating Gear elements representing organization */}
        <G transform="translate(200, 30)">
          <Circle cx="15" cy="15" r="12" stroke={colors.secondary} strokeWidth="3" strokeDasharray="6 3" />
          <Circle cx="15" cy="15" r="5" fill={colors.secondary} />
        </G>
        <G transform="translate(35, 125)">
          <Circle cx="12" cy="12" r="10" stroke={colors.primary} strokeWidth="2.5" strokeDasharray="4 2" />
          <Circle cx="12" cy="12" r="4" fill={colors.primary} />
        </G>
      </G>
    </Svg>
  );
}

export function AchieveIllustration({ width = 280, height = 220, hideBackgroundCircle = false }: IllustrationProps) {
  const { colorScheme } = useColorScheme();
  const colors = getIllustrationColors(colorScheme);

  return (
    <Svg width={width} height={height} viewBox="0 0 280 220" fill="none">
      <Defs>
        <LinearGradient id="achGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.9} />
          <Stop offset="100%" stopColor={colors.secondary} stopOpacity={0.7} />
        </LinearGradient>
        <LinearGradient id="bgGrad3" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.accent} stopOpacity={0.4} />
          <Stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* Giant Background Spotlight Circle (Dynamically styled from theme.secondary) */}
      {!hideBackgroundCircle && <Circle cx="140" cy="110" r="100" fill="url(#bgGrad3)" />}

      {/* Foreground elements scaled down to 0.76 so they sit beautifully inside the large circle */}
      <G transform="translate(140, 110) scale(0.76) translate(-140, -110)">
        {/* Giant Trophy */}
        <G transform="translate(100, 45)">
          {/* Trophy Base */}
          <Rect x="15" y="90" width="50" height="10" rx="4" fill={colors.accent} />
          <Path d="M25 80 L55 80 L48 90 L32 90 Z" fill={colors.border} />
          <Rect x="35" y="55" width="10" height="25" fill={colors.border} />

          {/* Trophy Bowl */}
          <Path d="M10 20 C10 60, 70 60, 70 20 Z" fill="url(#achGrad)" />
          <Rect x="10" y="12" width="60" height="8" rx="3" fill="url(#achGrad)" />

          {/* Trophy Handles */}
          <Path d="M10 25 C-5 25, -5 45, 10 45" stroke="url(#achGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <Path d="M70 25 C85 25, 85 45, 70 45" stroke="url(#achGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Star on Trophy */}
          <Path d="M40 28 L43 34 L50 35 L45 40 L46 47 L40 43 L34 47 L35 40 L30 35 L37 34 Z" fill={colors.highlight} />
        </G>

        {/* Rising success arrow */}
        <Path d="M30 180 Q100 130, 240 70" stroke={colors.highlight} strokeWidth="4" strokeLinecap="round" strokeDasharray="200" strokeDashoffset="0" />
        <Path d="M225 70 L242 68 L240 85" fill={colors.highlight} stroke={colors.highlight} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Sparkles / Stars */}
        <G transform="translate(60, 50)">
          <Path d="M10 0 L12 6 L18 8 L12 10 L10 16 L8 10 L2 8 L8 6 Z" fill={colors.highlight} />
        </G>
        <G transform="translate(210, 110)">
          <Path d="M6 0 L8 4 L12 5 L8 6 L6 10 L4 6 L0 5 L4 4 Z" fill={colors.highlight} />
        </G>
        <G transform="translate(230, 40)">
          <Path d="M8 0 L10 5 L15 6 L10 7 L8 12 L6 7 L1 6 L6 5 Z" fill={colors.highlight} opacity="0.7" />
        </G>

        {/* Circular Progress Ring overlay on the right side bottom */}
        <G transform="translate(190, 120)">
          <Circle cx="20" cy="20" r="20" fill={colors.cardBg} stroke={colors.border} strokeWidth="4" />
          <Circle cx="20" cy="20" r="20" stroke={colors.primary} strokeWidth="4" strokeDasharray="125" strokeDashoffset="35" strokeLinecap="round" fill="none" transform="rotate(-90 20 20)" />
          <Circle cx="20" cy="20" r="2" fill={colors.highlight} />
        </G>
      </G>
    </Svg>
  );
}

export function NoTasksIllustration({ width = 140, height = 120, hideBackgroundCircle = false }: IllustrationProps) {
  const { colorScheme } = useColorScheme();
  const colors = getIllustrationColors(colorScheme);

  return (
    <Svg width={width} height={height} viewBox="0 0 140 120" fill="none">
      <Defs>
        <LinearGradient id="noTasksGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={colors.secondary} stopOpacity="0.6" />
          <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.4" />
        </LinearGradient>
        <LinearGradient id="spotlightGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={colors.accent} stopOpacity="0.0" />
        </LinearGradient>
      </Defs>

      {/* Background Spotlight */}
      {!hideBackgroundCircle && <Circle cx="70" cy="60" r="50" fill="url(#spotlightGrad)" />}

      <G transform="translate(70, 60) scale(0.85) translate(-70, -60)">
        {/* Curved Floating Clipboard in Back */}
        <G transform="translate(30, 25) rotate(-8)">
          <Rect x="0" y="0" width="70" height="80" rx="10" fill={colors.cardBg} stroke={colors.border} strokeWidth="1.5" />
          <Rect x="10" y="12" width="30" height="5" rx="2" fill={colors.border} opacity="0.5" />
          <Rect x="10" y="25" width="50" height="4" rx="2" fill={colors.border} opacity="0.3" />
          <Rect x="10" y="35" width="40" height="4" rx="2" fill={colors.border} opacity="0.3" />
          <Rect x="10" y="45" width="45" height="4" rx="2" fill={colors.border} opacity="0.3" />
        </G>

        {/* Checked/floating primary illustration in Front */}
        <G transform="translate(45, 30) rotate(5)">
          <Rect x="0" y="0" width="75" height="85" rx="12" fill={colors.cardBg} stroke="url(#noTasksGrad)" strokeWidth="2" />
          {/* Clip */}
          <Rect x="22" y="-6" width="30" height="12" rx="4" fill="url(#noTasksGrad)" />
          
          {/* Big Check icon overlaying the card */}
          <Circle cx="37" cy="42" r="18" fill={colors.accent} opacity="0.25" />
          <Circle cx="37" cy="42" r="14" fill={colors.cardBg} stroke={colors.primary} strokeWidth="2" />
          <Path d="M32 42L35.5 45.5L42.5 38" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Sparkles of catch up success */}
          <G transform="translate(10, 15)">
            <Path d="M4 0 L5 2.5 L7.5 3 L5 3.5 L4 6 L3 3.5 L0.5 3 L3 2.5 Z" fill={colors.highlight} />
          </G>
          <G transform="translate(62, 55)">
            <Path d="M3 0 L4 2 L6 2.5 L4 3 L3 5 L2 3 L0 2.5 L2 2 Z" fill={colors.highlight} />
          </G>
        </G>

        {/* Small floating bubbles */}
        <Circle cx="20" cy="30" r="3" fill={colors.highlight} opacity="0.6" />
        <Circle cx="15" cy="42" r="2" fill={colors.highlight} opacity="0.4" />
      </G>
    </Svg>
  );
}

export function AnalyticsIllustration({ width = 140, height = 120, hideBackgroundCircle = false }: IllustrationProps) {
  const { colorScheme } = useColorScheme();
  const colors = getIllustrationColors(colorScheme);

  return (
    <Svg width={width} height={height} viewBox="0 0 140 120" fill="none">
      <Defs>
        <LinearGradient id="analyticsGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={colors.secondary} stopOpacity={0.6} />
          <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.4} />
        </LinearGradient>
        <LinearGradient id="spotlightGradAnalytics" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.accent} stopOpacity={0.3} />
          <Stop offset="100%" stopColor={colors.accent} stopOpacity={0.0} />
        </LinearGradient>
        <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor={colors.primary} />
          <Stop offset="100%" stopColor={colors.highlight} />
        </LinearGradient>
      </Defs>

      {/* Background Spotlight */}
      {!hideBackgroundCircle && <Circle cx="70" cy="60" r="50" fill="url(#spotlightGradAnalytics)" />}

      <G transform="translate(70, 60) scale(0.85) translate(-70, -60)">
        {/* Curved Floating Bar Chart Card in Back */}
        <G transform="translate(30, 25) rotate(-8)">
          <Rect x="0" y="0" width="70" height="80" rx="10" fill={colors.cardBg} stroke={colors.border} strokeWidth="1.5" />
          {/* Grid lines */}
          <Rect x="10" y="20" width="50" height="1" fill={colors.border} opacity={0.3} />
          <Rect x="10" y="40" width="50" height="1" fill={colors.border} opacity={0.3} />
          <Rect x="10" y="60" width="50" height="1" fill={colors.border} opacity={0.3} />
          
          {/* Bar Charts */}
          <Rect x="15" y="45" width="8" height="25" rx="2" fill={colors.border} opacity={0.4} />
          <Rect x="28" y="30" width="8" height="40" rx="2" fill={colors.border} opacity={0.6} />
          <Rect x="41" y="50" width="8" height="20" rx="2" fill={colors.border} opacity={0.4} />
        </G>

        {/* Checked/floating Line Chart Card in Front */}
        <G transform="translate(45, 30) rotate(5)">
          <Rect x="0" y="0" width="75" height="85" rx="12" fill={colors.cardBg} stroke="url(#analyticsGrad)" strokeWidth="2" />
          {/* Clip / Card Header */}
          <Rect x="22" y="-6" width="30" height="12" rx="4" fill="url(#analyticsGrad)" />
          
          {/* Grid lines */}
          <Rect x="8" y="22" width="59" height="1" fill={colors.border} opacity={0.3} />
          <Rect x="8" y="42" width="59" height="1" fill={colors.border} opacity={0.3} />
          <Rect x="8" y="62" width="59" height="1" fill={colors.border} opacity={0.3} />

          {/* Line Chart Path */}
          <Path d="M12 60 L28 35 L44 48 L62 20" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Neon Dots */}
          <Circle cx="12" cy="60" r="3.5" fill={colors.cardBg} stroke={colors.primary} strokeWidth="2" />
          <Circle cx="28" cy="35" r="3.5" fill={colors.cardBg} stroke={colors.primary} strokeWidth="2" />
          <Circle cx="44" cy="48" r="3.5" fill={colors.cardBg} stroke={colors.primary} strokeWidth="2" />
          <Circle cx="62" cy="20" r="4.5" fill={colors.cardBg} stroke={colors.highlight} strokeWidth="2.5" />

          {/* Sparkles of premium analytics */}
          <G transform="translate(8, 8)">
            <Path d="M4 0 L5 2.5 L7.5 3 L5 3.5 L4 6 L3 3.5 L0.5 3 L3 2.5 Z" fill={colors.highlight} />
          </G>
          <G transform="translate(60, 50)">
            <Path d="M3 0 L4 2 L6 2.5 L4 3 L3 5 L2 3 L0 2.5 L2 2 Z" fill={colors.highlight} />
          </G>
        </G>

        {/* Small floating circles / bubble decorations */}
        <Circle cx="20" cy="30" r="3.5" fill={colors.highlight} opacity="0.6" />
        <Circle cx="15" cy="45" r="2" fill={colors.highlight} opacity="0.4" />
      </G>
    </Svg>
  );
}
