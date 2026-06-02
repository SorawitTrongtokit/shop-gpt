import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrdersList } from "@/components/orders-list";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUserOrders } from "@/lib/order-queries";

export const metadata: Metadata = {
  title: "คำสั่งซื้อของฉัน",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const orders = await getCurrentUserOrders();
  if (orders === null) redirect("/login?next=/orders");
  return (
    <>
      <SiteHeader />
      <main className="container-shell min-h-[680px] py-10 sm:py-14">
        <h1 className="text-4xl font-black tracking-[-0.04em]">คำสั่งซื้อของฉัน</h1>
        <p className="mt-3 text-muted">
          ดูสถานะคำสั่งซื้อและกลับมาเปิด Voucher ของคุณได้ทุกเวลา
        </p>
        <OrdersList
          databaseOrders={orders.map((order) => ({
            orderNumber: order.orderNumber,
            createdAt: order.createdAt.toISOString(),
            itemCount: order._count.items,
            status: order.status,
          }))}
        />
      </main>
      <SiteFooter />
    </>
  );
}
