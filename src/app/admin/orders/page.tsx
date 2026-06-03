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
          status: getAdminOrderStatusLabel(order.status),
          date: order.createdAt.toLocaleDateString("th-TH"),
        }))}
      />
    </AdminShell>
  );
}

function getAdminOrderStatusLabel(status: string) {
  if (status === "PENDING_PAYMENT") return "รอชำระเงิน";
  if (status === "FULFILLED") return "ส่งแล้ว";
  if (status === "EXPIRED") return "หมดเวลา";
  if (status === "CANCELLED") return "ยกเลิก";
  if (status === "PAID") return "ชำระเงินแล้ว";
  return status;
}
