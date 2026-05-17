import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ProfileHeader() {
  return (
    <View className="pt-12 pb-14 px-6 relative overflow-hidden items-center">
      <View className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full" />
      
      <Avatar alt="User profile" className="h-28 w-28 border-4 border-background rounded-full shadow-2xl z-10">
        <AvatarImage source={require('@/assets/images/rajan.png')} />
        <AvatarFallback>
          <Text className="text-sm font-black text-muted-foreground uppercase">RK</Text>
        </AvatarFallback>
      </Avatar>
      <Text className="mt-4 text-3xl font-extrabold tracking-tight text-foreground z-10">Rajan Kumar</Text>
      <Text className="text-muted-foreground font-medium z-10">rajankumar15052002@gmail.com</Text>
      
      <Button variant="outline" size="sm" className="mt-4 rounded-full h-9 px-6 bg-background/50 border-border/40 z-10">
        <Text className="text-xs font-bold">Edit Profile</Text>
      </Button>
    </View>
  );
}
