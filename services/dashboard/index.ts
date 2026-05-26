import { ENDPOINTS } from "@/constants/api/endpoints";
import { axiosInstance } from "@/lib/axios-instance";

import { DashboardAnalytics } from "@/lib/types/dashboard";

/**
 * 🛠️ DashboardService Interface:
 * Read-only analytics, info metadata lists or metrics values key mappings fetch interfaces reuse pattern.
 *
 * 💡 Naya analytics/settings service interface file design karein tab niche change karein:
 * 1. Interface name replace update (jaise `DashboardService` -> `NotificationService`).
 * 2. Return payload method type signature setup (`getAnalytics(): Promise<DashboardAnalytics>` -> `getUnreadCount(): Promise<number>`).
 */
export interface IDashboardService {
  // getAnalytics: read-only statistics payload retrieve call
  // 👉 Customization: <ResponseDataType> edit details check parameters endpoints
  getAnalytics: () => Promise<DashboardAnalytics>;
}

// 2. DashboardService implementation: dashboard endpoints call karna (Clean & Optimal)
export const DashboardService: IDashboardService = {
  // Dashboard page analytics numbers get query (Directly return response data promise)
  async getAnalytics() {
    const response = await axiosInstance.get<DashboardAnalytics>(
      ENDPOINTS.DASHBOARD.ANALYTICS,
    );
    return response.data;
  },
};
