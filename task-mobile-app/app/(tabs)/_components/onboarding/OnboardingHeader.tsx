import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { LucideIcon } from 'lucide-react-native';

interface OnboardingHeaderProps {
  currentIndex: number;
  totalSlides: number;
  activeIcon: LucideIcon;
  onSkip: () => void;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  currentIndex,
  totalSlides,
  activeIcon: ActiveIcon,
  onSkip,
}) => {
  const insets = useSafeAreaInsets();
  // Scale animations for interactive feel
  const logoScale = useSharedValue(1);
  const skipScale = useSharedValue(1);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const skipAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: skipScale.value }],
  }));

  const handleLogoPressIn = () => {
    logoScale.value = withSpring(0.92, { damping: 10 });
  };

  const handleLogoPressOut = () => {
    logoScale.value = withSpring(1, { damping: 10 });
  };

  const handleSkipPressIn = () => {
    skipScale.value = withSpring(0.94, { damping: 12 });
  };

  const handleSkipPressOut = () => {
    skipScale.value = withSpring(1, { damping: 12 });
  };

  return (
    <Animated.View 
      entering={FadeInDown.duration(600)}
      className="px-6 pb-5 flex-row items-center justify-between z-10 w-full"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      {/* Brand logo & icon */}
      <Pressable
        onPress={handleLogoPressIn}
        onPressIn={handleLogoPressIn}
        onPressOut={handleLogoPressOut}
        className="flex-row items-center gap-2"
      >
        <Animated.View 
          style={logoAnimatedStyle}
          className="h-7 w-7 rounded-xl items-center justify-center bg-primary shadow-sm"
        >
          {ActiveIcon && <Icon as={ActiveIcon} className="text-background" size={14} strokeWidth={3} />}
        </Animated.View>
        <Text className="text-[12px] font-black tracking-widest uppercase text-foreground">
          Taskly Pro
        </Text>
      </Pressable>
      
      {/* Skip Button */}
      {currentIndex < totalSlides - 1 ? (
        <Animated.View style={skipAnimatedStyle}>
          <Pressable 
            onPress={onSkip}
            onPressIn={handleSkipPressIn}
            onPressOut={handleSkipPressOut}
            className="px-4 py-2 rounded-full border border-border bg-secondary/30 dark:bg-muted/10 backdrop-blur-md active:opacity-90"
          >
            <Text className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Skip
            </Text>
          </Pressable>
        </Animated.View>
      ) : (
        <View className="w-10 h-8" />
      )}
    </Animated.View>
  );
};
