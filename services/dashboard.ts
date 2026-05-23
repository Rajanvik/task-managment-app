import { axiosInstance } from '@/lib/axios-instance';
import { ENDPOINTS } from '@/api/endpoints';

// 1. Dashboard analytics structures typings mapping
export interface DashboardAnalytics {
  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    taskCompletionRate: number;
  };
  statusDistribution: {
    Pending: number;
    Completed: number;
  };
  categoryDistribution: {
    Work: number;
    Personal: number;
    Urgent: number;
  };
  subtaskAnalytics: {
    totalSubtasks: number;
    completedSubtasks: number;
    subtaskCompletionRate: number;
  };
  activityOverTime: Array<{
    date: string;
    created: number;
    completed: number;
  }>;
}

/**
 * 🛠️ DashboardService Interface:
 * Read-only analytics, info metadata lists or metrics values key mappings fetch interfaces reuse pattern.
 * 
 * 💡 Naya analytics/settings service interface file design karein tab niche change karein:
 * 1. Interface name replace update (jaise `DashboardService` -> `NotificationService`).
 * 2. Return payload method type signature setup (`getAnalytics(): Promise<DashboardAnalytics>` -> `getUnreadCount(): Promise<number>`).
 */
export interface DashboardService {
  // getAnalytics: read-only statistics payload retrieve call
  // 👉 Customization: <ResponseDataType> edit details check parameters endpoints
  getAnalytics(): Promise<DashboardAnalytics>;
}

// 2. DashboardService implementation: dashboard endpoints call karna (Clean & Optimal)
export const dashboardService: DashboardService = {
  // Dashboard page analytics numbers get query (Directly return response data promise)
  getAnalytics: () => 
    axiosInstance.get<DashboardAnalytics>(ENDPOINTS.DASHBOARD.ANALYTICS).then((res) => res.data),
};
