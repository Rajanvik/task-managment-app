import React, { useEffect } from "react";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { INITIAL_TASKS, type Task, type SubTask } from "@/app/(tabs)/tasks/data/task-data";

// Define the shape of our Zustand store
export interface TaskStoreState {
  tasks: Task[];
  isLoaded: boolean;
  loadTasks: () => Promise<void>;
  addTask: (task: {
    title: string;
    description: string;
    category: Task["category"];
    dueDate?: string;
    steps?: SubTask[];
  }) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updatedData: Partial<Task>) => void;
  toggleStatus: (id: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
}

// Create a premium, robust, globally shared state container using Zustand
export const useTaskStore = create<TaskStoreState>()((set, get) => ({
  tasks: [],
  isLoaded: false,

  // Load tasks asynchronously from local storage on app startup
  loadTasks: async () => {
    const stored = await AsyncStorage.getItem("tasks");
    const tasks = stored ? JSON.parse(stored) : INITIAL_TASKS;
    set({ tasks, isLoaded: true });
    if (!stored) {
      AsyncStorage.setItem("tasks", JSON.stringify(INITIAL_TASKS));
    }
  },

  // Add a task and persist state asynchronously
  addTask: (newTaskData) => {
    const newTask: Task = {
      id: Date.now().toString(),
      status: "Pending",
      dueDate: newTaskData.dueDate || new Date().toISOString().split("T")[0],
      ...newTaskData,
    };

    const updatedTasks = [newTask, ...get().tasks];
    set({ tasks: updatedTasks });
    AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
  },

  // Delete a task and persist state asynchronously
  deleteTask: (id) => {
    const updatedTasks = get().tasks.filter((task) => task.id !== id);
    set({ tasks: updatedTasks });
    AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
  },

  // Update a task partially and persist state asynchronously
  updateTask: (id, updatedData) => {
    const updatedTasks = get().tasks.map((t) => (t.id === id ? { ...t, ...updatedData } : t));
    set({ tasks: updatedTasks });
    AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
  },

  // Toggle status and persist state asynchronously
  toggleStatus: (id) => {
    const updatedTasks = get().tasks.map((t) => {
      if (t.id === id) {
        const nextStatus: Task["status"] = t.status === "Completed" ? "Pending" : "Completed";
        return { ...t, status: nextStatus };
      }
      return t;
    });

    set({ tasks: updatedTasks });
    AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
  },

  // Toggle subtask step and persist state asynchronously
  toggleSubTask: (taskId, subTaskId) => {
    const updatedTasks = get().tasks.map((t) => {
      if (t.id === taskId) {
        const updatedSteps = t.steps?.map((step) => {
          if (step.id === subTaskId) {
            return { ...step, completed: !step.completed };
          }
          return step;
        });
        return { ...t, steps: updatedSteps };
      }
      return t;
    });

    set({ tasks: updatedTasks });
    AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
  },
}));

// Backwards-Compatible TaskProvider to initialize the store and prevent breaking main app layouts
export function TaskProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useTaskStore.getState().loadTasks();
  }, []);

  return <>{children}</>;
}

// Backwards-Compatible useTasks React hook for seamless UI component binding
export function useTasks() {
  const tasks = useTaskStore((state: TaskStoreState) => state.tasks);
  const isLoaded = useTaskStore((state: TaskStoreState) => state.isLoaded);
  const addTask = useTaskStore((state: TaskStoreState) => state.addTask);
  const deleteTask = useTaskStore((state: TaskStoreState) => state.deleteTask);
  const updateTask = useTaskStore((state: TaskStoreState) => state.updateTask);
  const toggleStatus = useTaskStore((state: TaskStoreState) => state.toggleStatus);
  const toggleSubTask = useTaskStore((state: TaskStoreState) => state.toggleSubTask);

  return {
    tasks,
    isLoaded,
    addTask,
    deleteTask,
    updateTask,
    toggleStatus,
    toggleSubTask,
  };
}
