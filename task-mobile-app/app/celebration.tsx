import React, { useEffect, useState } from "react";
import { View, Dimensions, StyleSheet, BackHandler } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  withRepeat,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { Check } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { PlanIllustration, AchieveIllustration } from "@/components/illustrations";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Confetti configurations
const CONFETTI_COLORS = [
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Violet
  "#FF2E93", // Bright rose
  "#00D2FF", // Light blue
  "#FF6B00", // Neon orange
];

const SHAPES = ["circle", "square", "triangle", "rectangle"];
const PARTICLE_COUNT = 60; // Denser, more luxurious, and highly optimized!

// PERFORMANCE MIRACLE: Pre-calculate ALL randomized variables outside the component render cycle!
// This eliminates runtime Math.random overhead during the critical mount phase entirely.
const PRE_CALCULATED_PARTICLES = Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const shape = SHAPES[index % SHAPES.length];
  const size = Math.floor(Math.random() * 8) + 6; // size: 6 to 14
  
  // Dual launch popper coordinates (left and right bottom corners)
  const isLeftCannon = index % 2 === 0;
  const startX = isLeftCannon ? 15 : SCREEN_WIDTH - 15;
  const startY = SCREEN_HEIGHT - 40;
  
  // Physics-based path parameters (explosion arch)
  const endXOffset = isLeftCannon
    ? Math.random() * (SCREEN_WIDTH * 0.7) + (SCREEN_WIDTH * 0.15) // left shoots to the right
    : -(Math.random() * (SCREEN_WIDTH * 0.7) + (SCREEN_WIDTH * 0.15)); // right shoots to the left
    
  const heightY = Math.random() * (SCREEN_HEIGHT * 0.75) + (SCREEN_HEIGHT * 0.35); // how high it shoots
  const gravityDrop = Math.random() * 120 + 80; // natural arch gravity drop at peak
  const drift = Math.random() * 40 - 20; // soft air wobble
  const wavePhase = Math.random() * Math.PI * 2;
  
  // Multi-axis 3D rotation values for premium shimmer & paper flutter
  const startRotationX = Math.random() * 360;
  const startRotationY = Math.random() * 360;
  const startRotationZ = Math.random() * 360;
  const rotXSpeed = Math.random() * 1080 + 360;
  const rotYSpeed = Math.random() * 1080 + 360;
  const rotZSpeed = Math.random() * 720 + 360;

  const duration = Math.floor(Math.random() * 800) + 1800; // 1.8s to 2.6s flight duration
  const delay = Math.floor(Math.random() * 350); // staggered launch

  return {
    color,
    shape,
    size,
    startX,
    startY,
    endXOffset,
    heightY,
    gravityDrop,
    drift,
    wavePhase,
    startRotationX,
    startRotationY,
    startRotationZ,
    rotXSpeed,
    rotYSpeed,
    rotZSpeed,
    duration,
    delay,
  };
});

