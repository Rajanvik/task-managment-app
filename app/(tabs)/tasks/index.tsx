import React, { useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { type Task } from "@/app/(tabs)/tasks/data/task-data";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Text } from "@/components/ui/text";
import { useTasks } from "@/context/TaskContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { THEME } from "@/lib/theme";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { NoTasksIllustration } from "@/components/illustrations";

import { DeleteTaskAlert } from "./_components/delete-task-alert";
import { TaskCard } from "./_components/task-card";
import { TaskForm } from "./_components/task-form";
import { TaskOptionsSheet } from "./_components/task-options-sheet";
import { AnimatedReveal } from "@/components/ui/animated-reveal";

function EmptyStateIllustration() {
  const floatAnim = useSharedValue(0);

  React.useEffect(() => {
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatAnim.value }],
    };
  });

  return (
    <Animated.View style={floatStyle} className="items-center justify-center">
      <NoTasksIllustration width={260} height={200} />
    </Animated.View>
  );
}

export default function TasksScreen() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme];
  const router = useRouter();
  const { tasks, addTask, deleteTask, updateTask, toggleStatus } = useTasks();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Dynamic Category Filters
  const [filter, setFilter] = useState<'All' | 'Work' | 'Personal' | 'Urgent'>('All');

  const selectedTask = React.useMemo(() => {
    return tasks.find((t: Task) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  const { filteredTasks, totalTasks, completedTasks, pendingTasks, progressPercentage } = React.useMemo(() => {
    const filtered = tasks.filter((t: Task) => {
      if (filter === 'All') return true;
      return t.category === filter;
    });
    const total = tasks.length;
    const completed = tasks.filter((t: Task) => t.status === "Completed").length;
    const pending = tasks.filter((t: Task) => t.status === "Pending").length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      filteredTasks: filtered,
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      progressPercentage: progress,
    };
  }, [tasks, filter]);

  const emptyStateContent = React.useMemo(() => {
    switch (filter) {
      case 'Work':
        return {
          title: "No Professional Tasks Scheduled",
          description: "Your work checklist is fully accomplished. Take a quick breather, or tap below to outline your next professional milestone and keep scaling your goals."
        };
      case 'Personal':
        return {
          title: "No Personal Goals Listed",
          description: "Your personal space is perfectly clear. Take this window of opportunity to recharge, focus on self-care, or schedule your next exciting personal passion project."
        };
      case 'Urgent':
        return {
          title: "No High-Priority Actions",
          description: "Excellent job! All critical and time-sensitive tasks have been successfully resolved. You're fully ahead of schedule with zero critical blockers."
        };
      case 'All':
      default:
        return {
          title: "Your Workspace is Crystal Clear",
          description: "You've successfully completed all your scheduled goals! Celebrate this moment of peak productivity, or tap below to organize your next big achievement."
        };
    }
  }, [filter]);

  return (
    <View className="flex-1 bg-background">
      {/* Background soft tint matches Home Page header area */}
      <View className="absolute top-0 left-0 right-0 h-[280px] bg-primary/5" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* PREMIUM TASK HEADER SECTION */}
        <AnimatedReveal variant="slide-down" delay={50} duration={400}>
          <View className="px-6 pt-14 pb-6 relative overflow-hidden">
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full" />
            <View className="flex-row justify-between items-start z-10">
              <View className="flex-1 mr-4">
                <Text className="text-[34px] font-extrabold tracking-tight text-foreground">
                  Tasks
                </Text>
                <Text className="text-muted-foreground text-sm font-medium mt-1 leading-5">
                  Manage, organize, and track your daily priorities and workspace goals.
                </Text>
              </View>

              {/* Premium action button */}
              <Pressable
                onPress={() => setIsSheetOpen(true)}
                className="h-11 w-11 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/30 active:scale-[0.96] mt-1"
              >
                <Plus color={theme.primaryForeground} size={22} />
              </Pressable>
            </View>

            {/* Dynamic Progress indicator bar in the header! */}
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
                <View 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>
            </View>
          </View>
        </AnimatedReveal>

        {/* 
          CURVED WORKSPACE LIST BODY CONTAINER:
          Beautiful rounded sheet (-mt-2 to overlap background decorative header overlay)
        */}
        <View className="px-5 py-7 rounded-t-[42px] bg-background -mt-2 flex-1 min-h-[600px] border-t border-border/10">
          
          {/* HORIZONTAL CATEGORY FILTER CHIPS */}
          <AnimatedReveal variant="slide-right" delay={150} duration={400}>
            <View className="mb-5">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {(['All', 'Work', 'Personal', 'Urgent'] as const).map((cat) => {
                  const isActive = filter === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setFilter(cat)}
                      className={cn(
                        "px-4 py-2 rounded-2xl mr-2 border active:scale-95",
                        isActive 
                          ? "bg-foreground border-foreground" 
                          : "bg-secondary/20 border-border/40"
                      )}
                    >
                      <Text 
                        className={cn(
                          "text-xs font-extrabold",
                          isActive ? "text-background" : "text-muted-foreground"
                        )}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </AnimatedReveal>

          {/* DYNAMIC TASKS LIST */}
          <AnimatedReveal variant="slide-up" delay={250} duration={500}>
            {filteredTasks.length === 0 ? (
              <View className="items-center justify-center py-6 px-4">
                {/* Clean, Large Floating Illustration (without background circles) */}
                <View className="items-center justify-center mb-6">
                  <EmptyStateIllustration />
                </View>

                {/* 2. Premium Typography */}
                <Text className="text-[22px] font-black text-foreground text-center tracking-tight leading-7 mt-1 px-4">
                  {emptyStateContent.title}
                </Text>
                <Text className="text-muted-foreground text-[14px] font-medium text-center max-w-[290px] mt-3.5 leading-5 px-2">
                  {emptyStateContent.description}
                </Text>

                {/* 3. Dynamic Quick Add button to make it actionable! */}
                <Pressable
                  onPress={() => setIsSheetOpen(true)}
                  className="mt-6 px-5 py-2.5 bg-secondary/50 dark:bg-secondary/10 border border-border/40 rounded-full active:scale-95 flex-row items-center gap-2"
                >
                  <Plus size={14} color={theme.foreground} />
                  <Text className="text-xs font-bold text-foreground">
                    Add first task
                  </Text>
                </Pressable>
              </View>
            ) : (
              filteredTasks.map((task: Task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => {
                    const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
                    
                    // 1. Immediately launch celebration (completely lag-free because state hasn't changed)
                    router.push({
                      pathname: "/celebration",
                      params: {
                        title: nextStatus === "Completed" ? "Victory! Task Completed 🥳" : "Task Re-opened 🎯",
                        description: nextStatus === "Completed"
                          ? `Fantastic job! You have successfully finished "${task.title}". Keep up the superb momentum!`
                          : `"${task.title}" has been set back to active. Let's conquer it again!`,
                        type: nextStatus === "Completed" ? "complete" : "add"
                      }
                    });
                    
                    // 2. Perform the state update in the background after the slide transition completes (600ms)
                    setTimeout(() => {
                      toggleStatus(task.id);
                    }, 600);
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/tasks/[id]" as any,
                      params: { id: task.id },
                    })
                  }
                  onOptionsPress={() => setSelectedTaskId(task.id)}
                />
              ))
            )}
          </AnimatedReveal>
          <View className="h-16" />
        </View>
      </ScrollView>

      {/* Task Add Form Sheet */}
      <BottomSheet
        visible={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="New Task"
        description="Please fill out the details below."
      >
        <TaskForm
          onSubmit={(t) => {
            setIsSheetOpen(false);
            
            // 1. Instantly trigger celebration modal slide up
            router.push({
              pathname: "/celebration",
              params: {
                title: "Task Successfully Created",
                description: `"${t.title}" has been successfully added to your checklist. Let's make progress!`,
                type: "add"
              }
            });
            
            // 2. Perform the save operations in the background after the slide transition completes (600ms)
            setTimeout(() => {
              addTask({ ...t, category: t.category as any });
            }, 600);
          }}
          onCancel={() => setIsSheetOpen(false)}
        />
      </BottomSheet>

      {/* Options sheet */}
      <TaskOptionsSheet
        task={selectedTask}
        visible={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onView={() => {
          const task = selectedTask;
          setSelectedTaskId(null);
          if (task)
            router.push({
              pathname: "/tasks/[id]" as any,
              params: { id: task.id },
            });
        }}
        onEdit={() => {
          setTaskToEdit(selectedTask);
          setSelectedTaskId(null);
        }}
        onDelete={() => {
          const id = selectedTaskId;
          setSelectedTaskId(null);
          setTimeout(() => setDeleteTaskId(id), 300);
        }}
      />

      {/* Delete Confirmation Alert */}
      <DeleteTaskAlert
        visible={!!deleteTaskId}
        isDeleting={isDeleting}
        onCancel={() => setDeleteTaskId(null)}
        onConfirm={async () => {
          if (!deleteTaskId) return;
          setIsDeleting(true);
          await new Promise((r) => setTimeout(r, 800));
          toast.error("Task deleted", { description: "Task removed." });
          deleteTask(deleteTaskId);
          setIsDeleting(false);
          setDeleteTaskId(null);
        }}
      />

      {/* Task Edit Form Sheet */}
      <BottomSheet
        visible={!!taskToEdit}
        onClose={() => setTaskToEdit(null)}
        title="Edit Task"
        description="Update your task details."
      >
        <TaskForm
          initialData={
            taskToEdit
              ? {
                  title: taskToEdit.title,
                  description: taskToEdit.description || "",
                  category: taskToEdit.category,
                  dueDate: taskToEdit.dueDate,
                  steps: taskToEdit.steps || [],
                }
              : undefined
          }
          onSubmit={(t) => {
            if (taskToEdit) {
              setTaskToEdit(null);
              
              // 1. Immediately launch celebration screen
              router.push({
                pathname: "/celebration",
                params: {
                  title: "Task Successfully Updated",
                  description: `"${t.title}" has been successfully updated in your list.`,
                  type: "add"
                }
              });
              
              // 2. Process database state changes after the slide transition completes (600ms)
              setTimeout(() => {
                updateTask(taskToEdit.id, { ...t, category: t.category as any });
              }, 600);
            }
          }}
          onCancel={() => setTaskToEdit(null)}
        />
      </BottomSheet>
    </View>
  );
}
