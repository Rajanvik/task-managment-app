import React, { useEffect } from 'react';
import { View, Modal, Pressable, Dimensions, ScrollView } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  runOnJS
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { THEME } from '@/lib/theme';
import { PortalHost } from '@rn-primitives/portal';
import { Text } from '@/components/ui/text';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function BottomSheet({ visible, onClose, title, description, children }: BottomSheetProps) {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme];
  const insets = useSafeAreaInsets();
  
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { 
        damping: 20,
        stiffness: 90,
        mass: 1
      });
    } else {
      opacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
        runOnJS(onClose)();
      });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible && translateY.value === SCREEN_HEIGHT) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View 
          style={backdropStyle}
          className="absolute inset-0 bg-black/60"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>
        
        <Animated.View 
          className="bg-card border-t border-border/10 rounded-t-[40px] shadow-2xl overflow-hidden"
          style={[{ maxHeight: SCREEN_HEIGHT * 0.9 }, animatedStyle]}
        >
          {/* Handle bar */}
          <View className="items-center w-full pt-4 pb-1">
            <View className="w-16 h-1.5 bg-muted-foreground/20 rounded-full" />
          </View>
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingHorizontal: 24, // Optimized standard Shadcn padding (px-6 equivalent)
              paddingTop: 8,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 12 // Perfectly flush with safe margins!
            }}
          >
            {(title || description) && (
              <View className="mb-4">
                {title && <Text className="text-2xl font-extrabold text-foreground pb-0.5">{title}</Text>}
                {description && <Text className="text-sm text-muted-foreground">{description}</Text>}
              </View>
            )}
            {children}
          </ScrollView>
        </Animated.View>
        <PortalHost name="bottom-sheet" />
      </View>
    </Modal>
  );
}
