import React, { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
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

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({ slide, isActive, screenWidth }) => {
  const { Illustration } = slide;
  const { height: screenHeight } = useWindowDimensions();

  const isSmallScreen = screenHeight < 700;
  const isTablet = screenWidth >= 768;

  // Limit illustrations to at most 28% of the screen height to prevent vertical content overflow,
  // and scale the width proportionally to the 280:220 viewBox aspect ratio (~1.27)
  const maxIllustrationHeight = Math.min(screenHeight * 0.28, isTablet ? 280 : 230);
  const illustrationWidth = maxIllustrationHeight * 1.27;
  const illustrationHeight = maxIllustrationHeight;

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
      style={{ width: screenWidth, height: '100%' }} 
      className="justify-center items-center px-8 pb-4"
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
            <Illustration width={illustrationWidth} height={illustrationHeight} />
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
            <Text 
              className={`font-black text-center tracking-tight text-foreground ${
                isSmallScreen ? 'text-2xl leading-8' : (isTablet ? 'text-4xl leading-[48px]' : 'text-3xl leading-[38px]')
              }`}
            >
              {slide.title}
            </Text>
            <Text 
              className={`font-semibold text-center text-muted-foreground mt-2 px-2 ${
                isSmallScreen ? 'text-[12px] leading-5' : 'text-[14px] leading-6'
              }`}
            >
              {slide.subtitle}
            </Text>
          </AnimatedReveal>
        </View>
      </View>
    </View>
  );
}
