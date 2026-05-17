import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_TASKS, type Task, type SubTask } from "@/app/(tabs)/tasks/data/task-data";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toast } from "@/lib/toast";

interface TaskContextType {
  tasks: Task[];
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

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load tasks from local storage on app startup
  useEffect(() => {
    async function loadTasks() {
      try {
        const storedTasks = await AsyncStorage.getItem("tasks");
        if (storedTasks !== null) {
          setTasks(JSON.parse(storedTasks));
        } else {
          // Fallback to initial seed tasks if storage is empty
          setTasks(INITIAL_TASKS);
        }
      } catch (error) {
        console.error("Failed to load tasks from local storage:", error);
        setTasks(INITIAL_TASKS);
      } finally {
        setIsLoaded(true);
      }
    }
    loadTasks();
  }, []);

  // Save tasks to local storage whenever tasks state changes
  useEffect(() => {
    if (!isLoaded) return;
    
    async function saveTasks() {
      try {
        await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks to local storage:", error);
      }
    }
    saveTasks();
  }, [tasks, isLoaded]);

  const addTask = (newTaskData: {
    title: string;
    description: string;
    category: Task["category"];
    dueDate?: string;
    steps?: SubTask[];
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      status: "Pending",
      dueDate: newTaskData.dueDate || new Date().toISOString().split("T")[0],
      ...newTaskData,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const updateTask = (id: string, updatedData: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t)),
    );
  };

  const toggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === "Completed" ? "Pending" : "Completed";
          if (nextStatus === "Completed") {
            toast.success("Task completed!", {
              description: `"${t.title}" marked as completed.`,
            });
          } else {
            toast.info("Task marked pending", {
              description: `"${t.title}" is now active.`,
            });
          }
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSteps = t.steps?.map((step) => {
            if (step.id === subTaskId) {
              const nextCompleted = !step.completed;
              if (nextCompleted) {
                toast.success("Step completed!", {
                  description: `"${step.title}" marked as completed.`,
                });
              } else {
                toast.info("Step marked pending", {
                  description: `"${step.title}" is now active.`,
                });
              }
              return { ...step, completed: nextCompleted };
            }
            return step;
          });
          return { ...t, steps: updatedSteps };
        }
        return t;
      })
    );
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        deleteTask,
        updateTask,
        toggleStatus,
        toggleSubTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
