"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import prisma from "@/lib/dbClient/prisma";
import { auth } from "@/lib/auth";

const requireAdmin = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return session;
};

const adminHeaders = async () => ({ headers: await headers() });

export async function toggleUserRole(userId: string) {
  await requireAdmin();

  const target = await prisma.user.findUnique({ where: { id: userId } });

  if (!target) {
    throw new Error("User not found");
  }

  await auth.api.setRole({
    ...(await adminHeaders()),
    body: { userId, role: target.role === "admin" ? "user" : "admin" },
  });

  revalidatePath("/admin");
}

export async function toggleBanStatus(userId: string) {
  await requireAdmin();

  const target = await prisma.user.findUnique({ where: { id: userId } });

  if (!target) {
    throw new Error("User not found");
  }

  const request = await adminHeaders();

  if (target.banned) {
    await auth.api.unbanUser({ ...request, body: { userId } });
  } else {
    await auth.api.banUser({ ...request, body: { userId } });
  }

  revalidatePath("/admin");
}
