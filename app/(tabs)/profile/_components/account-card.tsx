import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, Settings, RotateCcw } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { THEME } from '@/lib/theme';
import { toast } from '@/lib/toast';

export function AccountCard() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme];

  const handleResetOnboarding = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await AsyncStorage.removeItem('hasCompletedOnboarding_v2');
      toast.success("Onboarding Reset!", {
        description: "App will now show the onboarding slides on restart.",
      });
      // Redirect to onboarding index page immediately
      router.replace('/');
    } catch (e) {
      console.error("Failed to reset onboarding", e);
      toast.error("Reset Failed", {
        description: "An error occurred while resetting the onboarding flag.",
      });
    }
  };

  return (
    <Card className="border-none bg-card shadow-sm shadow-black/5 rounded-[32px]">
      <CardHeader className="py-3 px-5">
        <CardTitle className="text-base font-bold">Account</CardTitle>
      </CardHeader>
      <CardContent className="gap-1 px-2 pb-4">
        <Button variant="ghost" className="justify-start gap-3 px-3 h-12 rounded-2xl">
          <Settings size={18} color="gray" />
          <Text className="text-sm">Account Settings</Text>
        </Button>
        <Separator className="opacity-50 mx-3" />
        <Button 
          variant="ghost" 
          onPress={handleResetOnboarding}
          className="justify-start gap-3 px-3 h-12 rounded-2xl"
        >
          <RotateCcw size={18} color={theme.primary} />
          <Text className="text-sm">Reset Onboarding Steps</Text>
        </Button>
        <Separator className="opacity-50 mx-3" />
        <Button variant="destructiveGhost" className="justify-start gap-3 px-3 h-12 rounded-2xl">
          <LogOut size={18} color={theme.destructive} />
          <Text className="text-sm font-semibold">Sign Out</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
