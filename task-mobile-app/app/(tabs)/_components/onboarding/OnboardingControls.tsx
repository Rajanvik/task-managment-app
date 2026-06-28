import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { 
  Layout, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import { ChevronRight, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import * as Haptics from 'expo-haptics';

interface OnboardingControlsProps {
  currentIndex: number;
  totalSlides: number;
  onDotPress: (index: number) => void;
  onNext: () => void;
  colorScheme: 'light' | 'dark';
}

export const OnboardingControls: React.FC<OnboardingControlsProps> = ({
  currentIndex,
  totalSlides,
  onDotPress,
  onNext,
  colorScheme,
}) => {
  const insets = useSafeAreaInsets();
  const isLastSlide = currentIndex === totalSlides - 1;
  
  // Custom button spring scale factor on press
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.94, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const handleDotTap = (index: number) => {
    if (index !== currentIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDotPress(index);
    }
  };

  return (
    <View 
      className="px-8 pt-4 pb-2 flex-row items-center justify-between w-full"
      style={{ paddingBottom: Math.max(insets.bottom, 20) }}
    >
      {/* Slide Paging Dots Indicator - Made Pressable & Dynamic */}
      <View className="flex-row gap-2.5 items-center">
        {Array.from({ length: totalSlides }).map((_, index) => {
          const isSelected = index === currentIndex;
          return (
            <Pressable
              key={index}
              onPress={() => handleDotTap(index)}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              <Animated.View
                layout={Layout.springify().damping(16).stiffness(110)}
                className={`h-2 rounded-full ${
                  isSelected 
                    ? 'bg-primary' 
                    : (colorScheme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200')
                }`}
                style={{
                  width: isSelected ? 28 : 8,
                }}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Premium Translucent morphing CTA Button */}
      <Animated.View 
        style={buttonAnimatedStyle}
        layout={Layout.springify().damping(18).stiffness(120)}
      >
        <Pressable
          onPress={onNext}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className={`flex-row items-center justify-center px-6 py-3 rounded-full active:opacity-90 shadow-md ${
            isLastSlide ? 'bg-primary shadow-primary/20' : 'bg-primary'
          }`}
        >
          {/* Animated transitions between text values */}
          <Text className="text-xs font-black uppercase tracking-widest mr-2 text-primary-foreground">
            {isLastSlide ? 'Get Started' : 'Next Step'}
          </Text>

          {/* Mini rounded badge for icons */}
          <View className="h-5 w-5 rounded-full items-center justify-center ml-1 bg-primary-foreground shadow-sm">
            {isLastSlide ? (
              <Icon as={Check} className="text-primary" size={10} strokeWidth={4.5} />
            ) : (
              <Icon as={ChevronRight} className="text-primary" size={10} strokeWidth={4.5} />
            )}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};
