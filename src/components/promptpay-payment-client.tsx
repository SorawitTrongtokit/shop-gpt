"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Ban, CheckCircle2, Clock3, Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { formatTHB } from "@/lib/catalog";

type PaymentLine = {
  productName: string;
  variantName: string;
  quantity: number;
  lineTotal: number;
};

export function PromptPayPaymentClient({
  orderNumber,
  total,
  reservationExpiry,
  qrUrl,
  items,
}: {
  orderNumber: string;
  total: number;
  reservationExpiry: string;
  qrUrl: string;
  items: PaymentLine[];
}) {
  const router = useRouter();
  const { clear } = useCart();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const expiresAt = useMemo(
    () => new Date(reservationExpiry).getTime(),
    [reservationExpiry],
  );
  const remainingMs = Math.max(0, expiresAt - now);
  const isExpired = remainingMs <= 0;
  const remainingLabel = formatRemaining(remainingMs);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || isExpired || isCancelling) return;
    setError("");
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("orderNumber", orderNumber);
      formData.append("slipImage", file);

      const response = await fetch("/api/payments/promptpay/verify-slip", {
        method: "POST",
        body: formData,
      });
      if (response.status === 401) {
        router.push(`/login?next=/checkout/payment/${orderNumber}`);
        return;
      }
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "ไม่สามารถตรวจสอบสลิปได้");
      }
      clear();
      router.push(`/checkout/success/${result.orderNumber}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel() {
    if (isSubmitting || isCancelling) return;
    const confirmed = window.confirm(
      "ยกเลิกการทำรายการนี้? ระบบจะคืน stock ที่จองไว้กลับเข้าร้าน",
    );
    if (!confirmed) return;

    setError("");
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/orders/${orderNumber}/cancel`, {
        method: "POST",
      });
      if (response.status === 401) {
        router.push(`/login?next=/checkout/payment/${orderNumber}`);
        return;
      }
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "ยกเลิกการทำรายการไม่สำเร็จ");
      }
      router.push("/cart");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[430px_1fr]">
      <section className="h-fit rounded-xl border border-line p-5 text-center sm:p-7">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-50 text-brand">
          <CheckCircle2 size={24} />
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">
          สแกน PromptPay QR
        </h1>
        <p className="mt-2 text-sm text-muted">ยอดชำระ {formatTHB(total)}</p>
        <div className="mt-5 rounded-xl border border-line bg-white p-4">
          <Image
            src={qrUrl}
            alt={`PromptPay QR สำหรับคำสั่งซื้อ ${orderNumber}`}
            width={360}
            height={360}
            priority
            className="mx-auto aspect-square w-full max-w-[360px] object-contain"
          />
        </div>
        <p className="mt-4 font-black">{orderNumber}</p>
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
          <Clock3 size={17} />
          เหลือเวลา {remainingLabel}
        </div>
      </section>

      <section className="rounded-xl border border-line p-5 sm:p-8">
        <h2 className="text-2xl font-black">อัปโหลดสลิป</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          หลังโอนเงินแล้ว อัปโหลดรูปสลิปธนาคาร ระบบจะตรวจยอดกับ EasySlip และส่ง
          Voucher ให้ทันทีเมื่อผ่านการตรวจสอบ
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid min-h-40 cursor-pointer place-items-center rounded-xl border border-dashed border-line px-5 py-8 text-center transition-colors hover:border-brand">
            <UploadCloud className="text-brand" size={34} />
            <span className="mt-3 font-black">
              {file ? file.name : "เลือกรูปสลิป"}
            </span>
            <span className="mt-1 text-xs text-muted">JPEG, PNG, GIF หรือ WebP ไม่เกิน 4 MB</span>
            <input
              required
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="sr-only"
              disabled={isSubmitting || isCancelling}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>

          {error && <p className="text-sm font-bold text-red-600">{error}</p>}
          {isExpired && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              คำสั่งซื้อนี้หมดเวลาแล้ว กรุณาสร้างคำสั่งซื้อใหม่
            </p>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!file || isSubmitting || isCancelling || isExpired}
            className="flex h-13 items-center justify-center rounded-lg bg-brand font-bold text-white transition-all hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="animate-spin" size={20} /> กำลังตรวจสลิป...
                </motion.span>
              ) : (
                <motion.span
                  key="ready"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                >
                  ตรวจสลิปและรับ Voucher
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={isSubmitting || isCancelling}
            onClick={handleCancel}
            className="flex h-12 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white font-bold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCancelling ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                กำลังยกเลิก...
              </>
            ) : (
              <>
                <Ban size={18} />
                ยกเลิกการทำรายการ
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 border-t border-line pt-6">
          <h3 className="font-black">รายการสินค้า</h3>
          <div className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <div
                key={`${item.productName}-${item.variantName}`}
                className="flex justify-between gap-4"
              >
                <span>
                  {item.productName} - {item.variantName} x {item.quantity}
                </span>
                <span className="font-bold">{formatTHB(item.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-line pt-5 text-xl font-black">
            <span>รวมทั้งหมด</span>
            <span>{formatTHB(total)}</span>
          </div>
        </div>

        <Link
          href="/orders"
          className="mt-6 inline-flex text-sm font-bold text-brand"
        >
          กลับไปดูคำสั่งซื้อของฉัน
        </Link>
      </section>
    </div>
  );
}

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
