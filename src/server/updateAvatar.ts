"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import { headers } from "next/headers";
import sharp from "sharp";
import { writeFile, unlink, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export async function updateAvatarAction(
  file: File,
  prevImage: string | null | undefined,
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { isSuccess: false, message: "Unauthorized" };
    }

    if (!file || !file.type.startsWith("image/")) {
      return { isSuccess: false, message: "Invalid file type" };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { isSuccess: false, message: "File too large (max 5MB)" };
    }

    const userId = session.user.id;
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const processed = await sharp(buffer)
      .resize(256, 256, { fit: "cover", position: "center" })
      .webp({ quality: 80 })
      .toBuffer();

    const filename = `${userId}.webp`;
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, processed);

    if (prevImage) {
      const oldPath = path.join(
        process.cwd(),
        "public",
        prevImage.replace(/^\//, ""),
      );
      if (existsSync(oldPath) && oldPath !== filepath) {
        await unlink(oldPath);
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { image: `/uploads/avatars/${filename}` },
    });

    return { isSuccess: true, message: "Avatar updated!" };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to update avatar";
    return { isSuccess: false, message };
  }
}
