import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { VoucherReveal } from "@/components/voucher-reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAccessibleOrder } from "@/lib/order-queries";

export const metadata: Metadata = {
  title: "รายละเอียดคำสั่งซื้อ",
  robots: { index: false, follow: false },
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const suffix = orderNumber.slice(-4).toUpperCase();
  const isDemo = orderNumber.startsWith("PP-DEMO");
  const order = isDemo ? null : await getAccessibleOrder(orderNumber);
  if (!isDemo && !order) redirect(`/login?next=/orders/${orderNumber}`);
  const vouchers = isDemo
    ? [{ id: "demo-voucher", masked: `XXXX-XXXX-${suffix}`, demoCode: `DEMO-${suffix}-PRIMEPASS` }]
    : order!.vouchers;
  return (
    <>
      <SiteHeader />
      <main className="container-shell min-h-[680px] max-w-4xl py-10 sm:py-14">
        <Link href="/orders" className="text-sm font-bold text-brand">
          ← กลับไปที่คำสั่งซื้อ
        </Link>
        <h1 className="mt-5 text-4xl font-black tracking-[-0.04em]">
          รายละเอียดคำสั่งซื้อ
        </h1>
        <section className="mt-8 rounded-xl border border-line p-5 sm:p-7">
          <div className="flex flex-wrap justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="text-xs font-bold text-muted">หมายเลขคำสั่งซื้อ</p>
              <p className="mt-1 font-black">{orderNumber}</p>
            </div>
            <span className="h-fit rounded-full bg-green-50 px-3 py-1 text-xs font-black text-[#13915b]">
              ส่ง Voucher แล้ว
            </span>
          </div>
          <h2 className="mt-6 text-xl font-black">Voucher ของคุณ</h2>
          <div className="mt-4 grid gap-3">
            {vouchers.map((voucher) => (
              <VoucherReveal
                key={voucher.id}
                orderNumber={orderNumber}
                voucherId={voucher.id}
                masked={voucher.masked}
                demoCode={"demoCode" in voucher ? voucher.demoCode : undefined}
              />
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">
            เพื่อความปลอดภัย ระบบจะแสดง Voucher แบบปกปิดจนกว่าคุณจะกดแสดงโค้ด
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
