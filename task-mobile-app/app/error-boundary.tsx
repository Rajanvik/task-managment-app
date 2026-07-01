import React from "react";
import { View, ScrollView, Alert } from "react-native";
import { AlertOctagon, RefreshCw } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { type ErrorBoundaryProps } from "expo-router";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  React.useEffect(() => {
    console.error("GlobalErrorBoundary caught rendering error:", error);
    Alert.alert(
      "Application Error",
      `A rendering error occurred inside the workspace. Please tap Try Again to reload state.\n\nMessage: ${error.message}`,
      [{ text: "Dismiss" }]
    );
  }, [error]);

  return (
    <View className="flex-1 bg-background justify-center p-6 gap-6">
      {/* Top subtle visual accent */}
      <View className="absolute top-0 left-0 right-0 h-[300px] bg-destructive/5 rounded-b-[48px]" />

      <View className="items-center gap-3.5 z-10 mt-10">
        {/* Warning Icon with red glowing backdrop */}
        <View className="h-16 w-16 bg-destructive/10 border border-destructive/20 rounded-full items-center justify-center shadow-lg shadow-destructive/15">
          <Icon as={AlertOctagon} className="text-destructive" size={32} />
        </View>

        <Text className="text-2xl font-black text-foreground text-center tracking-tight leading-7 mt-2">
          System Render Error
        </Text>
        
        <Text className="text-muted-foreground text-sm font-medium text-center max-w-[280px] -mt-1 leading-5">
          Something went wrong while rendering this screen. You can view the crash logs below or try reloading the screen.
        </Text>
      </View>

      {/* Crash Details Box */}
      <View className="bg-card border border-border/40 rounded-[28px] p-5 shadow-sm shadow-black/5 z-10 flex-1 max-h-[320px]">
        <Text className="text-xs font-bold text-destructive uppercase tracking-widest mb-3.5">
          Error Details: {error?.name || "Exception"}
        </Text>
        
        <Text className="text-foreground text-sm font-extrabold mb-3 leading-snug">
          {error?.message}
        </Text>

        <ScrollView showsVerticalScrollIndicator={true} className="bg-secondary/40 border border-border/10 rounded-xl p-3.5 mt-1 flex-1">
          <Text className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
            {error?.stack || "No stack trace available."}
          </Text>
        </ScrollView>
      </View>

      {/* Reset / Recover Button */}
      <View className="z-10 pb-10">
        <Button
          onPress={retry}
          className="h-14 bg-primary rounded-2xl flex-row gap-2.5 shadow-xl shadow-primary/20 items-center justify-center"
        >
          <Icon as={RefreshCw} className="text-primary-foreground" size={18} />
          <Text className="font-bold text-base text-primary-foreground">
            Try Again
          </Text>
        </Button>
      </View>
    </View>
  );
}
