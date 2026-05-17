import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function HomeHeader() {
  return (
    <View className="pt-14 pb-12 px-6 relative overflow-hidden">
      <View className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full" />

      <View className="flex-row justify-between items-center z-10">
        <View>
          <Text className="text-3xl font-extrabold tracking-tight text-foreground">
            Hello, Rajan Kumar!
          </Text>
          <Text className="text-muted-foreground mt-0.5">
            Welcome back.
          </Text>
        </View>
        <Avatar
          alt="User profile"
          className="h-12 w-12 border-2 border-background shadow-lg"
        >
          <AvatarImage source={require('@/assets/images/rajan.png')} />
          <AvatarFallback>RK</AvatarFallback>
        </Avatar>
      </View>
    </View>
  );
}
