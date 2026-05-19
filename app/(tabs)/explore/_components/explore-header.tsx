import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export function ExploreHeader() {
  return (
    <View className="pt-20 pb-20 px-6 relative overflow-hidden">
      <View className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full" />
      
      <View className="z-10">
        <Text className="text-3xl font-extrabold tracking-tight text-foreground">
          Explore
        </Text>
        <Text className="text-muted-foreground mt-0.5">
          Discover features to optimize your productivity.
        </Text>
      </View>
    </View>
  );
}
