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

export interface ITaskDataHook {
  useGetTasks: (
    data?: { category?: string },
    options?: TQueryOptions<Task[]>,
  ) => TQueryReturnType<Task[]>;
  useGetTask: (
    data: {
      id: string;
    },
    options?: TQueryOptions<Task>,
  ) => TQueryReturnType<Task>;
  useCreateTask: (
    options?: TMutationOptions<Task, Error, CreateTask>,
  ) => TMutationReturnType<Task, CreateTask>;
  useUpdateTask: (
    options?: TMutationOptions<
      Task,
      Error,
      { id: string; data: UpdateTask }
    >,
  ) => TMutationReturnType<Task, { id: string; data: UpdateTask }>;
  useDeleteTask: (
    options?: TMutationOptions<{ message: string }, Error, string>,
  ) => TMutationReturnType<{ message: string }, string>;
  getTaskCacheKey: (data: { id: string }) => any[];
}

export const TaskDataHook: ITaskDataHook = {
  useGetTasks(data, options) {
    return useQuery({
      queryKey: ["tasks", data?.category],
      queryFn: async () => {
        return await TaskService.getTasks(data);
      },
      ...options,
    });
  },

  useGetTask(data, options) {
    return useQuery({
      queryKey: ["task", data.id],
      queryFn: async () => {
        return await TaskService.getTaskDetail(data);
      },
      enabled: !!data.id,
      ...options,
    });
  },

  useCreateTask(options) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (data: CreateTask) => {
        return await TaskService.createTask(data);
      },
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        (options?.onSuccess as any)?.(data, variables, context);
      },
      onError: (err: any, variables, context) => {
        toast.error("Failed to create task.");
        (options?.onError as any)?.(err, variables, context);
      },
    });
  },

  useUpdateTask(options) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (variables: {
        id: string;
        data: UpdateTask;
      }) => {
        return await TaskService.updateTask(variables);
      },
      onSuccess: (data, variables, context) => {
        // Update the cache directly
        queryClient.setQueryData(["task", variables.id], data);

        // Also invalidate to ensure consistency
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        (options?.onSuccess as any)?.(data, variables, context);
      },
      onError: (err: any, variables, context) => {
        toast.error("Failed to update task.");
        (options?.onError as any)?.(err, variables, context);
      },
    });
  },

  useDeleteTask(options) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (id: string) => {
        return await TaskService.deleteTask({ id });
      },
      onSuccess: (data, variables, context) => {
        toast.success("Task deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        (options?.onSuccess as any)?.(data, variables, context);
      },
      onError: (err: any, variables, context) => {
        toast.error("Failed to delete task.");
        (options?.onError as any)?.(err, variables, context);
      },
    });
  },

  getTaskCacheKey(data) {
    return ["task", data.id];
  },
};
