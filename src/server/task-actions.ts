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
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
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
      where: { userId: session.user.id },
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
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
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
