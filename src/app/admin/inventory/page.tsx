import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { InventoryManager } from "@/components/admin/inventory-manager";
import { getAdminInventoryData } from "@/lib/admin-inventory";

export const metadata: Metadata = {
  title: "คลัง Voucher",
  robots: { index: false, follow: false },
};

export default async function AdminInventoryPage() {
  const inventory = await getAdminInventoryData();
  return (
    <AdminShell title="คลัง Voucher">
      <InventoryManager data={inventory} />
    </AdminShell>
  );
}
