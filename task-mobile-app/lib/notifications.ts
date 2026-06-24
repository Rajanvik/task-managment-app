import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { toast } from "./toast";

// Configure foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for notifications and request permissions.
 * Configures the Android channel for standard and high-importance reminders.
 */
export async function registerForNotificationsAsync() {
  if (Platform.OS === "web") {
    return false;
  }

  // Device check (only physical/emulated devices support this fully)
  if (!Device.isDevice && Platform.OS !== "ios" && Platform.OS !== "android") {
    console.log("Must use a physical device or emulator for notifications");
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      toast.error("Permission Denied", {
        description: "Please enable notifications in your device settings.",
      });
      return false;
    }

    // Android channel configuration
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("pending-reminders", {
        name: "Pending Task Reminders",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0284c7",
        description: "Alerts for pending task reminders",
      });
    }

    return true;
  } catch (error: any) {
    console.error("Error setting up notifications:", error);
    toast.error("Registration Failed", {
      description: error?.message || "Failed to register notifications setup.",
    });
    return false;
  }
}

/**
 * Sends an immediate local notification (after a 2-second delay) for testing pending tasks.
 */
export async function triggerImmediateReminder(pendingCount: number, taskTitles: string[]) {
  const hasPermission = await registerForNotificationsAsync();
  if (!hasPermission) return;

  if (pendingCount === 0) {
    toast.info("All Caught Up! 🎉", {
      description: "You have no pending tasks to remind you of.",
    });
    return;
  }

  const titleSample = taskTitles.slice(0, 2).join(", ");
  const remaining = taskTitles.length > 2 ? ` and ${taskTitles.length - 2} more` : "";
  const body = `You have ${pendingCount} pending task${pendingCount > 1 ? "s" : ""}! 📝 Don't forget to complete: "${titleSample}"${remaining}.`;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Pending Tasks Reminder! ⚠️",
        body: body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        channelId: "pending-reminders",
      } as any,
    });

    toast.success("Reminder Scheduled!", {
      description: "Notification will appear in 2 seconds.",
    });
  } catch (error: any) {
    console.error("Failed to trigger immediate notification:", error);
    toast.error("Reminder Failed", {
      description: error?.message || "Failed to send notification reminder. Please check permission settings.",
    });
  }
}

/**
 * Schedules a daily repeating reminder at a specific time.
 */
export async function scheduleDailyPendingReminder(
  hour: number,
  minute: number,
  pendingCount: number,
  taskTitles: string[]
) {
  const hasPermission = await registerForNotificationsAsync();
  if (!hasPermission) return null;

  try {
    // Cancel any existing daily reminders to avoid duplicates
    await cancelAllReminders();

    const dailyTrigger = Platform.OS === 'android' ? {
      type: 'daily',
      hour,
      minute,
      channelId: "pending-reminders",
    } : {
      type: 'calendar',
      hour,
      minute,
      repeats: true,
      channelId: "pending-reminders",
    };

    if (pendingCount === 0) {
      // Still schedule the reminder even if count is 0, just in case they add tasks later
      // But the message will be general
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Daily Productivity Check! 🌟",
          body: "Open your workspace to plan and complete your tasks for today.",
          sound: true,
        },
        trigger: dailyTrigger as any,
      });
      return true;
    }

    const titleSample = taskTitles.slice(0, 2).join(", ");
    const remaining = taskTitles.length > 2 ? ` and ${taskTitles.length - 2} more` : "";
    const body = `You have ${pendingCount} task${pendingCount > 1 ? "s" : ""} waiting: "${titleSample}"${remaining}. Let's get things done today!`;

    const reminderId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your Pending Tasks Await! 📝",
        body: body,
        sound: true,
      },
      trigger: dailyTrigger as any,
    });

    return reminderId;
  } catch (error: any) {
    console.error("Failed to schedule daily notification:", error);
    toast.error("Scheduling Failed", {
      description: error?.message || "Failed to schedule daily notification.",
    });
    return null;
  }
}

/**
 * Cancels all scheduled notifications.
 */
export async function cancelAllReminders() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Failed to cancel notifications:", error);
  }
}
