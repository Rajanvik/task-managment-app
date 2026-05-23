import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { View, ScrollView, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sparkles, Compass, ShieldCheck } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn } from 'react-native-reanimated';

import { PlanIllustration, OrganizeIllustration, AchieveIllustration } from '@/components/illustrations';
import { BackgroundBlobs } from '@/app/(tabs)/_components/onboarding/BackgroundBlobs';
import { OnboardingHeader } from '@/app/(tabs)/_components/onboarding/OnboardingHeader';
import { OnboardingSlide } from '@/app/(tabs)/_components/onboarding/OnboardingSlide';
import { OnboardingControls } from '@/app/(tabs)/_components/onboarding/OnboardingControls';
import { useTheme } from '@/hooks/use-theme';

const SLIDES = [
  {
    id: 1,
    title: 'Plan Your Day',
    subtitle: 'Effortlessly plan and schedule your daily tasks, set priorities, and focus on what matters most.',
    Illustration: PlanIllustration,
    icon: Compass,
    badgeText: 'SMART PLANNER',
  },
  {
    id: 2,
    title: 'Stay Organized',
    subtitle: 'Categorize your tasks, build step-by-step checklists, and maintain structure across work and life.',
    Illustration: OrganizeIllustration,
    icon: Sparkles,
    badgeText: 'GET STRUCTURED',
  },
  {
    id: 3,
    title: 'Achieve Your Goals',
    subtitle: 'Track your real-time completion stats, get smart alerts, and elevate your productivity every single day.',
    Illustration: AchieveIllustration,
    icon: ShieldCheck,
    badgeText: 'PEAK PRODUCTIVITY',
  },
];

interface IOnboardingIndexProps {}

const OnboardingIndex: React.FC<IOnboardingIndexProps> = () => {
  const router = useRouter();
  const { colorScheme, theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
      Haptics.selectionAsync();
    }
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      router.replace('/login' as any);
    } catch (err) {
      console.error('Failed to save onboarding completion state:', err);
      router.replace('/login' as any);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleComplete();
  };

  const handleDotPress = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const activeSlide = SLIDES[currentIndex];

  return (
    <View className="flex-1 bg-background">
      <Animated.View entering={FadeIn.duration(650)} className="flex-1">
        {/* Premium background radial shapes */}
        <BackgroundBlobs />

        {/* Brand & Action Header */}
        <OnboardingHeader
          currentIndex={currentIndex}
          totalSlides={SLIDES.length}
          activeIcon={activeSlide.icon}
          onSkip={handleSkip}
          theme={theme}
        />

        {/* Horizontal Swipe Pages */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {SLIDES.map((slide, index) => (
            <OnboardingSlide
              key={slide.id}
              slide={slide}
              isActive={index === currentIndex}
              screenWidth={screenWidth}
            />
          ))}
        </ScrollView>

        {/* Footer Navigation Dots & CTA button */}
        <OnboardingControls
          currentIndex={currentIndex}
          totalSlides={SLIDES.length}
          onDotPress={handleDotPress}
          onNext={handleNext}
          colorScheme={colorScheme}
          theme={theme}
        />
      </Animated.View>
    </View>
  );
};

export default OnboardingIndex;
