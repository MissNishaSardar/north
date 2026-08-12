"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import sharp from "sharp";
import prisma from "@/lib/dbClient/prisma";
import { auth } from "@/lib/auth";
import {
  changePasswordSchema,
  changePasswordType,
  deleteAccountSchema,
  deleteAccountType,
  profileSchema,
} from "@/lib/zodSchema";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export async function updateProfileName(name: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = profileSchema.safeParse({ name });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid name");
  }

  await auth.api.updateUser({
    headers: await headers(),
    body: { name: parsed.data.name },
  });

  revalidatePath("/profile");
}

export async function changeProfilePassword(data: changePasswordType) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = changePasswordSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid password");
  }

  await auth.api.changePassword({
    headers: await headers(),
    body: {
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
      revokeOtherSessions: true,
    },
  });
}

export async function deleteAccount(data: deleteAccountType) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = deleteAccountSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid password");
  }

  await auth.api.deleteUser({
    headers: await headers(),
    body: { password: parsed.data.password },
  });

  revalidatePath("/profile", "layout");
}

export async function uploadAvatar(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("No file provided");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error("Image must be 5MB or smaller");
  }

  const userId = session.user.id;
  const filename = `avatar-${userId}.jpg`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await sharp(buffer)
    .resize(256, 256)
    .jpeg({ quality: 97 })
    .toFile(`public/uploads/${filename}`);

  const version = Date.now();

  await prisma.user.update({
    where: { id: userId },
    data: { image: `/uploads/${filename}?v=${version}` },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
