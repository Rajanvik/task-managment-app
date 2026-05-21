import React, { useEffect, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Text } from '@/components/ui/text';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TABS = [
  { name: 'analytics/index', label: 'Stats',   icon: 'chart.bar.fill'  },
  { name: 'tasks',           label: 'Tasks',   icon: 'list.bullet'     },
  { name: 'home/index',      label: 'Home',    icon: 'house.fill'      },
  { name: 'explore/index',   label: 'Explore', icon: 'paperplane.fill' },
  { name: 'profile/index',   label: 'Profile', icon: 'person.fill'     },
] as const;

// Fast O(1) tab configuration lookup
const TAB_MAP = TABS.reduce((acc, tab) => {
  acc[tab.name] = tab;
  return acc;
}, {} as Record<string, typeof TABS[number]>);

// ─── Constants ────────────────────────────────────────────────────────────
const CENTER_IDX    = 2;
const BAR_H         = 75;
const CIRCLE_D      = 58;
const RING_W        = 8;
const SHELL_H       = BAR_H + CIRCLE_D / 2 + RING_W + 2;
const OUTER_D       = CIRCLE_D + RING_W * 2;
// Snug vertical offset for central floating Home button
const CIRCLE_BOTTOM = BAR_H - OUTER_D / 2 - 4;

// Active indicator capsule size constants
const SLIDER_W = 56;
const SLIDER_H = 28;

interface TabActiveBgProps {
  focused: boolean;
  colorScheme: 'light' | 'dark';
}

/**
 * High-Performance Local Active Background Capsule Component
 * Renders a gorgeous local fade-in and scale spring transition.
 * Eliminates screen-wide sliding lag/distraction, centering 100% perfectly.
 */
const TabActiveBg = React.memo(({ focused, colorScheme }: TabActiveBgProps) => {
  const opacity = useSharedValue(focused ? 1 : 0);
  const scale = useSharedValue(focused ? 1 : 0.92);

  useEffect(() => {
    opacity.value = withSpring(focused ? 1 : 0, { damping: 15, stiffness: 150 });
    scale.value = withSpring(focused ? 1 : 0.92, { damping: 15, stiffness: 150 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.activeBg,
        {
          backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        },
        animatedStyle,
      ]}
    />
  );
});

interface TabIconProps {
  focused: boolean;
  icon: string;
  theme: any;
}

/**
 * Standard Tab Icon Component
 * Lightweight pure component rendering IconSymbol directly.
 */
const TabIcon = React.memo(({ focused, icon, theme }: TabIconProps) => (
  <IconSymbol
    size={20}
    name={icon as any}
    color={focused ? theme.foreground : theme.mutedForeground}
  />
));

interface TabLabelProps {
  focused: boolean;
  label: string;
  theme: any;
}

/**
 * Standard Tab Label Component
 * High-performance lightweight memoized text wrapper.
 */
const TabLabel = React.memo(({ focused, label, theme }: TabLabelProps) => (
  <Text
    style={[
      styles.tabLabel,
      {
        fontWeight: focused ? '700' : '500',
        color: focused ? theme.foreground : theme.mutedForeground,
      }
    ]}
  >
    {label}
  </Text>
));

interface CenterTabBarButtonProps {
  route: any;
  focused: boolean;
  tabInfo: typeof TABS[number];
  theme: any;
  onPress: (routeName: string, routeKey: string, focused: boolean) => void;
}

/**
 * Animated Central Floating Button Component
 * Supports custom spring scales, touch/press haptic responses, and dynamic active scaling.
 * Completely shadowless flat design.
 */
const CenterTabBarButton = React.memo(({ route, focused, tabInfo, theme, onPress }: CenterTabBarButtonProps) => {
  const activeProgress = useSharedValue(focused ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    activeProgress.value = withSpring(focused ? 1 : 0, {
      damping: 14,
      stiffness: 110,
    });
  }, [focused]);

  // Spring animations for focused scaling and press interactions
  const animatedStyle = useAnimatedStyle(() => {
    const baseScale = 1 + activeProgress.value * 0.08;
    return {
      transform: [
        { scale: pressScale.value * baseScale },
      ],
      backgroundColor: theme.secondary,
    };
  });

  const handlePressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pressScale.value = withSpring(0.9, { damping: 8, stiffness: 350 });
  }, []);

  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1, { damping: 8, stiffness: 350 });
  }, []);

  const handlePress = useCallback(() => {
    onPress(route.name, route.key, focused);
  }, [onPress, route.name, route.key, focused]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.centerPressable}
    >
      <Animated.View
        style={[
          styles.centerAnimatedView,
          animatedStyle,
        ]}
      >
        <IconSymbol
          size={24}
          name={tabInfo.icon as any}
          color={theme.foreground}
        />
        <Text
          style={[
            styles.centerText,
            { color: theme.foreground }
          ]}
        >
          {tabInfo.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.focused === nextProps.focused &&
    prevProps.theme === nextProps.theme &&
    prevProps.route.key === nextProps.route.key &&
    prevProps.onPress === nextProps.onPress
  );
});