// React.memo protects the static particles from any unnecessary virtual-DOM reconciliation re-renders
const ConfettiParticle = React.memo(({ config }: { config: typeof PRE_CALCULATED_PARTICLES[0] }) => {
  // Ultra-performant exactly 1 shared value instead of 5
  const progress = useSharedValue(0);

  useEffect(() => {
    // Launch the 3D confetti blast on the native UI thread
    progress.value = withDelay(
      config.delay,
      withTiming(1, {
        duration: config.duration,
        easing: Easing.out(Easing.cubic), // natural explosion burst slowing down at peak
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;

    // Premium parabolic path: rises fast, slows down, curves down due to gravity
    const ty = config.startY - p * config.heightY + (p * p) * config.gravityDrop;
    const tx = config.startX + p * config.endXOffset + Math.sin(p * Math.PI * 2 + config.wavePhase) * config.drift;
    
    // Shimmering 3D flutter rotations
    const rotX = config.startRotationX + p * config.rotXSpeed;
    const rotY = config.startRotationY + p * config.rotYSpeed;
    const rotZ = config.startRotationZ + p * config.rotZSpeed;
    
    // Smooth zoom pop in first 10% progress
    const sc = p < 0.1 ? p / 0.1 : 1;
    
    // Elegant soft fade-out in last 15% progress
    const op = p > 0.85 ? Math.max(0, (1 - p) / 0.15) : 1;

    return {
      transform: [
        { translateX: tx },
        { translateY: ty },
        { rotateX: `${rotX}deg` },
        { rotateY: `${rotY}deg` },
        { rotateZ: `${rotZ}deg` },
        { scale: sc },
      ],
      opacity: op,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          width: config.size,
          height: config.shape === "rectangle" ? config.size * 1.5 : config.size,
          backgroundColor: config.color,
          borderRadius: config.shape === "circle" ? config.size / 2 : config.shape === "triangle" ? 0 : 3,
        },
      ]}
    />
  );
});

export default function CelebrationScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [showConfetti, setShowConfetti] = useState(true);

  // Route params
  const { title = "Superb Progress!", description = "You are doing amazing. Keep conquering your checklists!", type = "complete" } =
    useLocalSearchParams<{ title: string; description: string; type: "add" | "complete" }>();

  // Title / Illustration Entry Animations
  const contentScale = useSharedValue(0.92);
  const contentOpacity = useSharedValue(0);

  // Floating Vertical Drift loop animation for the SVG Illustration
  const floatAnim = useSharedValue(0);

  useEffect(() => {
    // Android hardware back handler
    const backAction = () => {
      router.back();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    // Entry Animations (Mounts instantly in a single frame!)
    contentOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
    contentScale.value = withSpring(1, {
      damping: 20,
      stiffness: 110,
    });

    // Loop floating vertical drift animation
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Completely unmount/stop rendering confetti after 4 seconds (after they have all fallen and faded out)
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => {
      backHandler.remove();
      clearTimeout(timer);
    };
  }, []);

  const contentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: contentScale.value }],
      opacity: contentOpacity.value,
    };
  });

  const floatStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatAnim.value }],
    };
  });

  const isAdding = type === "add";

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      {/* 
        INSTANT PARTICLES MOUNT LAYER (0ms Mount Latency!)
        Pre-calculated variables + React.memo + Staggered delay timing
        ensures particles start falling instantly on UI thread without any JS timeouts!
      */}
      {showConfetti && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {PRE_CALCULATED_PARTICLES.map((config, i) => (
            <ConfettiParticle key={i} config={config} />
          ))}
        </View>
      )}

      {/* Soft background ambient radial glows */}
      <View
        className="absolute -top-36 -left-36 w-96 h-96 rounded-full blur-3xl opacity-[0.06] dark:opacity-[0.03] pointer-events-none"
        style={{ backgroundColor: theme.foreground }}
      />
      <View
        className="absolute -bottom-36 -right-36 w-96 h-96 rounded-full blur-3xl opacity-[0.04] dark:opacity-[0.02] pointer-events-none"
        style={{ backgroundColor: theme.foreground }}
      />

      {/* MAIN SCREEN CELEBRATION VIEW */}
      <Animated.View style={[styles.centerWrapper, contentStyle]} className="w-full px-4 items-center">
        
        {/* 1. TOP SHADCN CHECK (TICK) ICON */}
        <View className="mb-8 items-center justify-center">
          <View
            className="w-20 h-20 rounded-full items-center justify-center bg-primary border border-primary/10 shadow-lg"
            style={{
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Check 
              size={36} 
              color={theme.primaryForeground} 
              strokeWidth={4.5} 
            />
          </View>
        </View>

        {/* 2. FLOATING THEME ILLUSTRATION */}
        <Animated.View style={floatStyle} className="w-full items-center justify-center mt-8">
          {isAdding ? (
            <PlanIllustration width={320} height={245} />
          ) : (
            <AchieveIllustration width={320} height={245} />
          )}
        </Animated.View>

        {/* 3. PREMIUM TYPOGRAPHY SECTION */}
        <View className="items-center text-center px-0 w-full">
          <Text className="text-[32px] font-black text-foreground text-center tracking-tight leading-[40px]">
            {title}
          </Text>
          
          <Text className="text-[15px] font-semibold text-center text-muted-foreground mt-3.5 mb-9 leading-6 px-0">
            {description}
          </Text>
        </View>

        {/* CTA Dismiss Button */}
        <Button
          onPress={() => router.back()}
          className="bg-primary px-9 rounded-full active:scale-[0.98] shadow-md h-12 self-center justify-center items-center"
        >
          <Text className="text-sm font-black text-primary-foreground tracking-wider uppercase">
            {isAdding ? "Back to Workspace" : "Awesome, Done!"}
          </Text>
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerWrapper: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  particle: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 5,
  },
});
