import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RealTimeClock } from './real-time-clock';
import { AuthDataHook } from '@/lib/data-hooks/auth';
import { Skeleton } from '@/components/ui/skeleton';

interface IHomeHeaderProps {}

export const HomeHeader: React.FC<IHomeHeaderProps> = () => {
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

  const displayName = user?.name || 'User';

  return (
    <View className="pt-14 pb-12 px-6 relative overflow-hidden">
      <View className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full" />

      {/* Greeting and Profile Row */}
      <View className="flex-row justify-between items-center z-10">
        <View className="flex-1 mr-4">
          {isLoading ? (
            <Skeleton className="h-9 w-40 rounded-md" />
          ) : (
            <Text className="text-3xl font-extrabold tracking-tight text-foreground" numberOfLines={1}>
              Hello, {displayName}!
            </Text>
          )}
          <Text className="text-muted-foreground mt-0.5">
            Welcome back.
          </Text>
        </View>
        {isLoading ? (
          <Skeleton className="h-12 w-12 rounded-full border-2 border-background shadow-lg" />
        ) : (
          <Avatar
            alt="User profile"
            className="h-12 w-12 border-2 border-background shadow-lg"
          >
            <AvatarImage source={require('@/assets/images/rajan.png')} />
            <AvatarFallback>
              <Text className="text-xs font-black text-muted-foreground uppercase">
                {getInitials(user?.name || null, user?.email)}
              </Text>
            </AvatarFallback>
          </Avatar>
        )}
      </View>

      {/* Real-time Clock Component */}
      <View className="z-10">
        <RealTimeClock />
      </View>
    </View>
  );
};

