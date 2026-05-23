import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Retrieves a list of all tasks created by the authenticated user, including their subtasks (steps).
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create task
 *     description: Creates a new task with optional steps.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [title]
 *             properties:
 *               title: { type: string, example: "Buy groceries" }
 *               description: { type: string, example: "Milk, eggs, and bread" }
 *               status: { type: string, enum: [Pending, Completed], default: Pending }
 *               category: { type: string, enum: [Work, Personal, Urgent], default: Personal }
 *               dueDate: { type: string, format: date-time, example: "2026-12-31T23:59:59.000Z" }
 *               steps:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Buy milk", "Buy eggs"]
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Title is required
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

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const whereClause: any = { userId };
    if (category && category !== 'All') {
      whereClause.category = category;
    }

    // Fetch tasks along with their subtasks (steps) simply, casting to any to avoid compilation blockages
    const tasks = await (prisma as any).task.findMany({
      where: whereClause,
      include: {
        steps: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or missing token' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, status, category, dueDate, steps } = body;

    // Direct check for required title
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create task with nested steps, casting to any
    const task = await (prisma as any).task.create({
      data: {
        title,
        description: description || null,
        status: status || 'Pending',
        category: category || 'Personal',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
        steps: steps && Array.isArray(steps)
          ? {
              create: steps.map((st: any) => ({
                title: typeof st === 'string' ? st : st.title,
                completed: typeof st === 'string' ? false : !!st.completed,
              })),
            }
          : undefined,
      },
      include: {
        steps: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
