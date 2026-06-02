import { headers } from "next/headers";
import { auth, isAdmin } from "@/lib/auth";

export async function getSession() {
  if (!auth) return null;
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user.email)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