interface TabItemProps {
  route: any;
  focused: boolean;
  tabInfo: typeof TABS[number];
  theme: any;
  colorScheme: 'light' | 'dark';
  onPress: (routeName: string, routeKey: string, focused: boolean) => void;
}

/**
 * Optimized individual standard Tab item wrapper.
 * Using strict React.memo comparison to bypass render work when focus stays unchanged.
 */
const TabItem = React.memo(({ route, focused, tabInfo, theme, colorScheme, onPress }: TabItemProps) => {
  const handlePress = useCallback(() => {
    onPress(route.name, route.key, focused);
  }, [onPress, route.name, route.key, focused]);

  return (
    <Pressable
      onPress={handlePress}
      className="flex-1 items-center justify-center z-20"
      style={styles.tabPressable}
    >
      <View className="items-center justify-center">
        {/* Local Fade Active Indicator Capsule Background */}
        <TabActiveBg 
          focused={focused} 
          colorScheme={colorScheme} 
        />

        {/* Icon wrapper */}
        <View 
          className="items-center justify-center" 
          style={styles.iconWrapper}
        >
          <TabIcon
            focused={focused}
            icon={tabInfo.icon}
            theme={theme}
          />
        </View>

        {/* Label text */}
        <TabLabel
          focused={focused}
          label={tabInfo.label}
          theme={theme}
        />
      </View>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.focused === nextProps.focused &&
    prevProps.theme === nextProps.theme &&
    prevProps.colorScheme === nextProps.colorScheme &&
    prevProps.route.key === nextProps.route.key &&
    prevProps.onPress === nextProps.onPress
  );
});

export function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colorScheme, theme } = useTheme();
  const insets = useSafeAreaInsets();

  const doNav = useCallback((routeName: string, routeKey: string, focused: boolean) => {
    const ev = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!focused && !ev.defaultPrevented) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate(routeName);
    }
  }, [navigation]);

  const cRoute   = state.routes[CENTER_IDX];
  const cTab     = TABS[CENTER_IDX];
  const cFocused = state.index === CENTER_IDX;

  return (
    // SHELL — absolute, full width, explicit height, transparent bg, z-50
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 bg-transparent z-50"
      style={{ height: SHELL_H + insets.bottom }}
    >

      {/* ── FLOATING CIRCLE ─────────────────────────────────────────────── */}
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 items-center z-30"
        style={{ bottom: CIRCLE_BOTTOM + insets.bottom }}
      >
        {/* OUTER RING — bg-secondary, separation border, shadowless flat design */}
        <View
          className="bg-secondary items-center justify-center"
          style={[
            styles.outerCircle,
            { borderColor: theme.background }
          ]}
        >
          <CenterTabBarButton
            route={cRoute}
            focused={cFocused}
            tabInfo={cTab}
            theme={theme}
            onPress={doNav}
          />
        </View>
      </View>

      {/* ── TAB BAR ─────────────────────────────────────────────────────── */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row bg-secondary border-t border-l border-r border-border z-10"
        style={[
          styles.tabContainer,
          {
            height: BAR_H + insets.bottom,
            paddingBottom: insets.bottom,
          }
        ]}
      >
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const tabInfo = TAB_MAP[route.name];
          if (!tabInfo) return null;

          // Empty center slot
          if (index === CENTER_IDX) {
            return <View key={index} className="flex-1" />;
          }

          return (
            <TabItem
              key={route.key}
              route={route}
              focused={focused}
              tabInfo={tabInfo}
              theme={theme}
              colorScheme={colorScheme}
              onPress={doNav}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeBg: {
    position: 'absolute',
    width: SLIDER_W,
    height: SLIDER_H,
    borderRadius: SLIDER_H / 2,
    top: 0,
    zIndex: -1,
  },
  iconWrapper: {
    width: SLIDER_W,
    height: SLIDER_H,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
    marginTop: 2, 
  },
  centerPressable: {
    width: CIRCLE_D,
    height: CIRCLE_D,
    borderRadius: CIRCLE_D / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerAnimatedView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CIRCLE_D / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
    letterSpacing: 0.3,
  },
  tabPressable: {
    height: BAR_H,
  },
  outerCircle: {
    width:        OUTER_D,
    height:       OUTER_D,
    borderRadius: OUTER_D / 2,
    borderWidth:  RING_W,
  },
  tabContainer: {
    height: BAR_H,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: 'center',
  }
});
