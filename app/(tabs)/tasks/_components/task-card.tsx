import {
  Calendar,
  CheckCircle2,
  Circle,
  ListTodo,
  MoreVertical,
} from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/use-theme";
import { parseLocalDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { type Task } from "@/lib/types/tasks";

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onOptionsPress: () => void;
  disabled?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onOptionsPress,
  disabled,
}) => {
  const { theme } = useTheme();

  const isCompleted = task.status === "Completed";

  // Calculate dynamic subtask steps progress
  const hasSteps = task.steps && task.steps.length > 0;
  const completedSteps = hasSteps
    ? task.steps!.filter((s) => s.completed).length
    : 0;
  const totalSteps = hasSteps ? task.steps!.length : 0;

  return (
    <View className="mb-3">
      {/* 
        REMOVED outer card-click navigation handler as requested! 
        Clicking the card itself now remains static and doesn't take the user to details.
      */}
      <Card className="bg-card border border-border/40 rounded-3xl px-3.5 pt-3.5 pb-2.5 shadow-sm shadow-black/5">
        {/* Top Main Section with Tightened Row Spacing */}
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-start flex-1 gap-2.5">
            {/* Task Completion Checkbox (Instant local tick feedback) */}
            <Pressable
              onPress={onToggle}
              disabled={disabled}
              className={`p-0.5 mt-0.5 ${disabled ? "opacity-50" : ""}`}
            >
              {isCompleted ? (
                <CheckCircle2 size={21} color={theme.primary} />
              ) : (
                <Circle size={21} color="gray" />
              )}
            </Pressable>

            {/* Title & Notes Preview */}
            <View className="flex-1">
              <Text
                className={cn(
                  "text-[17px] font-extrabold leading-tight",
                  isCompleted
                    ? "text-muted-foreground line-through opacity-60"
                    : "text-foreground",
                )}
              >
                {task.title}
              </Text>

              {task.description ? (
                <Text
                  numberOfLines={1}
                  className={cn(
                    "text-xs mt-0.5",
                    isCompleted
                      ? "text-muted-foreground/60"
                      : "text-muted-foreground",
                  )}
                >
                  {task.description}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Compact Options Trigger */}
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="h-8 w-8 rounded-full -mr-1.5 -mt-1 active:bg-secondary/30"
            onPress={onOptionsPress}
          >
            <MoreVertical size={18} color="gray" />
          </Button>
        </View>

        {/* 
          Bottom Metadata Section - ULTIMATE FLUSH SPACING:
          Applied marginTop: -14 and reduced padding to achieve the absolute tightest layout possible.
          This pulls the divider and pills cleanly and snugly immediately under the text baseline!
        */}
        <View
          className="flex-row flex-wrap gap-1.5 border-t border-border/10"
          style={{ marginTop: -14, paddingTop: 8 }}
        >
          {/* 1. Priority Indicator Pill */}
          {task.category === "Urgent" && (
            <View className="bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-lg">
              <Text className="text-[11px] font-extrabold text-destructive">
                Urgent
              </Text>
            </View>
          )}
          {task.category === "Work" && (
            <View className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">
              <Text className="text-[11px] font-extrabold text-primary">
                Work
              </Text>
            </View>
          )}
          {task.category === "Personal" && (
            <View className="bg-secondary/30 border border-border/40 px-2 py-0.5 rounded-lg">
              <Text className="text-[11px] font-extrabold text-foreground">
                Personal
              </Text>
            </View>
          )}

          {/* 2. Due Date Pill */}
          <View className="bg-secondary/25 border border-border/30 px-2 py-0.5 rounded-lg flex-row items-center gap-1">
            <Calendar size={11} color="gray" />
            <Text className="text-[11px] text-muted-foreground font-bold">
              {task.dueDate
                ? parseLocalDate(task.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Flexible"}
            </Text>
          </View>

          {/* 3. Steps Checklist Progress Pill */}
          {hasSteps && (
            <View className="bg-primary/[0.04] border border-primary/15 px-2 py-0.5 rounded-lg flex-row items-center gap-1">
              <ListTodo size={11} color={theme.primary} />
              <Text className="text-[11px] text-primary/70 font-bold">
                {completedSteps}/{totalSteps} Steps
              </Text>
            </View>
          )}
        </View>
      </Card>
    </View>
  );
};
