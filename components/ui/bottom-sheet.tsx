import React, { useEffect } from 'react';
import {
  View,
  Modal,
  Pressable,
  Dimensions,
  ScrollView,
  Keyboard,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
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

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        {/* ── Backdrop ── */}
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
            onPress={onClose}
          />
        </Animated.View>

        {/* ── Bottom Sheet Wrapper with KeyboardAvoidingView ── */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
          <Animated.View
            style={[
              {
                backgroundColor: theme.card,
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
                maxHeight: '85%',
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
        </KeyboardAvoidingView>

        <PortalHost name="bottom-sheet" />
      </View>
    </Modal>
  );
}
