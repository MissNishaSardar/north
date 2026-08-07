"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/dbClient/prisma";
import { auth } from "@/lib/auth";
import {
  taskSchema,
  taskStatusSchema,
  taskStatusType,
  taskType,
} from "@/lib/zodSchema";

const getTaskUserId = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
};

const parseDueDate = (value: string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }

  return new Date(value);
};

const nullIfEmpty = (value: string | null | undefined): string | null =>
  value?.trim() ? value.trim() : null;

export async function createTask(data: taskType) {
  const userId = await getTaskUserId();
  const parsed = taskSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid task details"
    );
  }

  const { title, description, priority, dueDate } = parsed.data;
  const { _max } = await prisma.task.aggregate({
    where: { userId },
    _max: { order: true },
  });
  const order = (_max.order ?? -1) + 1;

  const task = await prisma.task.create({
    data: {
      title,
      description: nullIfEmpty(description),
      priority,
      dueDate: parseDueDate(dueDate),
      order,
      userId,
    },
  });

  revalidatePath("/dashboard");

  return task;
}

export async function updateTask(id: string, data: taskType) {
  const userId = await getTaskUserId();
  const parsed = taskSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid task details"
    );
  }

  const { title, description, priority, dueDate } = parsed.data;
  const task = await prisma.task.updateMany({
    where: { id, userId },
    data: {
      title,
      description: nullIfEmpty(description),
      priority,
      dueDate: parseDueDate(dueDate),
    },
  });

  if (task.count === 0) {
    throw new Error("Task not found");
  }

  revalidatePath("/dashboard");

  return prisma.task.findUniqueOrThrow({ where: { id } });
}

export async function deleteTask(id: string) {
  const userId = await getTaskUserId();

  const task = await prisma.task.deleteMany({
    where: { id, userId },
  });

  if (task.count === 0) {
    throw new Error("Task not found");
  }

  revalidatePath("/dashboard");
}

export async function updateTaskOrder(
  taskId: string,
  newStatus: taskStatusType,
  newIndex: number
) {
  const userId = await getTaskUserId();
  const parsedStatus = taskStatusSchema.safeParse(newStatus);
  const parsedIndex = z.number().int().min(0).safeParse(newIndex);

  if (!parsedStatus.success || !parsedIndex.success) {
    throw new Error("Invalid task position");
  }

  const moved = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true, status: true, order: true },
  });

  if (!moved) {
    throw new Error("Task not found");
  }

  const sourceStatus = moved.status as taskStatusType;
  const targetStatus = parsedStatus.data;
  const affectedStatuses = Array.from(new Set([sourceStatus, targetStatus]));

  const affectedTasks = await prisma.task.findMany({
    where: { userId, status: { in: affectedStatuses } },
    select: { id: true, status: true, order: true },
  });

  const columns: Record<taskStatusType, typeof affectedTasks> = {
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  };

  for (const task of affectedTasks) {
    if (task.id !== taskId) {
      columns[task.status as taskStatusType].push(task);
    }
  }

  const targetColumn = columns[targetStatus];
  targetColumn.splice(
    Math.min(parsedIndex.data, targetColumn.length),
    0,
    { ...moved, status: targetStatus }
  );

  const updates = affectedStatuses.flatMap((status) =>
    columns[status].map((task, index) =>
      prisma.task.update({
        where: { id: task.id },
        data:
          task.id === taskId
            ? { status, order: index }
            : { order: index },
      })
    )
  );

  await prisma.$transaction(updates);

  revalidatePath("/dashboard");
}