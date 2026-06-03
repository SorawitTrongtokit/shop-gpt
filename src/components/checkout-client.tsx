"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, Loader2, QrCode, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { formatTHB, getVariant } from "@/lib/catalog";

export function CheckoutClient() {
  const router = useRouter();
  const { items, total, catalog } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const lines = items.flatMap((item) => {
    const found = getVariant(item.variantSlug, catalog);
    return found ? [{ ...item, ...found }] : [];
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    setError("");
    setIsSubmitting(true);
    try {
      const createResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (createResponse.status === 401) {
        router.push("/login?next=/checkout");
        return;
      }

      const created = await createResponse.json();
      if (!createResponse.ok) {
        throw new Error(created.error ?? "ไม่สามารถสร้างคำสั่งซื้อได้");
      }

      router.push(`/checkout/payment/${created.orderNumber}`);
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
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[1fr_430px]"
    >
      <div className="rounded-xl border border-line bg-white/50 p-5 backdrop-blur-sm sm:p-8">
        <h1 className="text-3xl font-black tracking-[-0.04em]">ชำระเงิน</h1>
        <h2 className="mt-8 text-base font-black">วิธีชำระเงิน</h2>
        <div className="mt-4 flex items-center gap-4 rounded-lg border-2 border-brand bg-blue-50/60 p-4">
          <QrCode className="text-brand" />
          <div className="flex-1">
            <p className="font-black">PromptPay QR เท่านั้น</p>
            <p className="mt-1 text-xs text-muted">
              ใช้ข้อมูลบัญชีที่ล็อกอินอยู่ ระบบจะสร้าง QR จากยอดรวมคำสั่งซื้อ
            </p>
          </div>
          <span className="size-4 rounded-full border-4 border-brand bg-white" />
        </div>
        <div className="mt-5 flex items-start gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm font-bold text-brand">
          <Info className="mt-0.5 shrink-0" size={17} />
          หลังเลือกวิธีชำระเงินแล้ว กรุณาสแกน QR และอัปโหลดสลิปภายในเวลาที่กำหนด
        </div>

        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="mt-5 flex h-13 w-full items-center justify-center rounded-lg bg-brand font-bold text-white transition-all hover:bg-brand-dark disabled:opacity-80"
        >
          <AnimatePresence mode="wait">
            {isSubmitting ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="animate-spin" size={20} /> กำลังสร้างคำสั่งซื้อ...
              </motion.div>
            ) : (
              <motion.div
                key="submit"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                สร้าง QR ชำระเงิน {formatTHB(total)}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <aside className="h-fit rounded-xl border border-line p-5 sm:p-8">
        <h2 className="text-2xl font-black">สรุปคำสั่งซื้อ</h2>
        <div className="mt-5 space-y-4">
          {lines.map(({ product, variant, quantity, variantSlug }) => (
            <div key={variantSlug} className="flex justify-between gap-4 text-sm">
              <span>
                {product.name} - {variant.label} x {quantity}
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
          PrimePass จะส่ง Voucher หลัง EasySlip ตรวจสอบสลิปสำเร็จ
        </div>
      </aside>
    </motion.form>
  );
}
