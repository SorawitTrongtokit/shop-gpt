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
  const isExpired =
    !isDemo && order!.status === "PENDING_PAYMENT" && order!.reservationExpiry < new Date();
  const status = isDemo ? "FULFILLED" : isExpired ? "EXPIRED" : order!.status;
  const vouchers = isDemo
    ? [{ id: "demo-voucher", masked: `XXXX-XXXX-${suffix}`, demoCode: `DEMO-${suffix}-PRIMEPASS` }]
    : status === "FULFILLED"
      ? order!.vouchers
      : [];
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
            <span
              className={`h-fit rounded-full px-3 py-1 text-xs font-black ${getOrderStatusClassName(
                status,
              )}`}
            >
              {getOrderStatusLabel(status)}
            </span>
          </div>
          {status === "FULFILLED" ? (
            <>
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
            </>
          ) : (
            <div className="mt-6 rounded-xl bg-amber-50 p-5 text-sm leading-6 text-amber-800">
              <h2 className="text-lg font-black">{getOrderStatusLabel(status)}</h2>
              <p className="mt-2">{getOrderStatusDescription(status)}</p>
              {status === "PENDING_PAYMENT" && (
                <Link
                  href={`/checkout/payment/${orderNumber}`}
                  className="mt-4 inline-flex h-11 items-center rounded-lg bg-brand px-5 font-bold text-white"
                >
                  ไปชำระเงิน
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function getOrderStatusLabel(status: string) {
  if (status === "PENDING_PAYMENT") return "รอชำระเงิน";
  if (status === "FULFILLED") return "ส่ง Voucher แล้ว";
  if (status === "EXPIRED") return "หมดเวลา";
  if (status === "CANCELLED") return "ยกเลิกแล้ว";
  if (status === "PAID") return "ชำระเงินแล้ว";
  return status;
}

function getOrderStatusClassName(status: string) {
  if (status === "PENDING_PAYMENT") return "bg-amber-50 text-amber-700";
  if (status === "FULFILLED") return "bg-green-50 text-[#13915b]";
  if (status === "EXPIRED" || status === "CANCELLED") return "bg-red-50 text-red-700";
  return "bg-blue-50 text-brand";
}

function getOrderStatusDescription(status: string) {
  if (status === "PENDING_PAYMENT") {
    return "กรุณาสแกน PromptPay QR และอัปโหลดสลิปเพื่อรับ Voucher";
  }
  if (status === "EXPIRED") {
    return "คำสั่งซื้อนี้หมดเวลาแล้ว กรุณาสร้างคำสั่งซื้อใหม่";
  }
  return "คำสั่งซื้อนี้ยังไม่พร้อมแสดง Voucher";
}
