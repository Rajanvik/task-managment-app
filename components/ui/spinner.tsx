import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { Loader, type LucideProps } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export function Spinner({ className, size = 16, ...props }: LucideProps & { className?: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    return () => {
      cancelAnimation(rotation);
    };
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={animatedStyle} className="items-center justify-center">
      <Icon
        as={Loader}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading"
        size={size}
        className={cn("text-muted-foreground", className)}
        {...props}
      />
    </Animated.View>
  );
}

export function SpinnerCustom() {
  return (
    <View className="flex-row items-center gap-4">
      <Spinner />
    </View>
  );
}

