import React from 'react';
import { View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Bell, Moon, Sun, User } from 'lucide-react-native';
import { registerForNotificationsAsync, cancelAllReminders } from '@/lib/notifications';
import { toast } from '@/lib/toast';

interface IPreferencesCardProps {}

export const PreferencesCard: React.FC<IPreferencesCardProps> = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [profileVisibility, setProfileVisibility] = React.useState(true);
  const { colorScheme, setColorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const toggleTheme = (value: boolean) => {
    setColorScheme(value ? 'dark' : 'light');
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotifications(value);
    if (value) {
      const granted = await registerForNotificationsAsync();
      if (granted) {
        toast.success("Notifications Enabled", {
          description: "You'll now receive alerts for task reminders.",
        });
      } else {
        setNotifications(false);
      }
    } else {
      await cancelAllReminders();
      toast.info("Notifications Disabled", {
        description: "Task reminders have been muted.",
      });
    }
  };

  return (
    <Card className="border-none bg-card shadow-sm shadow-black/5 rounded-[32px]">
      <CardHeader className="py-3 px-5">
        <CardTitle className="text-base font-bold">Preferences</CardTitle>
      </CardHeader>
      <CardContent className="gap-3 px-5 pb-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            {isDark ? <Moon size={18} color="gray" /> : <Sun size={18} color="gray" />}
            <Label nativeID="dark-mode" className="text-sm">Dark Mode</Label>
          </View>
          <Switch checked={isDark} onCheckedChange={toggleTheme} />
        </View>
        <Separator className="opacity-50" />
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <Bell size={18} color="gray" />
            <Label nativeID="notifications" className="text-sm">Push Notifications</Label>
          </View>
          <Switch checked={notifications} onCheckedChange={handleNotificationToggle} />
        </View>
        <Separator className="opacity-50" />
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <User size={18} color="gray" />
            <Label nativeID="visibility" className="text-sm">Profile Visibility</Label>
          </View>
          <Switch checked={profileVisibility} onCheckedChange={setProfileVisibility} />
        </View>
      </CardContent>
    </Card>
  );
}
