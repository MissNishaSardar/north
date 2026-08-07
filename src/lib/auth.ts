import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import prisma from "./dbClient/prisma";
import { serverEnv } from "./env/serverEnv";

const audit = (event: string, details: Record<string, unknown>) => {
  console.log(`[audit] ${event}`, JSON.stringify(details));
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  baseURL: serverEnv.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`[auth] Password reset for ${user.email}: ${url}`);
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/api/auth/sign-in/email": { window: 60, max: 5 },
      "/api/auth/sign-up/email": { window: 60, max: 3 },
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          audit("session.created", { userId: session.userId, sessionId: session.id });
        },
      },
      delete: {
        before: async (session) => {
          audit("session.deleted", { sessionId: session.id });
        },
      },
    },
    user: {
      update: {
        after: async (user) => {
          audit("user.updated", {
            userId: user.id,
            role: user.role,
            banned: user.banned,
          });
        },
      },
    },
  },
  plugins: [admin(), nextCookies()],
});
