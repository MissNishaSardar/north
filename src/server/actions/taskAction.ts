"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskType,
  type UpdateTaskType,
} from "@/lib/zodSchema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type TaskActionResult =
  | { success: true; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createTaskAction(
  data: CreateTaskType,
): Promise<TaskActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be signed in to create a task.",
      };
    }

    const parsed = createTaskSchema.safeParse(data);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};

      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }

      return {
        success: false,
        error: "Validation failed. Please check your input.",
        fieldErrors,
      };
    }

    const { title, description, priority, status, dueDate } = parsed.data;

    await prisma.task.create({
      data: {
        id: globalThis.crypto.randomUUID(),
        title,
        description: description ?? null,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: session.user.id,
      },
    });

    revalidatePath("/tasks");
    redirect("/tasks");
  } catch (error) {
    if (error instanceof Error && "digest" in error) {
      throw error;
    }

    console.error("createTaskAction error:", error);

    return {
      success: false,
      error: "Something went wrong while creating your task. Please try again.",
    };
  }
}

export async function getTasksAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];
  return prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTaskAction(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  return prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });
}

export async function deleteTaskAction(formData: FormData) {
  const id = formData.get("id") as string;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return;
  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!task) return;
  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function updateTaskAction(
  id: string,
  data: UpdateTaskType,
): Promise<TaskActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be signed in to update a task.",
      };
    }

    const existing = await prisma.task.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Task not found.",
      };
    }

    const parsed = updateTaskSchema.safeParse(data);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};

      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }

      return {
        success: false,
        error: "Validation failed. Please check your input.",
        fieldErrors,
      };
    }

    const { title, description, priority, status, dueDate } = parsed.data;

    await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description: description ?? null }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
      },
    });

    revalidatePath("/tasks");
    revalidatePath("/tasks/" + id);
    redirect(`/tasks/${id}` as never);
  } catch (error) {
    if (error instanceof Error && "digest" in error) {
      throw error;
    }

    console.error("updateTaskAction error:", error);

    return {
      success: false,
      error: "Something went wrong while updating your task. Please try again.",
    };
  }
}

export async function toggleTaskStatusAction(id: string, newStatus: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return;

  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!task) return;

  await prisma.task.update({
    where: { id },
    data: { status: newStatus },
  });

  revalidatePath("/tasks");
  revalidatePath("/tasks/" + id);
}
