import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { AnimatedReveal } from '@/components/ui/animated-reveal';

interface OnboardingSlideProps {
  slide: {
    id: number;
    title: string;
    subtitle: string;
    Illustration: React.ComponentType<{ width: number; height: number }>;
    badgeText: string;
  };
  isActive: boolean;
  screenWidth: number;
}

export function OnboardingSlide({ slide, isActive, screenWidth }: OnboardingSlideProps) {
  const { Illustration } = slide;

  // Tiny, highly focused loop animation for illustration floating vertical drift
  const floatAnim = useSharedValue(0);

  useEffect(() => {
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1800 }),
        withTiming(0, { duration: 1800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.value }],
  }));

  return (
    <View 
      style={{ width: screenWidth }} 
      className="flex-1 justify-center items-center px-8 pb-4"
    >
      <View className="items-center justify-center w-full">
        {/* Dynamic Floating & Morphing Illustration Reveal */}
        <AnimatedReveal 
          active={isActive}
          variant="scale"
          spring
          duration={550}
          damping={12}
          stiffness={85}
          className="items-center justify-center rounded-[40px] p-0"
        >
          <Animated.View style={animatedFloatStyle}>
            <Illustration width={screenWidth * 0.88} height={screenWidth * 0.74} />
          </Animated.View>
        </AnimatedReveal>

        {/* Dynamic, Smoothly Staggered Text Reveal Elements */}
        <View className="items-center text-center px-2 -mt-4">
          
          {/* Badge Reveal */}
          <AnimatedReveal 
            active={isActive}
            variant="scale"
            delay={100}
            duration={450}
            className="py-1.5 px-3.5 rounded-full mb-3.5 border border-border bg-secondary/30 dark:bg-muted/10 backdrop-blur-md"
          >
            <Text className="text-[9px] font-black uppercase tracking-widest text-primary">
              {slide.badgeText}
            </Text>
          </AnimatedReveal>

          {/* Heading and Description Reveal */}
          <AnimatedReveal 
            active={isActive}
            variant="slide-up"
            delay={200}
            duration={500}
            className="items-center"
          >
            <Text className="text-4xl font-black text-center tracking-tight text-foreground leading-[44px]">
              {slide.title}
            </Text>
            <Text className="text-[14px] font-semibold text-center text-muted-foreground mt-2 leading-6 px-2">
              {slide.subtitle}
            </Text>
          </AnimatedReveal>
        </View>
      </View>
    </View>
  );
}
