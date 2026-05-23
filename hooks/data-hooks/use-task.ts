import { toast } from "@/lib/toast";
// 🛑 [EDIT karne ke liye: Jab new hook copy-paste karoge, to yahan apna naya service class aur model/payload types import karna]
import {
  CreateTaskPayload,
  Task,
  taskService,
  UpdateTaskPayload,
} from "@/services/tasks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  TMutationOptions,
  TMutationReturnType,
  TQueryOptions,
  TQueryReturnType,
} from "./types";

// 🛑 [EDIT karne ke liye: Interface ka naam aur functions ke generic types badlein (e.g., Task -> Project, payload types change karein)]
export interface ITaskDataHook {
  useTasksList: (
    category?: string,
    options?: TQueryOptions<Task[]>,
  ) => TQueryReturnType<Task[]>;
  useTaskDetail: (
    id: string,
    options?: TQueryOptions<Task>,
  ) => TQueryReturnType<Task>;
  useCreateTask: (
    options?: TMutationOptions<Task, Error, CreateTaskPayload>,
  ) => TMutationReturnType<Task, CreateTaskPayload>;
  useUpdateTask: (
    options?: TMutationOptions<
      Task,
      Error,
      { id: string; data: UpdateTaskPayload }
    >,
  ) => TMutationReturnType<Task, { id: string; data: UpdateTaskPayload }>;
  useDeleteTask: (
    options?: TMutationOptions<{ message: string }, Error, string>,
  ) => TMutationReturnType<{ message: string }, string>;
  getTaskCacheKey: (id?: string) => any[];
}

