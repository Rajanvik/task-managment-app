import { useRouter } from "expo-router";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/use-theme";
import { AuthDataHook } from "@/lib/data-hooks/auth";
import { LogOut, Settings } from "lucide-react-native";

interface IAccountCardProps {}

export const AccountCard: React.FC<IAccountCardProps> = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { mutateAsync: logoutUser, isPending: isLoggingOut } =
    AuthDataHook.useLogout();

  const handleSignOut = async () => {
    try {
      await logoutUser();
      router.replace("/login");
    } catch (e) {
      console.error("Sign out failed", e);
    }
  };

  return (
    <Card className="border-none bg-card shadow-sm shadow-black/5 rounded-[32px]">
      <CardHeader className="py-3 px-5">
        <CardTitle className="text-base font-bold">Account</CardTitle>
      </CardHeader>
      <CardContent className="gap-1 px-2 pb-4">
        <Button
          variant="ghost"
          disabled={isLoggingOut}
          className="justify-start gap-3 px-3 h-12 rounded-2xl"
        >
          <Settings size={18} color="gray" />
          <Text className="text-sm">Account Settings</Text>
        </Button>
        <Separator className="opacity-50 mx-3" />
        <Button
          variant="destructiveGhost"
          onPress={handleSignOut}
          disabled={isLoggingOut}
          className="justify-start gap-3 px-3 h-12 rounded-2xl"
        >
          <LogOut size={18} color={theme.destructive} />
          <Text className="text-sm font-semibold">Sign Out</Text>
        </Button>
      </CardContent>
    </Card>
  );
};
