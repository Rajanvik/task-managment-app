import { DashboardService } from "@/services/dashboard";
import { DashboardAnalytics } from "@/lib/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { TQueryOptions, TQueryReturnType } from "../../types/types";

/**
 * 🛠️ IDashboardDataHook Interface:
 * Jab aap read-only data fetch hooks banayein (jaise settings fetch, analytics charts, notifications list),
 * tab iss simple query-only interface pattern ko copy-paste karke use karein.
 *
 * 💡 Naya read-only module banate waqt niche likhi cheezein badlein:
 * 1. Hook function ka naam (jaise `useDashboardAnalytics` -> `useSettings`).
 * 2. Return data type customize karein (jaise `DashboardAnalytics` -> `SettingsData`).
 */
export interface IDashboardDataHook {
  // useDashboardAnalytics hook: analytics metadata fetch options mapping
  // 👉 Customization: <ResponseDataType> edit karein jab new read-only queries banayein
  useDashboardAnalytics: (
    options?: TQueryOptions<DashboardAnalytics>,
  ) => TQueryReturnType<DashboardAnalytics>;
}

// DashboardDataHook Object: Dashboard query implementations
export const DashboardDataHook: IDashboardDataHook = {
  // Dashboard Analytics data get karne ka query hook
  useDashboardAnalytics(options) {
    return useQuery({
      queryKey: ["dashboard"], // dashboard query index key cache identifiers hain
      queryFn: async () => await DashboardService.getAnalytics(), // direct call analytics metrics response
      ...options,
    });
  },
};
