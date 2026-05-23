import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// Define local constants to avoid stale client compilation errors before schema migration
const Status = {
  Pending: 'Pending',
  Completed: 'Completed',
} as const;

const Category = {
  Work: 'Work',
  Personal: 'Personal',
  Urgent: 'Urgent',
} as const;

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard analytics
 *     description: Returns aggregated task statistics, status distributions, category breakdowns, subtask progress, and recent activity over time for the authenticated user.
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or missing token' }, { status: 401 });
    }

    // 1. Fetch all tasks and subtasks (steps) for the user, casting as any to bypass stale types
    const tasks = (await (prisma as any).task.findMany({
      where: { userId },
      include: { steps: true },
    })) as any[];

    const totalTasks = tasks.length;

    // Status counts
    let pendingCount = 0;
    let completedCount = 0;

    // Category counts
    let workCount = 0;
    let personalCount = 0;
    let urgentCount = 0;

    // Subtask (steps) counts
    let totalSubtasks = 0;
    let completedSubtasks = 0;

    // Overdue count
    let overdueCount = 0;
    const now = new Date();

    tasks.forEach((task) => {
      // Status counting
      if (task.status === Status.Pending) pendingCount++;
      else if (task.status === Status.Completed) completedCount++;

      // Category counting
      if (task.category === Category.Work) workCount++;
      else if (task.category === Category.Personal) personalCount++;
      else if (task.category === Category.Urgent) urgentCount++;

      // Subtasks (steps) counting
      if (task.steps && Array.isArray(task.steps)) {
        totalSubtasks += task.steps.length;
        completedSubtasks += task.steps.filter((st: any) => st.completed).length;
      }

      // Overdue check (only tasks that are not completed and are past their due date)
      if (task.status !== Status.Completed && task.dueDate && new Date(task.dueDate) < now) {
        overdueCount++;
      }
    });

    const taskCompletionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    const subtaskCompletionRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    // 2. Fetch task activity for the last 7 days (including today)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentTasks = (await (prisma as any).task.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    })) as any[];

    // Initialize chronological map for 7 days
    const activityMap = new Map<string, { created: number; completed: number }>();
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      activityMap.set(dateString, { created: 0, completed: 0 });
    }

    recentTasks.forEach((task) => {
      const dateString = task.createdAt.toISOString().split('T')[0];
      if (activityMap.has(dateString)) {
        const stats = activityMap.get(dateString)!;
        stats.created += 1;
        if (task.status === Status.Completed) {
          stats.completed += 1;
        }
        activityMap.set(dateString, stats);
      }
    });

    // Convert map to sorted array in chronological order (oldest to newest)
    const activityStats = Array.from(activityMap.entries())
      .map(([date, stats]) => ({
        date,
        created: stats.created,
        completed: stats.completed,
      }))
      .reverse();

    // 3. Construct and return analytics payload
    return NextResponse.json({
      summary: {
        totalTasks,
        completedTasks: completedCount,
        pendingTasks: pendingCount,
        overdueTasks: overdueCount,
        taskCompletionRate,
      },
      statusDistribution: {
        Pending: pendingCount,
        Completed: completedCount,
      },
      categoryDistribution: {
        Work: workCount,
        Personal: personalCount,
        Urgent: urgentCount,
      },
      subtaskAnalytics: {
        totalSubtasks,
        completedSubtasks,
        subtaskCompletionRate,
      },
      activityOverTime: activityStats,
    });
  } catch (error) {
    console.error('Fetch dashboard analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred while retrieving dashboard analytics' },
      { status: 500 }
    );
  }
}
