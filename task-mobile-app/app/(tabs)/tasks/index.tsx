import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { AnimatedReveal } from "@/components/ui/animated-reveal";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/use-theme";
import { TaskDataHook } from "@/lib/data-hooks/tasks";
import { Task } from "@/lib/types/tasks";

import { CategoryFilterChips } from "./_components/category-filter-chips";
import { DeleteTaskAlert } from "./_components/delete-task-alert";
import { TaskCard } from "./_components/task-card";
import { TaskOptionsSheet } from "./_components/task-options-sheet";
import { TasksEmptyState } from "./_components/tasks-empty-state";

// Filter ke possible values ka type
type TFilter = "All" | "Work" | "Personal" | "Urgent";

interface ITasksScreenProps {}

const TasksScreen: React.FC<ITasksScreenProps> = () => {
  // Theme colors aur navigation router
  const { theme } = useTheme();
  const router = useRouter();

  // User ne kaunsa category filter select kiya — default 'All'
  const [filter, setFilter] = useState<TFilter>("All");

  // Backend se tasks fetch karo — filter 'All' ho toh sab lo, warna sirf us category ke
  // Filter badlte hi React Query apne aap naya data fetch karta hai (queryKey me filter hai)
  const { data: tasks = [] } = TaskDataHook.useGetTasks({
    category: filter === "All" ? undefined : filter,
  });

  // Task update karne ka function + isUpdating: jab update chal raha ho toh true
  const { mutate: updateTask, isPending: isUpdating } =
    TaskDataHook.useUpdateTask();

  // Task delete karne ka function + isDeleting: jab delete chal raha ho toh true
  const { mutate: runDeleteTask, isPending: isDeleting } =
    TaskDataHook.useDeleteTask();

  // Konsa task delete confirm ke liye select hua — null matlab koi nahi
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Konsa task ka options sheet (3-dot menu) open hua — null matlab sheet band
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // selectedTaskId string se pura Task object nikalo — tasks list me se
  // useMemo: sirf tab recalculate karo jab tasks ya selectedTaskId change ho
  const selectedTask = React.useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );

  // Progress stats calculate karo — total, completed, aur % done
  // useMemo: sirf tab recalculate karo jab tasks array change ho
  const { totalTasks, completedTasks, progressPercentage } =
    React.useMemo(() => {
      const total = tasks.length;
      const completed = tasks.filter((t) => t.status === "Completed").length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        totalTasks: total,
        completedTasks: completed,
        progressPercentage: progress,
      };
    }, [tasks]);

  // Task checkbox tap hone par: status toggle karo aur celebration screen pe jao
  // useCallback: stable function reference — har render pe naya function na bane
  const handleToggleTask = React.useCallback(
    (task: Task) => {
      // Agar Completed hai toh Pending karo, aur agar Pending hai toh Completed karo
      const nextStatus = task.status === "Completed" ? "Pending" : "Completed";

      // Pehle celebration screen pe jao (lag-free feel ke liye — state change se pehle)
      router.push({
        pathname: "/celebration",
        params: {
          title:
            nextStatus === "Completed"
              ? "Victory! Task Completed 🥳"
              : "Task Re-opened 🎯",
          description:
            nextStatus === "Completed"
              ? `Fantastic job! You have successfully finished "${task.title}". Keep up the superb momentum!`
              : `"${task.title}" has been set back to active. Let's conquer it again!`,
          type: nextStatus === "Completed" ? "complete" : "add",
        },
      });

      // Backend pe status update karo — React Query cache apne aap refresh karega
      updateTask({ id: task.id, data: { status: nextStatus } });
    },
    [router, updateTask],
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header ke peeche hafif primary color ka tint */}
      <View className="absolute top-0 left-0 right-0 h-[280px] bg-primary/5" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* HEADER — slide-down animation ke saath aata hai */}
        <AnimatedReveal variant="slide-down" delay={50} duration={400}>
          <View className="px-6 pt-14 pb-6 relative overflow-hidden">
            {/* Decorative circle — pure visual element */}
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full" />

            {/* Title + Add Task button */}
            <View className="flex-row justify-between items-start z-10">
              <View className="flex-1 mr-4">
                <Text className="text-[34px] font-extrabold tracking-tight text-foreground">
                  Tasks
                </Text>
                <Text className="text-muted-foreground text-sm font-medium mt-1 leading-5">
                  Manage, organize, and track your daily priorities and
                  workspace goals.
                </Text>
              </View>

              {/* + button: tap karo toh new task add screen pe jao */}
              <Pressable
                onPress={() => router.push("/tasks/add" as any)}
                className="h-11 w-11 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/30 active:scale-[0.96] mt-1"
              >
                <Plus color={theme.primaryForeground} size={22} />
              </Pressable>
            </View>

            {/* Progress bar: kitne tasks complete hue */}
            <View className="mt-4 gap-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-muted-foreground text-xs font-bold">
                  {completedTasks} of {totalTasks} completed
                </Text>
                <Text className="text-primary text-xs font-extrabold">
                  {progressPercentage}% Done
                </Text>
              </View>
              <View className="h-2 bg-secondary rounded-full overflow-hidden">
                {/* Width dynamically set hoti hai progress % se */}
                <View
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>
            </View>
          </View>
        </AnimatedReveal>

        {/* BODY — rounded top corners ke saath header ke upar overlap karta hai */}
        <View className="px-5 py-7 rounded-t-[42px] bg-background -mt-2 flex-1 min-h-[600px] border-t border-border/10">
          {/* Category filter chips: All / Work / Personal / Urgent */}
          <AnimatedReveal variant="slide-right" delay={150} duration={400}>
            {/* active: abhi kaunsa filter selected, onChange: filter change hone par setFilter call */}
            <CategoryFilterChips active={filter} onChange={setFilter} />
          </AnimatedReveal>

          {/* Task list ya empty state */}
          <AnimatedReveal variant="slide-up" delay={250} duration={500}>
            {tasks.length === 0 ? (
              // Koi task nahi — illustration + message + add button dikhao
              <TasksEmptyState filter={filter} />
            ) : (
              // Tasks hain — har task ke liye ek TaskCard render karo
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => handleToggleTask(task)} // Checkbox tap
                  onOptionsPress={() => setSelectedTaskId(task.id)} // 3-dot menu tap
                />
              ))
            )}
          </AnimatedReveal>

          {/* Bottom padding — tab bar ke neeche content na chhupta rahe */}
          <View className="h-16" />
        </View>
      </ScrollView>

      {/* OPTIONS SHEET — 3-dot menu tap karne par neeche se slide hota hai */}
      <TaskOptionsSheet
        task={selectedTask} // Jis task ka menu open hai uski data
        visible={!!selectedTaskId} // selectedTaskId ho toh sheet dikhao
        onClose={() => setSelectedTaskId(null)} // Sheet band karo
        onView={() => {
          const id = selectedTaskId!; // primitive state — cache refresh se null nahi hoga
          setSelectedTaskId(null);
          router.push({ pathname: "/tasks/[id]" as any, params: { id } });
        }}
        onEdit={() => {
          const id = selectedTaskId!; // primitive state — cache refresh se null nahi hoga
          setSelectedTaskId(null);
          router.push({ pathname: "/tasks/edit/[id]" as any, params: { id } });
        }}
        onDelete={() => {
          setDeleteTaskId(selectedTaskId); // Delete confirm ke liye task ID save karo
          setSelectedTaskId(null); // Options sheet band karo
        }}
      />

      {/* DELETE CONFIRMATION ALERT — delete tap karne ke baad confirmation maango */}
      <DeleteTaskAlert
        visible={!!deleteTaskId} // deleteTaskId ho toh alert dikhao
        isDeleting={isDeleting} // Delete chal raha ho toh button loading me dikhao
        onCancel={() => setDeleteTaskId(null)} // Cancel: alert band karo
        onConfirm={() => {
          if (!deleteTaskId) return;
          runDeleteTask(deleteTaskId, {
            onSuccess: () => setDeleteTaskId(null),
            onError: () => setDeleteTaskId(null),
          });
        }}
      />
    </View>
  );
};

export default TasksScreen;
