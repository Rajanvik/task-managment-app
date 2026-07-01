import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthDataHook } from '@/lib/data-hooks/auth';
import { Skeleton } from '@/components/ui/skeleton';

interface IProfileHeaderProps {}

export const ProfileHeader: React.FC<IProfileHeaderProps> = () => {
  const { data: user, isLoading } = AuthDataHook.useProfile();

  const getInitials = (name: string | null, email?: string) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (isLoading) {
    return (
      <View className="pt-12 pb-14 px-6 relative overflow-hidden items-center">
        <View className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full" />
        
        {/* Avatar Skeleton */}
        <Skeleton className="h-28 w-28 rounded-full border-4 border-background shadow-2xl z-10" />
        
        {/* Name Skeleton */}
        <Skeleton className="mt-4 h-8 w-48 rounded-lg z-10" />
        
        {/* Email Skeleton */}
        <Skeleton className="mt-2 h-5 w-60 rounded-lg z-10" />
        
        <Skeleton className="mt-4 h-9 w-28 rounded-full z-10" />
      </View>
    );
  }

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || '';

  return (
    <View className="pt-12 pb-14 px-6 relative overflow-hidden items-center">
      <View className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full" />
      
      <Avatar alt="User profile" className="h-28 w-28 border-4 border-background rounded-full shadow-2xl z-10">
        <AvatarImage source={require('@/assets/images/rajan.png')} />
        <AvatarFallback>
          <Text className="text-xl font-black text-muted-foreground uppercase">
            {getInitials(user?.name || null, user?.email)}
          </Text>
        </AvatarFallback>
      </Avatar>
      <Text className="mt-4 text-3xl font-extrabold tracking-tight text-foreground z-10">
        {displayName}
      </Text>
      <Text className="text-muted-foreground font-medium z-10">
        {displayEmail}
      </Text>
      
      <Button variant="outline" size="sm" className="mt-4 rounded-full h-9 px-6 bg-background/50 border-border/40 z-10">
        <Text className="text-xs font-bold">Edit Profile</Text>
      </Button>
    </View>
  );
};
