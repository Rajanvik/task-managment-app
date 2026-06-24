import React from 'react';
import Animated, { 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing, 
  useAnimatedStyle 
} from 'react-native-reanimated';
import { NoTasksIllustration } from "@/components/illustrations";

interface IEmptyStateIllustrationProps {}

export const EmptyStateIllustration: React.FC<IEmptyStateIllustrationProps> = () => {
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
      <NoTasksIllustration width={260} height={200} />
    </Animated.View>
  );
};
