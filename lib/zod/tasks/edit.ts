import { z } from "zod";
import { Status, Category } from "./index";

export const ZEditTask = z.object({
  id: z.string(),
  title: z.string().min(1, { message: "Task title is required." }).max(100, { message: "Title is too long." }),
  description: z.string().optional(),
  category: z.nativeEnum(Category).optional(),
  status: z.nativeEnum(Status).optional(),
  dueDate: z.string(),
});

export type TEditTask = z.infer<typeof ZEditTask>;
