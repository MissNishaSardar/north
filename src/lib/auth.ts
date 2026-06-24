import prisma from "@/lib/database/dbClient";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  baseURL: "http://localhost:3000",
  emailAndPassword: { enabled: true },
  plugins: [nextCookies()],
});