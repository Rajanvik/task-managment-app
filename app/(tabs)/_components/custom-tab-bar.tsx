import React from 'react';
import { View, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/text';
import Animated, { 
  FadeIn, 
  FadeOut, 
  LinearTransition 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export const TABS = [
  { name: 'home/index', label: 'Home', icon: 'house.fill' },
  { name: 'tasks', label: 'Tasks', icon: 'list.bullet' },
  { name: 'explore/index', label: 'Explore', icon: 'paperplane.fill' },
  { name: 'profile/index', label: 'Profile', icon: 'person.fill' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme];

  return (
    <View 
      className="absolute bottom-6 left-5 right-5 h-16 bg-secondary/80 dark:bg-muted/80 border border-border/40 rounded-[32px] flex-row items-center justify-around px-2 shadow-2xl shadow-black/20"
      style={{ 
        backdropFilter: 'blur(10px)', // For web support if needed
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tabInfo = TABS.find(t => t.name === route.name);
        if (!tabInfo) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate(route.name);
          }
        };

        return (
          <AnimatedPressable
            key={index}
            onPress={onPress}
            layout={LinearTransition.springify().damping(20).stiffness(150)}
            className="items-center justify-center"
          >
            <Animated.View 
              layout={LinearTransition.springify().damping(20).stiffness(150)}
              className={`flex-row items-center gap-2 py-2.5 px-5 overflow-hidden ${isFocused ? 'bg-primary' : 'bg-transparent'}`}
              style={{ borderRadius: 100 }}
            >
              <IconSymbol 
                size={20} 
                name={tabInfo.icon as any} 
                color={isFocused ? theme.background : theme.mutedForeground} 
              />
              {isFocused && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                >
                  <Text 
                    className="text-sm font-bold tracking-tight"
                    style={{ color: theme.background }}
                  >
                    {tabInfo.label}
                  </Text>
                </Animated.View>
              )}
            </Animated.View>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}
