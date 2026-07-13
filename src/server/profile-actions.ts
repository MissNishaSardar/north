"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import { headers } from "next/headers";
import { updateProfileSchema, type UpdateProfileSchema } from "@/lib/zodSchema";

export async function updateProfileAction(data: UpdateProfileSchema) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Unauthorized" };
    }

    const parsed = updateProfileSchema.parse(data);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.name,
        bio: parsed.bio || null,
        phone: parsed.phone ? parseInt(parsed.phone, 10) : null,
        countryCode: parsed.countryCode || null,
        hobby: parsed.hobby || null,
        gender: parsed.gender || null,
        education: parsed.education || null,
        dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
        location: parsed.location || null,
      },
    });

    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update profile";
    return { error: message };
  }
}
