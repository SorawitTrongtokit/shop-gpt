import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout-client";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "ชำระเงิน",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <header className="border-b border-line">
        <div className="container-shell flex h-[74px] items-center justify-between">
          <Logo />
          <span className="text-xs font-bold text-muted">ชำระเงินอย่างปลอดภัย</span>
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
        <CheckoutClient />
      </main>
    </>
  );
}
