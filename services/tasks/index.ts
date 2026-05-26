import { ENDPOINTS } from "@/constants/api/endpoints";
import { axiosInstance } from "@/lib/axios-instance";

import { SubTask, Task, CreateTask, UpdateTask } from "@/lib/types/tasks";

/**
 * 🛠️ TaskService Interface:
 * Jab aap CRUD operations ke API Service files banayein (jaise CategoryService, StepService),
 * tab iss standard mapping schema interface copy-paste karke utilize karein.
 *
 * 💡 Naya CRUD module banate waqt isme niche likhe edit karein:
 * 1. Interface name replace karein (jaise `TaskService` -> `AddressService`).
 * 2. Parameters signature updates:
 *    - `getTasks(): Promise<Task[]>` -> `getAddresses(): Promise<Address[]>`
 *    - `createTask(data: CreateTask): Promise<Task>` -> `createAddress(data: CreateAddressPayload): Promise<Address>`
 *    - `updateTask(id: string, data: UpdateTask): Promise<Task>` -> `updateAddress(id: string, data: UpdateAddressPayload): Promise<Address>`
 */
export interface ITaskService {
  // getTasks: users ke list fetch karega
  // 👉 Customization: <ResponseData[]> define karein
  getTasks: (data?: { category?: string }) => Promise<Task[]>;

  // createTask: new items backend post payload submit karega
  // 👉 Customization: payload aur return response type customize karein
  createTask: (data: CreateTask) => Promise<Task>;

  // getTaskDetail: single detail mapping query triggered call
  // 👉 Customization: parameter id match details configure karein
  getTaskDetail: (data: { id: string }) => Promise<Task>;

  // updateTask: update changes requests handle karega
  // 👉 Customization: dynamic variables options parameters customize karein
  updateTask: (data: { id: string; data: UpdateTask }) => Promise<Task>;

  // deleteTask: item delete request call mapping
  // 👉 Customization: parameters logic update match endpoint signatures
  deleteTask: (data: { id: string }) => Promise<{ message: string }>;
}

// 2. TaskService implementation: API Endpoints se response return karna (Clean & Optimal)
export const TaskService: ITaskService = {
  async getTasks(data) {
    const response = await axiosInstance.get<Task[]>(ENDPOINTS.TASKS.LIST, {
      params: { category: data?.category },
    });
    return response.data;
  },

  // New task create call
  async createTask(data) {
    const response = await axiosInstance.post<Task>(
      ENDPOINTS.TASKS.CREATE,
      data,
    );
    return response.data;
  },

  // Single task details call
  async getTaskDetail(data) {
    const response = await axiosInstance.get<Task>(
      ENDPOINTS.TASKS.DETAIL(data.id),
    );
    return response.data;
  },

  // Task edit update call
  async updateTask(data) {
    const response = await axiosInstance.put<Task>(
      ENDPOINTS.TASKS.UPDATE(data.id),
      data.data,
    );
    return response.data;
  },

  // Task delete call
  async deleteTask(data) {
    const response = await axiosInstance.delete<{ message: string }>(
      ENDPOINTS.TASKS.DELETE(data.id),
    );
    return response.data;
  },
};
