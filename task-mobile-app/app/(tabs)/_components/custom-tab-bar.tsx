import React, { useEffect, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { BarChart2, ListTodo, Home, Compass, User } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';
import { cn } from '@/lib/utils';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TABS = [
  { name: 'analytics/index', label: 'Stats',   icon: BarChart2 },
  { name: 'tasks',           label: 'Tasks',   icon: ListTodo  },
  { name: 'home/index',      label: 'Home',    icon: Home      },
  { name: 'explore/index',   label: 'Explore', icon: Compass   },
  { name: 'profile/index',   label: 'Profile', icon: User      },
] as const;

// Fast O(1) tab configuration lookup
const TAB_MAP = TABS.reduce((acc, tab) => {
  acc[tab.name] = tab as any;
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
  icon: any;
}

/**
 * Standard Tab Icon Component
 * Lightweight pure component rendering Lucide icon directly.
 */
const TabIcon = React.memo(({ focused, icon }: TabIconProps) => (
  <Icon
    size={20}
    as={icon}
    className={focused ? "text-foreground" : "text-muted-foreground"}
  />
));

interface TabLabelProps {
  focused: boolean;
  label: string;
}

/**
 * Standard Tab Label Component
 * High-performance lightweight memoized text wrapper.
 */
const TabLabel = React.memo(({ focused, label }: TabLabelProps) => (
  <Text
    className={cn(
      "text-[10px] tracking-[0.2px] mt-0.5",
      focused ? "font-bold text-foreground" : "font-medium text-muted-foreground"
    )}
  >
    {label}
  </Text>
));

interface CenterTabBarButtonProps {
  route: any;
  focused: boolean;
  tabInfo: typeof TABS[number];
  onPress: (routeName: string, routeKey: string, focused: boolean) => void;
}

/**
 * Animated Central Floating Button Component
 * Supports custom spring scales, touch/press haptic responses, and dynamic active scaling.
 * Completely shadowless flat design.
 */
const CenterTabBarButton = React.memo(({ route, focused, tabInfo, onPress }: CenterTabBarButtonProps) => {
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
        className="bg-secondary"
      >
        <Icon
          size={24}
          as={tabInfo.icon}
          className="text-foreground"
        />
        <Text
          className="text-[9px] font-bold mt-0.5 tracking-[0.3px] text-foreground"
        >
          {tabInfo.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.focused === nextProps.focused &&
    prevProps.route.key === nextProps.route.key &&
    prevProps.onPress === nextProps.onPress
  );
});

interface TabItemProps {
  route: any;
  focused: boolean;
  tabInfo: typeof TABS[number];
  colorScheme: 'light' | 'dark';
  onPress: (routeName: string, routeKey: string, focused: boolean) => void;
}

/**
 * Optimized individual standard Tab item wrapper.
 * Using strict React.memo comparison to bypass render work when focus stays unchanged.
 */
const TabItem = React.memo(({ route, focused, tabInfo, colorScheme, onPress }: TabItemProps) => {
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
          />
        </View>

        {/* Label text */}
        <TabLabel
          focused={focused}
          label={tabInfo.label}
        />
      </View>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.focused === nextProps.focused &&
    prevProps.colorScheme === nextProps.colorScheme &&
    prevProps.route.key === nextProps.route.key &&
    prevProps.onPress === nextProps.onPress
  );
});

export function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colorScheme } = useColorScheme();
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
          className="bg-secondary items-center justify-center border-background"
          style={styles.outerCircle}
        >
          <CenterTabBarButton
            route={cRoute}
            focused={cFocused}
            tabInfo={cTab}
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
              colorScheme={colorScheme || 'light'}
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
