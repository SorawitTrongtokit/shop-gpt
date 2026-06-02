import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = prisma
  ? betterAuth({
      database: prismaAdapter(prisma, {
        provider: "postgresql",
      }),
      emailAndPassword: {
        enabled: true,
      },
      trustedOrigins: [
        process.env.APP_URL ?? "http://localhost:3000",
        process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
      ],
    })
  : null;

export function isAdmin(email?: string | null) {
  return Boolean(
    email &&
      process.env.ADMIN_EMAIL &&
      email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase(),
  );
}
