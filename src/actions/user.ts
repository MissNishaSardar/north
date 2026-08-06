"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import sharp from "sharp";
import prisma from "@/lib/dbClient/prisma";
import { auth } from "@/lib/auth";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

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

  await prisma.user.update({
    where: { id: userId },
    data: { image: `/uploads/${filename}` },
  });

  revalidatePath("/dashboard");
}