export const TaskDataHook: ITaskDataHook = {
  // 🔍 READ LIST: Saare items fetch karne ka hook
  useTasksList(category, options) {
    return useQuery({
      // 🛑 [EDIT karne ke liye: Yahan apne list ka query cache key name change karein, jaise "tasks" -> "projects"]
      queryKey: ["tasks", category],
      // 🛑 [EDIT karne ke liye: Yahan apka list fetch karne wala API service method change hoga]
      queryFn: () => taskService.getTasks(category),
      ...options,
    });
  },

  // 🔍 READ DETAIL: Ek single item details fetch karne ka hook
  useTaskDetail(id, options) {
    const queryClient = useQueryClient();
    return useQuery({
      // 🛑 [EDIT karne ke liye: Yahan apne single item ka query cache key name change karein, jaise "task" -> "project"]
      queryKey: ["task", id],
      // 🛑 [EDIT karne ke liye: Yahan apka detail fetch karne wala API service method change hoga]
      queryFn: () => taskService.getTaskDetail(id),
      enabled: !!id,
      initialData: () => {
        // 🛑 [EDIT karne ke liye: Yahan list key name badlein taaki detail load hone se pehle list cache se data copy ho sake]
        const cached = queryClient.getQueryData<Task[]>(["tasks", undefined]);
        return cached?.find((t) => t.id === id);
      },
      ...options,
    });
  },

  // ➕ CREATE: Naya item insert karne ka hook (with Optimistic Update)
  useCreateTask(options) {
    const queryClient = useQueryClient();
    return useMutation({
      // 🛑 [EDIT karne ke liye: Yahan apna item create karne wala API service method change hoga]
      mutationFn: taskService.createTask,
      onMutate: async (payload) => {
        // 🛑 [EDIT karne ke liye: Cancel query list name badlein, jaise "tasks" -> "projects"]
        await queryClient.cancelQueries({ queryKey: ["tasks"] });
        // 🛑 [EDIT karne ke liye: Snapshot key name badlein taaki update apply ho sake, jaise "tasks" -> "projects"]
        const previousQueries = queryClient.getQueriesData<Task[]>({
          queryKey: ["tasks"],
        });

        // 🛑 [EDIT karne ke liye: Yahan UI par naya item instantly insert karne ke liye temporary fake object ka structure design karein]
        const tempItem: Task = {
          id: `temp-${Date.now()}`,
          title: payload.title,
          description: payload.description ?? null,
          category: payload.category ?? "Work",
          status: "Pending",
          dueDate: payload.dueDate ?? null,
          userId: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          steps: [],
        };

        // Cache list me item insert kar rahe hain
        previousQueries.forEach(([queryKey]) => {
          queryClient.setQueryData<Task[]>(queryKey, (old) => [
            tempItem,
            ...(old ?? []),
          ]);
        });

        return { previousQueries };
      },
      onError: (err: any, variables, context: any) => {
        // Error aane par original state restore ho jayegi
        context?.previousQueries?.forEach(([queryKey, previousValue]: any) => {
          queryClient.setQueryData(queryKey, previousValue);
        });
        toast.error("Failed to create task.");
        (options?.onError as any)?.(err, variables, context);
      },
      onSettled: (data, error, variables, context) => {
        // 🛑 [EDIT karne ke liye: API call end hone par jin cache keys ko invalid/refetch karna hai unke names badlein]
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        if (!error && data) {
          (options?.onSuccess as any)?.(data, variables, context);
        }
      },
    });
  },

  // ✏️ UPDATE: Item edit/update karne ka hook (with Optimistic Update)
  useUpdateTask(options) {
    const queryClient = useQueryClient();
    return useMutation({
      // 🛑 [EDIT karne ke liye: Yahan item update karne wala API service method change hoga]
      mutationFn: ({ id, data }) => taskService.updateTask(id, data),
      onMutate: async ({ id, data }) => {
        // 🛑 [EDIT karne ke liye: Cancel target list and detail keys badlein, jaise "tasks" -> "projects", "task" -> "project"]
        await queryClient.cancelQueries({ queryKey: ["tasks"] });
        await queryClient.cancelQueries({ queryKey: ["task", id] });

        // 🛑 [EDIT karne ke liye: Snapshot key names badlein, jaise "tasks" -> "projects", "task" -> "project"]
        const previousQueries = queryClient.getQueriesData<Task[]>({
          queryKey: ["tasks"],
        });
        const previousTask = queryClient.getQueryData<Task>(["task", id]);

        // 🛑 [EDIT karne ke liye: Naye model ke options ke hisab se relational list parameters (jaise steps/comments) ko alag handle karein]
        const { steps, ...updateFields } = data;

        // List queries me optimistic changes apply karein
        previousQueries.forEach(([queryKey]) => {
          queryClient.setQueryData<Task[]>(queryKey, (old) =>
            old?.map((t) => {
              if (t.id !== id) return t;
              let mergedSteps = t.steps;
              if (steps) {
                mergedSteps = t.steps?.map((existingStep, idx) => {
                  const matchingPayloadStep = steps[idx];
                  if (
                    matchingPayloadStep &&
                    matchingPayloadStep.title === existingStep.title
                  ) {
                    return {
                      ...existingStep,
                      completed: matchingPayloadStep.completed,
                    };
                  }
                  return existingStep;
                });
              }
              return { ...t, ...updateFields, steps: mergedSteps };
            }),
          );
        });

        // Detail cache query update karein
        queryClient.setQueryData<Task>(["task", id], (old) => {
          if (!old) return old;
          let mergedSteps = old.steps;
          if (steps) {
            mergedSteps = old.steps?.map((existingStep, idx) => {
              const matchingPayloadStep = steps[idx];
              if (
                matchingPayloadStep &&
                matchingPayloadStep.title === existingStep.title
              ) {
                return {
                  ...existingStep,
                  completed: matchingPayloadStep.completed,
                };
              }
              return existingStep;
            });
          }
          return { ...old, ...updateFields, steps: mergedSteps };
        });

        return { previousQueries, previousTask };
      },
      onError: (err: any, variables, context: any) => {
        // Rollback state restore loop
        context?.previousQueries?.forEach(([queryKey, previousValue]: any) => {
          queryClient.setQueryData(queryKey, previousValue);
        });
        if (context?.previousTask) {
          // 🛑 [EDIT karne ke liye: Detail rollback key path badlein, jaise "task" -> "project"]
          queryClient.setQueryData(
            ["task", variables.id],
            context.previousTask,
          );
        }
        toast.error("Failed to update task.");
        (options?.onError as any)?.(err, variables, context);
      },
      onSettled: (data, error, variables, context) => {
        // 🛑 [EDIT karne ke liye: Refetch invalidation target keys badlein, jaise "tasks" -> "projects", "task" -> "project"]
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        if (!error && data) {
          (options?.onSuccess as any)?.(data, variables, context);
        }
      },
    });
  },

  // 🗑️ DELETE: Database se item delete karne ka hook (with Optimistic Update)
  useDeleteTask(options) {
    const queryClient = useQueryClient();
    return useMutation({
      // 🛑 [EDIT karne ke liye: Deletion API service call badlein]
      mutationFn: taskService.deleteTask,
      retry: 0,
      onMutate: async (id) => {
        // 🛑 [EDIT karne ke liye: Cancel target key name badlein, jaise "tasks" -> "projects"]
        await queryClient.cancelQueries({ queryKey: ["tasks"] });
        // 🛑 [EDIT karne ke liye: Snapshot list cache target name badlein, jaise "tasks" -> "projects"]
        const previousQueries = queryClient.getQueriesData<Task[]>({
          queryKey: ["tasks"],
        });

        // Item ko list me se instantly delete/filter karein
        previousQueries.forEach(([queryKey]) => {
          queryClient.setQueryData<Task[]>(queryKey, (old) =>
            old?.filter((t) => t.id !== id),
          );
        });

        return { previousQueries };
      },
      onError: (err: any, id, context: any) => {
        if (err?.response?.status === 404) return;
        // Rollback state restore
        context?.previousQueries?.forEach(([queryKey, previousValue]: any) => {
          queryClient.setQueryData(queryKey, previousValue);
        });
        toast.error("Failed to delete task.");
        (options?.onError as any)?.(err, id, context);
      },
      onSettled: (data, error, id, context) => {
        // 🛑 [EDIT karne ke liye: Refetch keys verify/change karein, jaise "tasks" -> "projects"]
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        const isSuccess = !error || (error as any)?.response?.status === 404;
        if (isSuccess) {
          toast.success("Task deleted successfully!");
          (options?.onSuccess as any)?.(data, id, context);
        }
      },
    });
  },

  // Cache helper key generator
  getTaskCacheKey(id) {
    // 🛑 [EDIT karne ke liye: Cache keys update name badlein, jaise "task" -> "project"]
    return id ? ["task", id] : ["tasks"];
  },
};
