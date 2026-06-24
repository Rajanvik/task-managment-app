import { z } from "zod";

// Prisma enums ke mirror — @prisma/client mobile app me import nahi hota
export const Status = {
  Pending: "Pending",
  Completed: "Completed",
} as const;

export const Category = {
  Work: "Work",
  Personal: "Personal",
  Urgent: "Urgent",
} as const;

export const ZCreateTask = z.object({
  title: z.string().min(1, { message: "Task title is required." }).max(100, { message: "Title is too long." }),
  description: z.string().optional(),
  category: z.nativeEnum(Category).optional(),
  status: z.nativeEnum(Status).optional(),
  dueDate: z.string(),
});

export type TCreateTask = z.infer<typeof ZCreateTask>;
