export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category: "Work" | "Personal" | "Urgent";
  status: "Pending" | "Completed";
  dueDate: string | null;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  steps: SubTask[];
}

export interface CreateTask {
  title: string;
  description?: string;
  status?: "Pending" | "Completed";
  category?: "Work" | "Personal" | "Urgent";
  dueDate?: string | null;
  steps?: Array<string | { title: string; completed?: boolean }>;
}

export interface UpdateTask {
  title?: string;
  description?: string;
  status?: "Pending" | "Completed";
  category?: "Work" | "Personal" | "Urgent";
  dueDate?: string | null;
  steps?: Array<{ title: string; completed: boolean }>;
}
