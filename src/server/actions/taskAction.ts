"use server";

import { createTaskSchema, type CreateTaskType } from "@/lib/zodSchema";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type TaskActionResult =
  | { success: true; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createTaskAction(
  data: CreateTaskType,
): Promise<TaskActionResult> {
  try {
    // ── 1. Check authentication ────────────────────────────────────
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be signed in to create a task.",
      };
    }

    // ── 2. Validate input ──────────────────────────────────────────
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

    // ── 3. Create task in database ─────────────────────────────────
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

    // ── 4. Success — revalidate and redirect ──────────────────────
    revalidatePath("/tasks/create");
    redirect("/tasks/create");
  } catch (error) {
    // If redirect() was called, Next.js throws a special error — let it pass.
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
