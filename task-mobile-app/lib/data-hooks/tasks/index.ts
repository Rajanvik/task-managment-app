/**
 * 🛠️ BOILERPLATE COPY-PASTE GUIDE FOR NEW CRUD DATA HOOKS:
 * -------------------------------------------------------------
 * Jab aap koi naya CRUD module banayein (jaise CategoryDataHook), 
 * toh is file ko copy-paste karke niche diye gaye changes karein:
 * 
 * 1. LINE 25 & 26 (Imports):
 *    - `@/lib/types/tasks` -> Apne new module ke types import karein.
 *    - `@/services/tasks` -> Apne new module ke Service api file import karein.
 * 
 * 2. LINE 36 to 43 (Interface Name & Types):
 *    - `ITaskDataHook` -> `ICategoryDataHook`
 *    - `Task`, `CreateTask`, `UpdateTask` -> Apne new module types (`Category`, `CreateCategory`, `UpdateCategory`).
 * 
 * 3. LINE 46 (Export Object Name):
 *    - `TaskDataHook` -> `CategoryDataHook`
 * 
 * 4. METHOD IMPLEMENTATIONS (Lines 47 to 198):
 *    - Sabhi query keys `["tasks"]` aur `["task"]` ko new domain key se replace karein (jaise `["categories"]`, `["category"]`).
 *    - `TaskService` ko new service class (`CategoryService`) se replace karein.
 *    - toast message success strings ko update karein (jaise "Task updated successfully!" -> "Category updated successfully!").
 */

import { toast } from "@/lib/toast";
import { TaskService } from "@/services/tasks";
import { CreateTask, Task, UpdateTask } from "@/lib/types/tasks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  TMutationOptions,
  TMutationReturnType,
  TQueryOptions,
  TQueryReturnType,
} from "../../types/types";

// 1. Hook types ki definition (Interface)
export interface ITaskDataHook {
  useGetTasks: (data?: { category?: string }, options?: TQueryOptions<Task[]>) => TQueryReturnType<Task[]>;
  useGetTask: (data: { id: string }, options?: TQueryOptions<Task>) => TQueryReturnType<Task>;
  useCreateTask: (options?: TMutationOptions<Task, Error, CreateTask>) => TMutationReturnType<Task, CreateTask>;
  useUpdateTask: (options?: TMutationOptions<Task, Error, { id: string; data: UpdateTask }>) => TMutationReturnType<Task, { id: string; data: UpdateTask }>;
  useDeleteTask: (options?: TMutationOptions<{ message: string }, Error, string>) => TMutationReturnType<{ message: string }, string>;
  getTaskCacheKey: (data: { id: string }) => any[];
}

// 2. Hook implementation with Optimistic Updates
export const TaskDataHook: ITaskDataHook = {
  // Tasks fetch query
  useGetTasks(data, options) {
    return useQuery({
      queryKey: ["tasks", data?.category],
      queryFn: async () => await TaskService.getTasks(data),
      ...options,
    });
  },

  // Single task detail query
  useGetTask(data, options) {
    return useQuery({
      queryKey: ["task", data.id],
      queryFn: async () => await TaskService.getTaskDetail(data),
      enabled: !!data.id,
      ...options,
    });
  },

  // ➕ Create Task Hook (Optimistic)
  useCreateTask(options) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (data: CreateTask) => await TaskService.createTask(data),
      onMutate: async (newTask) => {
        await queryClient.cancelQueries({ queryKey: ["tasks"] });
        
        // Snapshot current queries starting with "tasks"
        const previousQueries = queryClient.getQueriesData<Task[]>({ queryKey: ["tasks"] });
        
        const optimisticTask = {
          id: Math.random().toString(36).substring(2, 15),
          ...newTask,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Task;

        // Instantly update active category filter queries
        previousQueries.forEach(([queryKey]) => {
          const categoryFilter = queryKey[1] as string | undefined;
          if (!categoryFilter || categoryFilter === newTask.category) {
            queryClient.setQueryData<Task[]>(queryKey, (old = []) => [optimisticTask, ...old]);
          }
        });

        return { previousQueries };
      },
      onError: (err, variables, context) => {
        toast.error("Failed to create task.");
        if (context?.previousQueries) {
          context.previousQueries.forEach(([queryKey, previousData]) => {
            queryClient.setQueryData(queryKey, previousData);
          });
        }
        (options?.onError as any)?.(err, variables, context);
      },
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        (options?.onSuccess as any)?.(data, variables, context);
      },
    });
  },

  // ✏️ Update Task Hook (Optimistic)
  useUpdateTask(options) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (variables) => await TaskService.updateTask(variables),
      onMutate: async (variables) => {
        const { id, data } = variables;
        await queryClient.cancelQueries({ queryKey: ["task", id] });
        await queryClient.cancelQueries({ queryKey: ["tasks"] });
        
        const previousTask = queryClient.getQueryData<Task>(["task", id]);
        const previousQueries = queryClient.getQueriesData<Task[]>({ queryKey: ["tasks"] });

        // Instantly update task detail
        queryClient.setQueryData<Task>(["task", id], (old) => old ? ({ ...old, ...data } as any) : old);
        
        // Instantly update filtered task lists
        previousQueries.forEach(([queryKey]) => {
          queryClient.setQueryData<Task[]>(queryKey, (old = []) =>
            old.map((t) => t.id === id ? ({ ...t, ...data } as Task) : t)
          );
        });

        return { previousTask, previousQueries };
      },
      onError: (err, variables, context) => {
        toast.error("Failed to update task.");
        if (context?.previousTask) queryClient.setQueryData(["task", variables.id], context.previousTask);
        if (context?.previousQueries) {
          context.previousQueries.forEach(([queryKey, previousData]) => {
            queryClient.setQueryData(queryKey, previousData);
          });
        }
        (options?.onError as any)?.(err, variables, context);
      },
      onSuccess: (data, variables, context) => {
        queryClient.setQueryData(["task", variables.id], data);
        (options?.onSuccess as any)?.(data, variables, context);
      },
      onSettled: (data, error, variables) => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      },
    });
  },

  // 🗑️ Delete Task Hook (Optimistic)
  useDeleteTask(options) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => await TaskService.deleteTask({ id }),
      onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: ["tasks"] });
        const previousQueries = queryClient.getQueriesData<Task[]>({ queryKey: ["tasks"] });
        
        // Instantly delete from all task list caches
        previousQueries.forEach(([queryKey]) => {
          queryClient.setQueryData<Task[]>(queryKey, (old = []) => old.filter((t) => t.id !== id));
        });

        return { previousQueries };
      },
      onError: (err, variables, context) => {
        toast.error("Failed to delete task.");
        if (context?.previousQueries) {
          context.previousQueries.forEach(([queryKey, previousData]) => {
            queryClient.setQueryData(queryKey, previousData);
          });
        }
        (options?.onError as any)?.(err, variables, context);
      },
      onSuccess: (data, variables, context) => {
        toast.success("Task deleted successfully!");
        (options?.onSuccess as any)?.(data, variables, context);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      },
    });
  },

  getTaskCacheKey(data) {
    return ["task", data.id];
  },
};



