import * as Haptics from "expo-haptics";
import {
  Bell,
  Clock,
  CheckCircle2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { useTasks } from "@/context/TaskContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  cancelAllReminders,
  registerForNotificationsAsync,
  scheduleDailyPendingReminder,
  triggerImmediateReminder,
} from "@/lib/notifications";
import { THEME } from "@/lib/theme";
import type { Task } from "@/app/(tabs)/tasks/data/task-data";
import { toast } from "@/lib/toast";

export function ReminderCard() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme];
  const { tasks } = useTasks();

  const [isDailyEnabled, setIsDailyEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const pendingTasks = tasks.filter((t: Task) => t.status === "Pending");
  const pendingCount = pendingTasks.length;
  const pendingTitles = pendingTasks.map((t: Task) => t.title);

  // Initialize permissions check
  useEffect(() => {
    // We can check if permission is already granted, but we don't block
  }, []);

  const handleTestReminder = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    if (pendingCount === 0) {
      toast.info("No Pending Tasks", {
        description: "Great job! You don't have any pending tasks right now.",
      });
      setLoading(false);
      return;
    }

    await triggerImmediateReminder(pendingCount, pendingTitles);
    setLoading(false);
  };

  const handleDailyToggle = async (checked: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsDailyEnabled(checked);

    if (checked) {
      const hasPermission = await registerForNotificationsAsync();
      if (!hasPermission) {
        setIsDailyEnabled(false);
        return;
      }

      const scheduled = await scheduleDailyPendingReminder(
        9, // 9:00 AM
        0,
        pendingCount,
        pendingTitles,
      );

      if (scheduled) {
        toast.success("Daily Reminder On", {
          description: "Scheduled daily at 09:00 AM for pending tasks.",
        });
      } else {
        setIsDailyEnabled(false);
        toast.error("Failed to schedule", {
          description: "An error occurred while scheduling reminders.",
        });
      }
    } else {
      await cancelAllReminders();
      toast.info("Daily Reminder Off", {
        description: "Scheduled task reminders have been disabled.",
      });
    }
  };

  return (
    <Card className="mb-3 bg-card border border-border/10 shadow-xl rounded-3xl overflow-hidden">
      {/* Decorative Gradient Background Accents */}
      <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-8 -mt-8" />
      <View className="absolute -bottom-10 -left-10 w-24 h-24 bg-sky-500/5 rounded-full" />

      <View className="p-6">
        {/* Header Section */}
        <View className="flex-row items-center gap-3 mb-4">
          <View className="h-10 w-10 bg-primary/10 rounded-2xl items-center justify-center">
            <Bell size={21} color={theme.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">
              Pending Task Reminders
            </Text>
            <Text className="text-[10px] -mt-0.5 font-bold text-primary uppercase tracking-widest">
              Smart Assistant
            </Text>
          </View>
        </View>

        {/* Status / Pending Summary */}
        <View className="bg-secondary/40 border border-border/10 rounded-2xl p-4 mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1 mr-3">
            <View
              className={`h-2.5 w-2.5 rounded-full shrink-0 ${pendingCount > 0 ? "bg-amber-500 animate-pulse" : "bg-green-500"}`}
            />
            <View className="flex-1">
              <Text className="text-xs font-semibold text-foreground">
                {pendingCount > 0
                  ? `${pendingCount} Pending Task${pendingCount > 1 ? "s" : ""} Left`
                  : "All Tasks Completed!"}
              </Text>
              <Text className="text-[10px] text-muted-foreground mt-0.5 leading-4">
                {pendingCount > 0
                  ? "Click remind below to test system alerts."
                  : "Enjoy the feeling of a clear list!"}
              </Text>
            </View>
          </View>

          {pendingCount > 0 ? (
            <Pressable
              onPress={handleTestReminder}
              disabled={loading}
              className="px-4 py-2 bg-primary rounded-xl items-center justify-center active:scale-95 shadow-sm shadow-primary/20"
            >
              <Text className="text-[11px] font-extrabold text-primary-foreground">
                {loading ? "Sending..." : "Remind Me"}
              </Text>
            </Pressable>
          ) : (
            <View className="h-8 w-8 bg-green-500/10 rounded-full items-center justify-center">
              <CheckCircle2 size={16} color="green" />
            </View>
          )}
        </View>

        {/* Daily Schedule Toggle Option */}
        <View className="flex-row items-center justify-between border-t border-border/10 pt-4">
          <View className="flex-row items-center gap-3 flex-1 pr-4">
            <View className="h-8 w-8 bg-secondary/50 rounded-xl items-center justify-center">
              <Clock size={16} color="gray" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-foreground">
                Daily Reminder
              </Text>
              <Text className="text-[10px] text-muted-foreground mt-0.5">
                Check daily at 9:00 AM for pending items.
              </Text>
            </View>
          </View>

          <Switch
            checked={isDailyEnabled}
            onCheckedChange={handleDailyToggle}
          />
        </View>
      </View>
    </Card>
  );
}
