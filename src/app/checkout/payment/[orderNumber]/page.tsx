import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PromptPayPaymentClient } from "@/components/promptpay-payment-client";
import { Logo } from "@/components/ui/logo";
import { getAccessibleOrder } from "@/lib/order-queries";
import { getPromptPayQrUrl } from "@/lib/payments";

export const metadata: Metadata = {
  title: "สแกน PromptPay QR",
  robots: { index: false, follow: false },
};

export default async function PromptPayPaymentPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getAccessibleOrder(orderNumber);
  if (!order) redirect(`/login?next=/checkout/payment/${orderNumber}`);
  if (order.status === "FULFILLED") redirect(`/checkout/success/${orderNumber}`);
  if (order.status !== "PENDING_PAYMENT") redirect(`/orders/${orderNumber}`);

  return (
    <>
      <header className="border-b border-line">
        <div className="container-shell flex h-[74px] items-center justify-between">
          <Logo />
          <span className="text-xs font-bold text-muted">PromptPay QR</span>
        </div>
      </header>
      <main className="container-shell py-9 sm:py-12">
        <div className="mx-auto mb-8 flex max-w-3xl items-center justify-between gap-2 text-xs font-bold text-muted sm:text-sm">
          <span>1 ตะกร้าสินค้า</span>
          <span className="h-px flex-1 bg-line" />
          <span className="text-brand">2 ชำระเงิน</span>
          <span className="h-px flex-1 bg-line" />
          <span>3 รับ Voucher</span>
        </div>
        <PromptPayPaymentClient
          orderNumber={order.orderNumber}
          total={order.total}
          reservationExpiry={order.reservationExpiry.toISOString()}
          qrUrl={getPromptPayQrUrl(order.total)}
          items={order.items.map((item) => ({
            productName: item.productName,
            variantName: item.variantName,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
          }))}
        />
      </main>
    </>
  );
}
