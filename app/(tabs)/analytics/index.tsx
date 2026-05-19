import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { THEME } from '@/lib/theme';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimatedReveal } from '@/components/ui/animated-reveal';
import { AnalyticsIllustration } from '@/components/illustrations';

function EmptyStateIllustration() {
  const floatAnim = useSharedValue(0);

  React.useEffect(() => {
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatAnim.value }],
    };
  });

  return (
    <Animated.View style={floatStyle} className="items-center justify-center">
      <AnalyticsIllustration width={260} height={200} />
    </Animated.View>
  );
}

export default function AnalyticsScreen() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme];

  const handleNotifyMe = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    alert("You're on the list! We'll notify you as soon as the Stats dashboard goes live. 🚀");
  };

  return (
    <View className="flex-1 bg-background">
      {/* Background soft tint matches Home/Tasks Page header area */}
      <View className="absolute top-0 left-0 right-0 h-[280px] bg-primary/5" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* PREMIUM STATS HEADER SECTION */}
        <AnimatedReveal variant="slide-down" delay={50} duration={400}>
          <View className="px-6 pt-14 pb-6 relative overflow-hidden">
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full" />
            <View className="flex-row justify-between items-start z-10">
              <View className="flex-1">
                <Text className="text-[34px] font-extrabold tracking-tight text-foreground">
                  Stats
                </Text>
                <Text className="text-muted-foreground text-sm font-medium mt-1 leading-5">
                  Analyze your productivity metrics, task completion velocities, and milestones.
                </Text>
              </View>
            </View>
          </View>
        </AnimatedReveal>

        {/* CURVED WORKSPACE LIST BODY CONTAINER */}
        <View className="px-5 py-7 rounded-t-[42px] bg-background -mt-2 flex-1 min-h-[600px] border-t border-border/10">
          <AnimatedReveal variant="slide-up" delay={250} duration={500}>
            <View className="items-center justify-center py-10 px-4">
              {/* Clean, Large Floating Illustration */}
              <View className="items-center justify-center mb-6">
                <EmptyStateIllustration />
              </View>

              {/* Premium Typography */}
              <Text className="text-[22px] font-black text-foreground text-center tracking-tight leading-7 mt-1 px-4">
                Stats Dashboard is Coming Soon
              </Text>
              <Text className="text-muted-foreground text-[14px] font-medium text-center max-w-[300px] mt-3.5 leading-5 px-2">
                We are crafting an elegant interactive dashboard to visualize your progress, analyze task completion velocities, and celebrate your daily productivity peaks.
              </Text>

              {/* Action Button */}
              <Pressable
                onPress={handleNotifyMe}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.95 : 1 }] }
                ]}
                className="mt-8 px-6 py-3 bg-secondary/50 dark:bg-secondary/10 border border-border/40 rounded-full flex-row items-center gap-2"
              >
                <Bell size={14} color={theme.foreground} />
                <Text className="text-xs font-extrabold text-foreground tracking-wide uppercase">
                  Notify me when live
                </Text>
              </Pressable>
            </View>
          </AnimatedReveal>
          <View className="h-24" />
        </View>
      </ScrollView>
    </View>
  );
}
