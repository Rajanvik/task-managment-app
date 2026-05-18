import React, { useEffect } from 'react';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp, 
  FadeInLeft, 
  FadeInRight, 
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

export type RevealVariant = 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';

interface AnimatedRevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  damping?: number;
  stiffness?: number;
  spring?: boolean;
  className?: string;
  style?: any;
  active?: boolean; // Optional: If provided, animates dynamically based on active/inactive states rather than simple mount
}

/**
 * Reusable AnimatedReveal Component
 * Wraps any layout or element to provide smooth, premium entrance transitions (Scroll/Mount Reveal).
 * Supporting fade, slide-up, slide-down, slide-left, slide-right, and scale zoom spring transitions.
 * Supports static mounting reveals and reactive step-based states (active={isActive}).
 */
export function AnimatedReveal({
  children,
  variant = 'fade',
  delay = 0,
  duration = 500,
  damping = 16,
  stiffness = 110,
  spring = true,
  className = '',
  style,
  active,
}: AnimatedRevealProps) {
  // 1. Static Mounting Reveal Mode (No 'active' prop provided)
  if (active === undefined) {
    let animation: any;

    switch (variant) {
      case 'slide-up':
        animation = FadeInDown;
        break;
      case 'slide-down':
        animation = FadeInUp;
        break;
      case 'slide-left':
        animation = FadeInRight;
        break;
      case 'slide-right':
        animation = FadeInLeft;
        break;
      case 'scale':
        animation = ZoomIn;
        break;
      case 'fade':
      default:
        animation = FadeIn;
        break;
    }

    let configuredAnimation = animation.duration(duration).delay(delay);

    if (spring && typeof configuredAnimation.springify === 'function') {
      configuredAnimation = configuredAnimation.springify().damping(damping).stiffness(stiffness);
    }

    return (
      <Animated.View 
        entering={configuredAnimation}
        className={className}
        style={style}
      >
        {children}
      </Animated.View>
    );
  }

  // 2. Reactive Interactive Reveal Mode (When 'active' prop is provided, e.g. Sliders/Steps)
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(variant === 'slide-down' ? -15 : (variant === 'slide-up' ? 15 : 0));
  const translateX = useSharedValue(variant === 'slide-right' ? -15 : (variant === 'slide-left' ? 15 : 0));
  const scale = useSharedValue(variant === 'scale' ? 0.82 : 1);

  useEffect(() => {
    if (active) {
      // Enter active state with a gorgeous delay-staggered spring transition
      opacity.value = withDelay(delay, withTiming(1, { duration }));

      if (spring) {
        translateY.value = withDelay(delay, withSpring(0, { damping, stiffness }));
        translateX.value = withDelay(delay, withSpring(0, { damping, stiffness }));
        scale.value = withDelay(delay, withSpring(1, { damping, stiffness }));
      } else {
        translateY.value = withDelay(delay, withTiming(0, { duration }));
        translateX.value = withDelay(delay, withTiming(0, { duration }));
        scale.value = withDelay(delay, withTiming(1, { duration }));
      }
    } else {
      // Clean, rapid exit timing when slide goes inactive
      opacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(variant === 'slide-down' ? -15 : (variant === 'slide-up' ? 15 : 0), { duration: 250 });
      translateX.value = withTiming(variant === 'slide-right' ? -15 : (variant === 'slide-left' ? 15 : 0), { duration: 250 });
      scale.value = withTiming(variant === 'scale' ? 0.82 : 1, { duration: 250 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => {
    const transforms: any[] = [];
    if (variant === 'slide-up' || variant === 'slide-down') {
      transforms.push({ translateY: translateY.value });
    } else if (variant === 'slide-left' || variant === 'slide-right') {
      transforms.push({ translateX: translateX.value });
    } else if (variant === 'scale') {
      transforms.push({ scale: scale.value });
    }

    return {
      opacity: opacity.value,
      transform: transforms,
    };
  });

  return (
    <Animated.View 
      style={[animatedStyle, style]}
      className={className}
    >
      {children}
    </Animated.View>
  );
}
