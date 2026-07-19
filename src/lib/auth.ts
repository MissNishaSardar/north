import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/database/dbClient";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ token }) => {
      const callbackURL = `${process.env.BETTER_AUTH_URL}/reset-password`;
      const url = `${process.env.BETTER_AUTH_URL}/api/auth/reset-password/${token}?callbackURL=${encodeURIComponent(callbackURL)}`;
      if (process.env.NODE_ENV === "development") {
        console.log(`\n[Password Reset] Link: ${url}\n`);
      }
    },
  },
});

