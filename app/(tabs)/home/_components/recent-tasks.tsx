import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  ClipboardList,
  Calendar,
  ListTodo,
} from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

import { NoTasksIllustration } from "@/components/illustrations";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { TaskDataHook } from "@/hooks/data-hooks/use-task";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import type { Task, SubTask } from "@/services/tasks";

export function RecentTasksList() {
  const router = useRouter();
  const { theme } = useTheme();
  const { data: tasks = [] } = TaskDataHook.useTasksList();

  // Get up to 3 most important pending or recently updated tasks
  const displayTasks = React.useMemo(() => {
    // Show pending tasks first, then completed ones
    const pending = tasks.filter((t: Task) => t.status === "Pending");
    const completed = tasks.filter((t: Task) => t.status === "Completed");
    return [...pending, ...completed].slice(0, 3);
  }, [tasks]);

  return (
    <Card className="mb-3 bg-card border border-border/10 shadow-xl rounded-3xl p-5 overflow-hidden">
      {/* Header section */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 bg-primary/10 rounded-2xl items-center justify-center">
            <ClipboardList size={21} color={theme.primary} />
          </View>
          <View className="justify-center">
            <Text className="text-lg font-black text-foreground leading-5 tracking-tight">
              Recent Tasks
            </Text>
            <Text className="text-[10px] mt-0.5 font-black text-primary uppercase tracking-widest leading-3">
              Overview
            </Text>
          </View>
        </View>

        {tasks.length > 0 && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.navigate("/tasks");
            }}
            className="flex-row items-center active:opacity-60 pl-3 pr-1 py-1 rounded-full bg-secondary/40 border border-border/10"
          >
            <Text className="text-[11px] font-black text-foreground mr-1.5">
              See All
            </Text>
            <View
              className="rounded-full bg-primary/20 items-center justify-center"
              style={{ width: 18, height: 18 }}
            >
              <ArrowRight size={10} color={theme.primary} />
            </View>
          </Pressable>
        )}
      </View>

      {/* Tasks listing using .map */}
      {displayTasks.length === 0 ? (
        <View className="pt-0 -mt-10 pb-1 items-center justify-center">
          <View className="mb-2 items-center justify-center">
            <NoTasksIllustration width={120} height={100} />
          </View>
          <Text className="text-sm font-extrabold text-foreground text-center">
            All caught up!
          </Text>
          <Text className="text-xs text-muted-foreground text-center mt-0.5 pb-2 px-6 leading-1">
            You don't have any tasks right now. Create one to kickstart your
            productivity!
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.navigate("/(tabs)/tasks");
            }}
            className="mt-3.5 px-5 py-2.5 bg-primary rounded-2xl active:scale-95 shadow-lg shadow-primary/20"
          >
            <Text className="text-xs font-black text-primary-foreground">
              Create New Task
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="gap-2.5 -mt-4">
          {displayTasks.map((task) => {
            const isCompleted = task.status === "Completed";
            
            // Calculate dynamic subtask steps progress
            const hasSteps = task.steps && task.steps.length > 0;
            const completedSteps = hasSteps ? task.steps!.filter((s: SubTask) => s.completed).length : 0;
            const totalSteps = hasSteps ? task.steps!.length : 0;

            return (
              <Pressable
                key={task.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/tasks/${task.id}`);
                }}
                className="active:opacity-75"
              >
                <View
                  className={cn(
                    "bg-secondary/40 border border-border/10 rounded-2xl px-4 pt-3.5 pb-3",
                    isCompleted ? "opacity-60" : ""
                  )}
                >
                  {/* Top Main Section */}
                  <View className="flex-row items-start justify-between pb-2">
                    <View className="flex-1">
                      <Text
                        className={cn(
                          "text-[17px] font-extrabold leading-tight",
                          isCompleted ? "text-muted-foreground line-through opacity-60" : "text-foreground"
                        )}
                      >
                        {task.title}
                      </Text>
                      
                      {task.description ? (
                        <Text
                          numberOfLines={1}
                          className={cn(
                            "text-xs mt-0.5",
                            isCompleted ? "text-muted-foreground/60" : "text-muted-foreground"
                          )}
                        >
                          {task.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Bottom Metadata Section */}
                  <View className="flex-row flex-wrap gap-1.5 border-t border-border/10 pt-2.5">
                    {/* 1. Priority Indicator Pill */}
                    {task.category === "Urgent" && (
                      <View className="bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-lg">
                        <Text className="text-[11px] font-extrabold text-destructive">Urgent</Text>
                      </View>
                    )}
                    {task.category === "Work" && (
                      <View className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">
                        <Text className="text-[11px] font-extrabold text-primary">Work</Text>
                      </View>
                    )}
                    {task.category === "Personal" && (
                      <View className="bg-secondary/30 border border-border/40 px-2 py-0.5 rounded-lg">
                        <Text className="text-[11px] font-extrabold text-foreground">Personal</Text>
                      </View>
                    )}

                    {/* 2. Due Date Pill */}
                    <View className="bg-secondary/25 border border-border/30 px-2 py-0.5 rounded-lg flex-row items-center gap-1">
                      <Calendar size={11} color="gray" />
                      <Text className="text-[11px] text-muted-foreground font-bold">{task.dueDate}</Text>
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
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </Card>
  );
}
