import { z } from "zod";

export const editTaskSchema = z.object({
  title: z.string().min(1, { message: "Task title is required." }).max(100, { message: "Title is too long." }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required." }),
});

export type EditTaskFormValues = z.infer<typeof editTaskSchema>;
