import { AdminShell } from "@/components/admin/admin-shell";
import { InventoryImport } from "@/components/admin/inventory-import";

export default function AdminInventoryPage() {
  return (
    <AdminShell title="คลัง Voucher">
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <InventoryImport />
        <aside className="rounded-xl border border-line bg-white p-5">
          <h2 className="font-black">Voucher ใกล้หมด</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="border-b border-line pb-4">
              <p className="font-bold">Netflix Gift Code</p>
              <p className="mt-1 text-red-600">คงเหลือ 5 ใบ</p>
            </div>
            <div>
              <p className="font-bold">Spotify Gift Card</p>
              <p className="mt-1 text-red-600">คงเหลือ 8 ใบ</p>
            </div>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
