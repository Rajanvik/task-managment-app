import React, { useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import { useRouter } from "expo-router";

import { type Task } from "@/app/(tabs)/tasks/data/task-data";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Text } from "@/components/ui/text";
import { useTasks } from "@/context/TaskContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { THEME } from "@/lib/theme";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import { DeleteTaskAlert } from "./_components/delete-task-alert";
import { TaskCard } from "./_components/task-card";
import { TaskForm } from "./_components/task-form";
import { TaskOptionsSheet } from "./_components/task-options-sheet";

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

  const selectedTask = tasks.find((t: Task) => t.id === selectedTaskId) || null;

  // Filter Tasks dynamically
  const filteredTasks = tasks.filter((t: Task) => {
    if (filter === 'All') return true;
    return t.category === filter;
  });

  // Calculate Tasks completion progress variables
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: Task) => t.status === "Completed").length;
  const pendingTasks = tasks.filter((t: Task) => t.status === "Pending").length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <View className="flex-1 bg-background">
      {/* Background soft tint matches Home Page header area */}
      <View className="absolute top-0 left-0 right-0 h-[280px] bg-primary/5" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* PREMIUM TASK HEADER SECTION */}
        <View className="px-6 pt-14 pb-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-muted-foreground text-xs uppercase font-extrabold tracking-wider">
                Workspace
              </Text>
              <Text className="text-[34px] font-extrabold tracking-tight text-foreground mt-0.5">
                Task Hub
              </Text>
            </View>

            {/* Premium action button */}
            <Pressable
              onPress={() => setIsSheetOpen(true)}
              className="h-11 w-11 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/30 active:scale-[0.96]"
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

        {/* 
          CURVED WORKSPACE LIST BODY CONTAINER:
          Beautiful rounded sheet (-mt-2 to overlap background decorative header overlay)
        */}
        <View className="px-5 py-7 rounded-t-[42px] bg-background -mt-2 flex-1 min-h-[600px] border-t border-border/10">
          
          {/* HORIZONTAL CATEGORY FILTER CHIPS */}
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

          {/* DYNAMIC TASKS LIST */}
          {filteredTasks.length === 0 ? (
            <View className="items-center justify-center py-16 gap-3">
              <Text className="text-3xl">📭</Text>
              <Text className="text-base font-extrabold text-foreground mt-2">
                No {filter !== 'All' ? filter.toLowerCase() : ''} tasks
              </Text>
              <Text className="text-muted-foreground text-xs text-center max-w-[200px]">
                Your list is completely clear at the moment.
              </Text>
            </View>
          ) : (
            filteredTasks.map((task: Task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => toggleStatus(task.id)}
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
            addTask({ ...t, category: t.category as any });
            setIsSheetOpen(false);
            toast.success("Task created", {
              description: `"${t.title}" added.`,
            });
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
              updateTask(taskToEdit.id, { ...t, category: t.category as any });
              setTaskToEdit(null);
              toast.success("Task updated");
            }
          }}
          onCancel={() => setTaskToEdit(null)}
        />
      </BottomSheet>
    </View>
  );
}
