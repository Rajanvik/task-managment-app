import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, Settings } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { THEME } from '@/lib/theme';

export function AccountCard() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme];

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
        <Button variant="destructiveGhost" className="justify-start gap-3 px-3 h-12 rounded-2xl">
          <LogOut size={18} color={theme.destructive} />
          <Text className="text-sm font-semibold">Sign Out</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
