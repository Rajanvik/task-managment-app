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
