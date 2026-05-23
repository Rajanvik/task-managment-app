import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task details
 *     description: Retrieves the detailed configuration and step list for a specific task.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task UUID
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Task does not belong to this user)
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update task
 *     description: Modifies attributes of a task and overrides the existing step list using delete-then-insert execution.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               title: { type: string, example: "Buy groceries (Updated)" }
 *               description: { type: string, example: "Milk, eggs, bread, and fruits" }
 *               status: { type: string, enum: [Pending, Completed] }
 *               category: { type: string, enum: [Work, Personal, Urgent] }
 *               dueDate: { type: string, format: date-time }
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title: { type: string }
 *                     completed: { type: boolean }
 *                 example: [{ title: "Buy milk", completed: true }, { title: "Buy bread", completed: false }]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete task
 *     description: Permanently deletes a task and all associated steps from the system.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task UUID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or missing token' }, { status: 401 });
    }

    const { id } = params;

    // Fetch the task by ID with its steps, casting prisma to any
    const task = await (prisma as any).task.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Access control: Ensure task belongs to the user
    if (task.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or missing token' }, { status: 401 });
    }

    const { id } = params;

    // Find existing task
    const task = await (prisma as any).task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Access control
    if (task.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, status, category, dueDate, steps } = body;

    // 1. If steps are specified in the payload, clear old ones first
    if (steps !== undefined && Array.isArray(steps)) {
      await (prisma as any).subtask.deleteMany({
        where: { taskId: id },
      });
    }

    // 2. Update task details and insert new steps simply, casting prisma to any
    const updatedTask = await (prisma as any).task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        status: status !== undefined ? status : undefined,
        category: category !== undefined ? category : undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        steps: steps !== undefined && Array.isArray(steps)
          ? {
              create: steps.map((st: any) => ({
                title: typeof st === 'string' ? st : st.title,
                completed: typeof st === 'string' ? false : !!st.completed,
              })),
            }
          : undefined,
      },
      include: {
        steps: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or missing token' }, { status: 401 });
    }

    const { id } = params;

    // Find existing task
    const task = await (prisma as any).task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Access control
    if (task.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete task simply, casting prisma to any
    await (prisma as any).task.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
