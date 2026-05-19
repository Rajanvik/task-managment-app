import React, { useEffect, useState } from 'react';
import {
  View,
  Modal,
  Pressable,
  Dimensions,
  ScrollView,
  Keyboard,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
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

  // Reanimated shared values for opening/closing transitions
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  // Self-correcting layout measurements
  const [visibleHeight, setVisibleHeight] = useState(SCREEN_HEIGHT);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Listen to keyboard state
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Handle open/close sheet animations
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 90, mass: 1 });
    } else {
      Keyboard.dismiss();
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, () => {
        runOnJS(onClose)();
      });
    }
  }, [visible]);

  // Backdrop animation style
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Sheet animation style (slide up/down)
  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible && translateY.value === SCREEN_HEIGHT) return null;

  // Determine if the OS automatically resized the screen (like Android adjustResize)
  // If the visibleHeight is significantly less than SCREEN_HEIGHT, the OS did the resizing.
  const osDidResize = visibleHeight < SCREEN_HEIGHT - 80;

  // Manual offset is only needed if the OS did NOT resize (iOS or non-resizing Android setup)
  const manualOffset = osDidResize ? 0 : keyboardHeight;

  // Calculate the remaining height perfectly based on current screen size & active keyboard
  const remainingHeight = visibleHeight - manualOffset - insets.top - 16;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={StyleSheet.absoluteFill}
        onLayout={(e) => {
          setVisibleHeight(e.nativeEvent.layout.height);
        }}
      >
        {/* ── Backdrop ── */}
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
            onPress={onClose}
          />
        </Animated.View>

        {/* ── Bottom Sheet Wrapper ── */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: manualOffset, // Dynamic self-correcting offset to prevent double-pushing
          }}
        >
          <Animated.View
            style={[
              {
                backgroundColor: theme.card,
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
                // Expand to fill remaining screen height when keyboard is open
                height: keyboardHeight > 0 ? remainingHeight : undefined,
                maxHeight: keyboardHeight > 0 ? remainingHeight : SCREEN_HEIGHT * 0.85,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 24,
                overflow: 'hidden',
              },
              animatedSheetStyle,
            ]}
          >
            {/* Drag Handle indicator */}
            <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 4 }}>
              <View
                style={{
                  width: 64,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(128,128,128,0.2)',
                }}
              />
            </View>

            {/* Scrollable Container */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 8,
                paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 28,
              }}
            >
              {(title || description) && (
                <View style={{ marginBottom: 16 }}>
                  {title && (
                    <Text className="text-2xl font-extrabold text-foreground pb-0.5">
                      {title}
                    </Text>
                  )}
                  {description && (
                    <Text className="text-sm text-muted-foreground">{description}</Text>
                  )}
                </View>
              )}
              {children}
            </ScrollView>
          </Animated.View>
        </View>

        <PortalHost name="bottom-sheet" />
      </View>
    </Modal>
  );
}
