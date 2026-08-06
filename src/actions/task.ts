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

export async function createTask(data: taskType) {
  const userId = await getTaskUserId();
  const parsed = taskSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid task details"
    );
  }

  const { title, priority, dueDate } = parsed.data;
  const { _max } = await prisma.task.aggregate({
    where: { userId },
    _max: { order: true },
  });
  const order = (_max.order ?? -1) + 1;

  const task = await prisma.task.create({
    data: {
      title,
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

  const { title, priority, dueDate } = parsed.data;
  const task = await prisma.task.updateMany({
    where: { id, userId },
    data: {
      title,
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

  const columnTasks = await prisma.task.findMany({
    where: { userId },
    select: { id: true, status: true, order: true },
  });

  const moved = columnTasks.find((task) => task.id === taskId);

  if (!moved) {
    throw new Error("Task not found");
  }

  const remaining = columnTasks.filter((task) => task.id !== taskId);
  const columns: Record<taskStatusType, (typeof columnTasks)[number][]> = {
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  };

  for (const task of remaining) {
    columns[task.status as taskStatusType].push(task);
  }

  columns[parsedStatus.data].splice(
    Math.min(parsedIndex.data, columns[parsedStatus.data].length),
    0,
    { ...moved, status: parsedStatus.data }
  );

  const updates = (
    Object.entries(columns) as [taskStatusType, (typeof columnTasks)[number][]][]
  ).flatMap(([status, tasks]) =>
    tasks.map((task, index) =>
      prisma.task.update({
        where: { id: task.id },
        data: { status, order: index },
      })
    )
  );

  await prisma.$transaction(updates);

  revalidatePath("/dashboard");
}