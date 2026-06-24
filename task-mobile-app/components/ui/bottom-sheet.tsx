import { Text } from "@/components/ui/text";
import { PortalHost } from "@rn-primitives/portal";
import React, { useEffect, useState, useRef } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  // Reanimated shared values for opening/closing transitions
  const translateY = useSharedValue(screenHeight);
  const opacity = useSharedValue(0);

  // Local state and ref to control Modal mount and enable exit animations
  const [isOpen, setIsOpen] = useState(visible);
  const [visibleHeight, setVisibleHeight] = useState(screenHeight);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isMounted = useRef(false);

  // Sync translateY with screen height updates when sheet is closed
  useEffect(() => {
    if (!visible) {
      translateY.value = screenHeight;
    }
  }, [screenHeight, visible]);

  // Listen to keyboard state to calculate correct height adjustments
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

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

  // Handle open/close animations in sync with the parent visibility prop
  useEffect(() => {
    if (visible) {
      setIsOpen(true);
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 90, mass: 1 });
    } else if (isMounted.current) {
      Keyboard.dismiss();
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(screenHeight, { duration: 250 }, () => {
        runOnJS(setIsOpen)(false);
      });
    }
    isMounted.current = true;
  }, [visible, screenHeight]);

  // Backdrop fade animation style
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Sheet sliding animation style
  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!isOpen) return null;

  // Determine if the OS automatically resized the screen (like Android adjustResize)
  // If the visibleHeight is significantly less than screenHeight, the OS did the resizing.
  const osDidResize = visibleHeight < screenHeight - 80;

  // Manual offset is only needed if the OS did NOT resize (iOS or non-resizing Android setup)
  const manualOffset = osDidResize ? 0 : keyboardHeight;

  // Calculate the remaining height perfectly based on current screen size & active keyboard
  const remainingHeight = visibleHeight - manualOffset - insets.top - 16;

  return (
    <Modal
      transparent
      visible={isOpen}
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
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onPress={onClose}
          />
        </Animated.View>

        {/* ── Bottom Sheet Wrapper with KeyboardAvoidingView ── */}
        <View
          className="absolute left-0 right-0"
          style={{
            bottom: manualOffset, // Dynamic self-correcting offset to prevent double-pushing
          }}
        >
          <Animated.View
            className="rounded-t-[40px] overflow-hidden bg-card border-t border-border"
            style={[
              {
                // Expand to fill remaining screen height when keyboard is open
                height: keyboardHeight > 0 ? remainingHeight : undefined,
                maxHeight:
                  keyboardHeight > 0 ? remainingHeight : screenHeight * 0.85,

                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 24,
              },
              animatedSheetStyle,
            ]}
          >
            {/* Drag Handle indicator */}
            <View className="items-center pt-4 pb-1">
              <View className="w-16 h-1.5 rounded-full bg-muted" />
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
                <View className="mb-4">
                  {title && (
                    <Text className="text-2xl font-extrabold text-foreground pb-0.5">
                      {title}
                    </Text>
                  )}
                  {description && (
                    <Text className="text-sm text-muted-foreground">
                      {description}
                    </Text>
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
