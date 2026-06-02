import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { OrdersTable } from "@/components/admin/orders-table";
import { SummaryCards } from "@/components/admin/summary-cards";
import { formatTHB } from "@/lib/catalog";
import { getAdminOrders } from "@/lib/order-queries";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const orders = await getAdminOrders();
  return (
    <AdminShell title="ภาพรวม">
      <SummaryCards />
      <section className="mt-6">
        <h2 className="mb-4 text-lg font-black">รายการคำสั่งซื้อล่าสุด</h2>
        <OrdersTable
          rows={orders?.map((order) => ({
            number: order.orderNumber,
            customer: order.customerName,
            product: order.items[0]?.productName ?? "-",
            total: formatTHB(order.total),
            status:
              order.status === "PENDING_PAYMENT"
                ? "รอชำระเงิน"
                : order.status === "FULFILLED"
                  ? "ส่งแล้ว"
                  : order.status,
            date: order.createdAt.toLocaleDateString("th-TH"),
          }))}
        />
      </section>
    </AdminShell>
  );
}
