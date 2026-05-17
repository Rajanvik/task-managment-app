import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export function FooterCredit() {
  return (
    <View className="items-center pb-8">
      <Text className="text-muted-foreground text-sm font-medium">
        Task Management App
      </Text>
      <Text className="text-muted-foreground/60 text-xs mt-1">
        Made by Rajan Kumar
      </Text>
    </View>
  );
}
