import { AdminShell } from "@/components/admin/admin-shell";
import { OrdersTable } from "@/components/admin/orders-table";
import { formatTHB } from "@/lib/catalog";
import { getAdminOrders } from "@/lib/order-queries";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  return (
    <AdminShell title="จัดการคำสั่งซื้อ">
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
    </AdminShell>
  );
}
