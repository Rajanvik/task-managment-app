import { axiosInstance } from '@/lib/axios-instance';
import { ENDPOINTS } from '@/api/endpoints';

// 1. Types aur Payload Interfaces mappings
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
  category: 'Work' | 'Personal' | 'Urgent';
  status: 'Pending' | 'Completed';
  dueDate: string | null;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  steps: SubTask[];
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: 'Pending' | 'Completed';
  category?: 'Work' | 'Personal' | 'Urgent';
  dueDate?: string | null;
  steps?: Array<string | { title: string; completed?: boolean }>;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: 'Pending' | 'Completed';
  category?: 'Work' | 'Personal' | 'Urgent';
  dueDate?: string | null;
  steps?: Array<{ title: string; completed: boolean }>;
}

/**
 * 🛠️ TaskService Interface:
 * Jab aap CRUD operations ke API Service files banayein (jaise CategoryService, StepService),
 * tab iss standard mapping schema interface copy-paste karke utilize karein.
 * 
 * 💡 Naya CRUD module banate waqt isme niche likhe edit karein:
 * 1. Interface name replace karein (jaise `TaskService` -> `AddressService`).
 * 2. Parameters signature updates:
 *    - `getTasks(): Promise<Task[]>` -> `getAddresses(): Promise<Address[]>`
 *    - `createTask(data: CreateTaskPayload): Promise<Task>` -> `createAddress(data: CreateAddressPayload): Promise<Address>`
 *    - `updateTask(id: string, data: UpdateTaskPayload): Promise<Task>` -> `updateAddress(id: string, data: UpdateAddressPayload): Promise<Address>`
 */
export interface TaskService {
  // getTasks: users ke list fetch karega
  // 👉 Customization: <ResponseData[]> define karein
  getTasks(category?: string): Promise<Task[]>;

  // createTask: new items backend post payload submit karega
  // 👉 Customization: payload aur return response type customize karein
  createTask(data: CreateTaskPayload): Promise<Task>;

  // getTaskDetail: single detail mapping query triggered call
  // 👉 Customization: parameter id match details configure karein
  getTaskDetail(id: string): Promise<Task>;

  // updateTask: update changes requests handle karega
  // 👉 Customization: dynamic variables options parameters customize karein
  updateTask(id: string, data: UpdateTaskPayload): Promise<Task>;

  // deleteTask: item delete request call mapping
  // 👉 Customization: parameters logic update match endpoint signatures
  deleteTask(id: string): Promise<{ message: string }>;
}

// 2. TaskService implementation: API Endpoints se response return karna (Clean & Optimal)
export const taskService: TaskService = {
  getTasks: (category) => 
    axiosInstance.get<Task[]>(ENDPOINTS.TASKS.LIST, { params: { category } }).then((res) => res.data),

  // New task create call
  createTask: (data) => 
    axiosInstance.post<Task>(ENDPOINTS.TASKS.CREATE, data).then((res) => res.data),

  // Single task details call
  getTaskDetail: (id) => 
    axiosInstance.get<Task>(ENDPOINTS.TASKS.DETAIL(id)).then((res) => res.data),

  // Task edit update call
  updateTask: (id, data) => 
    axiosInstance.put<Task>(ENDPOINTS.TASKS.UPDATE(id), data).then((res) => res.data),

  // Task delete call
  deleteTask: (id) => 
    axiosInstance.delete<{ message: string }>(ENDPOINTS.TASKS.DELETE(id)).then((res) => res.data),
};
