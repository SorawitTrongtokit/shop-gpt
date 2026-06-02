"use client";

import { CreditCard, Info, QrCode, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { formatTHB, getVariant } from "@/lib/catalog";

const DEMO_ORDER_KEY = "primepass-demo-orders";

type CheckoutFields = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

function createLocalDemoOrder(fields: CheckoutFields, items: ReturnType<typeof useCart>["items"]) {
  const orderNumber = `PP-DEMO-${Date.now().toString().slice(-8)}`;
  const order = {
    orderNumber,
    createdAt: new Date().toISOString(),
    customerName: fields.customerName,
    customerEmail: fields.customerEmail,
    items,
  };
  const orders = JSON.parse(localStorage.getItem(DEMO_ORDER_KEY) ?? "[]");
  localStorage.setItem(DEMO_ORDER_KEY, JSON.stringify([order, ...orders]));
  return orderNumber;
}

export function CheckoutClient({
  databaseConfigured,
}: {
  databaseConfigured: boolean;
}) {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<CheckoutFields>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });
  const lines = items.flatMap((item) => {
    const found = getVariant(item.variantSlug);
    return found ? [{ ...item, ...found }] : [];
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    setError("");
    setIsSubmitting(true);
    try {
      if (!databaseConfigured) {
        const orderNumber = createLocalDemoOrder(fields, items);
        clear();
        router.push(`/checkout/success/${orderNumber}`);
        return;
      }
      const createResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...fields, items }),
      });

      if (createResponse.status === 401) {
        router.push("/login?next=/checkout");
        return;
      }
      if (createResponse.status === 503) {
        const orderNumber = createLocalDemoOrder(fields, items);
        clear();
        router.push(`/checkout/success/${orderNumber}`);
        return;
      }
      const created = await createResponse.json();
      if (!createResponse.ok) throw new Error(created.error);

      const confirmResponse = await fetch("/api/payments/demo/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderNumber: created.orderNumber }),
      });
      const confirmed = await confirmResponse.json();
      if (!confirmResponse.ok) throw new Error(confirmed.error);
      clear();
      router.push(`/checkout/success/${created.orderNumber}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!lines.length) {
    return (
      <div className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
        ไม่มีสินค้าในตะกร้า กรุณาเลือก Voucher ก่อนชำระเงิน
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_430px]">
      <div className="rounded-xl border border-line p-5 sm:p-8">
        <h1 className="text-3xl font-black tracking-[-0.04em]">ชำระเงิน</h1>
        <h2 className="mt-8 text-base font-black">ข้อมูลผู้ซื้อ</h2>
        <div className="mt-4 grid gap-4">
          {[
            ["customerName", "ชื่อ-นามสกุล", "กรอกชื่อ-นามสกุล"],
            ["customerEmail", "อีเมล", "กรอกอีเมล"],
            ["customerPhone", "เบอร์โทรศัพท์", "กรอกเบอร์โทรศัพท์"],
          ].map(([name, label, placeholder]) => (
            <label key={name} className="grid gap-2 text-sm font-bold">
              {label}
              <input
                required
                value={fields[name as keyof CheckoutFields]}
                onChange={(event) =>
                  setFields((current) => ({ ...current, [name]: event.target.value }))
                }
                placeholder={placeholder}
                type={name === "customerEmail" ? "email" : "text"}
                className="h-12 rounded-lg border border-line px-4 font-normal outline-none focus:border-brand"
              />
            </label>
          ))}
        </div>
        <h2 className="mt-8 text-base font-black">เลือกวิธีชำระเงิน</h2>
        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-4 rounded-lg border-2 border-brand bg-blue-50/60 p-4">
            <QrCode className="text-brand" />
            <div className="flex-1">
              <p className="font-black">PromptPay QR</p>
              <p className="mt-1 text-xs text-muted">สแกน QR เพื่อชำระเงิน</p>
            </div>
            <span className="size-4 rounded-full border-4 border-brand bg-white" />
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-line p-4 text-muted">
            <CreditCard />
            <div>
              <p className="font-black text-[#283653]">บัตรเครดิต / เดบิต</p>
              <p className="mt-1 text-xs">เตรียมพร้อมสำหรับ payment provider ใน production</p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-start gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm font-bold text-brand">
          <Info className="mt-0.5 shrink-0" size={17} />
          โหมดทดลอง: ระบบจะจำลองการชำระเงินสำเร็จ
        </div>
        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 flex h-13 w-full items-center justify-center rounded-lg bg-brand font-bold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {isSubmitting ? "กำลังดำเนินการ..." : `ยืนยันการชำระเงิน ${formatTHB(total)}`}
        </button>
      </div>
      <aside className="h-fit rounded-xl border border-line p-5 sm:p-8">
        <h2 className="text-2xl font-black">สรุปคำสั่งซื้อ</h2>
        <div className="mt-5 space-y-4">
          {lines.map(({ product, variant, quantity, variantSlug }) => (
            <div key={variantSlug} className="flex justify-between gap-4 text-sm">
              <span>
                {product.name} - {variant.label} × {quantity}
              </span>
              <span className="font-bold">{formatTHB(variant.price * quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between border-t border-line pt-5 text-xl font-black">
          <span>รวมทั้งหมด</span>
          <span>{formatTHB(total)}</span>
        </div>
        <div className="mt-7 flex gap-3 text-xs leading-5 text-muted">
          <ShieldCheck className="shrink-0 text-brand" size={20} />
          PrimePass จะไม่เปิดเผยข้อมูล Voucher ทางอีเมล
        </div>
      </aside>
    </form>
  );
}
