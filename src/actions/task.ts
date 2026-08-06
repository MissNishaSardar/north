"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import prisma from "@/lib/dbClient/prisma";
import { auth } from "@/lib/auth";
import { taskSchema, taskType } from "@/lib/zodSchema";

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