"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import { headers } from "next/headers";
import { createTaskSchema, type CreateTaskSchema } from "@/lib/zodSchema";

export async function createTaskAction(data: CreateTaskSchema) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { task: null, error: "Unauthorized" };
    }

    const parsed = createTaskSchema.parse(data);

    const task = await prisma.task.create({
      data: {
        title: parsed.title,
        description: parsed.description ?? null,
        status: parsed.status,
        priority: parsed.priority,
        dueDate:
          parsed.dueDate ?
            new Date(`${parsed.dueDate}T${parsed.dueTime ?? "00:00"}:00`)
          : null,
        userId: session.user.id,
      },
    });

    return { task, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create task";
    return { task: null, error: message };
  }
}

export async function getTasksAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { tasks: [], error: "Unauthorized" };
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        NOT: {
          dueDate: { lte: new Date() },
          status: { notIn: ["done", "cancelled"] },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { tasks, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch tasks";
    return { tasks: [], error: message };
  }
}

export async function updateTaskAction(id: string, data: CreateTaskSchema) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { task: null, error: "Unauthorized" };
    }

    const existing = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return { task: null, error: "Task not found" };
    }

    const parsed = createTaskSchema.parse(data);

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: parsed.title,
        description: parsed.description ?? null,
        status: parsed.status,
        priority: parsed.priority,
        dueDate:
          parsed.dueDate ?
            new Date(`${parsed.dueDate}T${parsed.dueTime ?? "00:00"}:00`)
          : null,
      },
    });

    return { task, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update task";
    return { task: null, error: message };
  }
}

export async function getTaskByIdAction(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { task: null, error: "Unauthorized" };
    }

    const task = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!task) {
      return { task: null, error: "Task not found" };
    }

    return { task, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch task";
    return { task: null, error: message };
  }
}

export async function updateTaskStatusAction(id: string, status: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Unauthorized" };
    }

    const existing = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return { error: "Task not found" };
    }

    await prisma.task.update({
      where: { id },
      data: { status },
    });

    return { error: null };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to update task status";
    return { error: message };
  }
}

export async function getCompletedTasksAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { tasks: [], error: "Unauthorized" };
    }

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { status: "done", updatedAt: { lte: twoDaysAgo } },
          { dismissedAt: { not: null } },
        ],
      },
      orderBy: { updatedAt: "desc" },
    });

    return { tasks, error: null };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to fetch task history";
    return { tasks: [], error: message };
  }
}

export async function getExpiredTasksAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { tasks: [], error: "Unauthorized" };
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        dueDate: { lte: new Date() },
        status: { notIn: ["done", "cancelled"] },
        dismissedAt: null,
      },
      orderBy: { dueDate: "asc" },
    });

    return { tasks, error: null };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to fetch expired tasks";
    return { tasks: [], error: message };
  }
}

export async function extendTaskDueDateAction(id: string, dueDate: Date) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { task: null, error: "Unauthorized" };
    }

    const existing = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return { task: null, error: "Task not found" };
    }

    const task = await prisma.task.update({
      where: { id },
      data: { dueDate },
    });

    return { task, error: null };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to extend deadline";
    return { task: null, error: message };
  }
}

export async function cancelTaskAction(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Unauthorized" };
    }

    const existing = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return { error: "Task not found" };
    }

    await prisma.task.update({
      where: { id },
      data: { status: "cancelled" },
    });

    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to cancel task";
    return { error: message };
  }
}

export async function dismissOverdueTaskAction(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Unauthorized" };
    }

    const existing = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return { error: "Task not found" };
    }

    await prisma.task.update({
      where: { id },
      data: { dismissedAt: new Date() },
    });

    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to dismiss task";
    return { error: message };
  }
}

export async function deleteTaskAction(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Unauthorized" };
    }

    const existing = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return { error: "Task not found" };
    }

    await prisma.task.delete({
      where: { id },
    });

    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete task";
    return { error: message };
  }
}
