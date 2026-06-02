import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (prisma) {
    const session = await getSession();
    if (!session?.user || !isAdmin(session.user.email)) {
      redirect("/login?next=/admin");
    }
  }
  return children;
}
