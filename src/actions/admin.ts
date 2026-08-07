"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import prisma from "@/lib/dbClient/prisma";
import { auth } from "@/lib/auth";
import { banSchema, type banType } from "@/lib/zodSchema";

const requireAdmin = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return session;
};

const adminHeaders = async () => ({ headers: await headers() });

const getTarget = async (userId: string) => {
  const target = await prisma.user.findUnique({ where: { id: userId } });

  if (!target) {
    throw new Error("User not found");
  }

  return target;
};

const assertCanManage = async (target: {
  id: string;
  role: string | null;
}) => {
  const session = await requireAdmin();

  if (target.id === session.user.id) {
    throw new Error("You cannot modify your own account");
  }

  if (target.role === "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });

    if (adminCount <= 1) {
      throw new Error("Cannot modify the last admin");
    }
  }
};

const BAN_DURATION_SECONDS: Record<banType["duration"], number | undefined> = {
  permanent: undefined,
  "1d": 60 * 60 * 24,
  "7d": 60 * 60 * 24 * 7,
  "30d": 60 * 60 * 24 * 30,
};

export async function toggleUserRole(userId: string) {
  const target = await getTarget(userId);
  await assertCanManage(target);

  await auth.api.setRole({
    ...(await adminHeaders()),
    body: { userId, role: target.role === "admin" ? "user" : "admin" },
  });

  revalidatePath("/admin");
}

export async function unbanUser(userId: string) {
  await requireAdmin();
  await getTarget(userId);

  const request = await adminHeaders();
  await auth.api.unbanUser({ ...request, body: { userId } });

  revalidatePath("/admin");
}

export async function banUser(userId: string, data: banType) {
  const parsed = banSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("Invalid ban details");
  }

  const target = await getTarget(userId);
  await assertCanManage(target);

  const banExpiresIn = BAN_DURATION_SECONDS[parsed.data.duration];

  await auth.api.banUser({
    ...(await adminHeaders()),
    body: {
      userId,
      banReason: parsed.data.reason,
      ...(banExpiresIn !== undefined ? { banExpiresIn } : {}),
    },
  });

  revalidatePath("/admin");
}

export async function deleteUser(userId: string) {
  const target = await getTarget(userId);
  await assertCanManage(target);

  const request = await adminHeaders();
  await auth.api.removeUser({ ...request, body: { userId } });

  revalidatePath("/admin");
}
