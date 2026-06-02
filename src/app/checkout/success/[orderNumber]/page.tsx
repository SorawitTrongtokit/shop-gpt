import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { VoucherReveal } from "@/components/voucher-reveal";
import { Logo } from "@/components/ui/logo";
import { getAccessibleOrder } from "@/lib/order-queries";

export const metadata: Metadata = {
  title: "ชำระเงินสำเร็จ",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const suffix = orderNumber.slice(-4).toUpperCase();
  const isDemo = orderNumber.startsWith("PP-DEMO");
  const order = isDemo ? null : await getAccessibleOrder(orderNumber);
  if (!isDemo && !order) redirect(`/login?next=/checkout/success/${orderNumber}`);
  const vouchers = isDemo
    ? [{ id: "demo-voucher", masked: `XXXX-XXXX-${suffix}`, demoCode: `DEMO-${suffix}-PRIMEPASS` }]
    : order!.vouchers;
  return (
    <>
      <header className="border-b border-line">
        <div className="container-shell flex h-[74px] items-center">
          <Logo />
        </div>
      </header>
      <main className="container-shell max-w-3xl py-10 sm:py-16">
        <div className="flex items-center justify-between gap-2 text-xs font-bold text-muted sm:text-sm">
          <span>1 ตะกร้าสินค้า</span>
          <span className="h-px flex-1 bg-line" />
          <span>2 ชำระเงิน</span>
          <span className="h-px flex-1 bg-line" />
          <span className="text-brand">3 รับ Voucher</span>
        </div>
        <div className="mt-10 text-center">
          <CheckCircle2 className="mx-auto text-[#20b268]" size={72} strokeWidth={1.6} />
          <h1 className="mt-5 text-4xl font-black tracking-[-0.04em]">ชำระเงินสำเร็จ</h1>
          <p className="mt-3 text-muted">
            ขอบคุณสำหรับการสั่งซื้อ Voucher ของคุณพร้อมใช้งานแล้ว
          </p>
        </div>
        <section className="mt-8 rounded-xl border border-line p-5 sm:p-7">
          <p className="text-xs font-bold text-muted">หมายเลขคำสั่งซื้อ</p>
          <p className="mt-1 font-black">{orderNumber}</p>
          <h2 className="mt-7 text-xl font-black">Voucher ของคุณ</h2>
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
        </section>
        <Link
          href="/orders"
          className="mt-5 flex h-12 items-center justify-center rounded-lg bg-brand font-bold text-white"
        >
          ดูคำสั่งซื้อของฉัน
        </Link>
      </main>
    </>
  );
}
