"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signUpAction(formData: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      },
      headers: await headers(),
    });

    if (!result.user) {
      return { error: "Registration failed" };
    }

    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Registration failed";
    return { error: message };
  }
}

export async function signInAction(formData: {
  email: string;
  password: string;
}) {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email: formData.email,
        password: formData.password,
      },
      headers: await headers(),
    });

    if (!result.user) {
      return { error: "Invalid credentials" };
    }

    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid credentials";
    return { error: message };
  }
}

export async function getSessionAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return { session, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return { session: null, error: message };
  }
}

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sign out failed";
    return { error: message };
  }
}

export async function requireAuthAction() {
  const { session } = await getSessionAction();
  if (!session) {
    redirect("/login");
  }
  return session;
}
