"use client";

import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { formatTHB, getVariant } from "@/lib/catalog";

export function CartPage() {
  const { items, total, updateItem, removeItem } = useCart();
  const lines = items.flatMap((item) => {
    const found = getVariant(item.variantSlug);
    return found ? [{ ...item, ...found }] : [];
  });

  return (
    <main className="container-shell min-h-[680px] py-9 sm:py-14">
      <p className="text-sm text-muted">หน้าแรก / ตะกร้าสินค้า</p>
      <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
        ตะกร้าสินค้า
      </h1>
      <p className="mt-3 text-muted">
        ตรวจสอบรายการสินค้าและจำนวนที่ต้องการสั่งซื้อก่อนดำเนินการชำระเงิน
      </p>
      {!lines.length ? (
        <div className="mt-12 rounded-xl border border-dashed border-line py-20 text-center">
          <p className="font-bold text-muted">ตะกร้าของคุณยังว่างอยู่</p>
          <Link
            href="/products"
            className="mt-5 inline-flex h-11 items-center rounded-lg bg-brand px-5 text-sm font-bold text-white"
          >
            เลือกซื้อ Voucher
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-9 lg:grid-cols-[1fr_410px]">
          <div>
            {lines.map(({ product, variant, quantity, variantSlug }) => (
              <article
                key={variantSlug}
                className="grid grid-cols-[112px_1fr] gap-4 border-b border-line py-6 sm:grid-cols-[180px_1fr_auto]"
              >
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={360}
                  height={225}
                  className="aspect-[16/10] w-full rounded-xl object-cover"
                />
                <div>
                  <h2 className="font-black sm:text-xl">{product.name}</h2>
                  <p className="mt-2 text-sm text-muted">{variant.label}</p>
                  <div className="mt-5 flex w-32 items-center justify-between rounded-lg border border-line px-3 py-2">
                    <button
                      type="button"
                      onClick={() => updateItem(variantSlug, quantity - 1)}
                      aria-label="ลดจำนวน"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-black">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateItem(variantSlug, quantity + 1)}
                      aria-label="เพิ่มจำนวน"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:flex-col sm:items-end">
                  <span className="text-lg font-black">{formatTHB(variant.price * quantity)}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(variantSlug)}
                    className="flex items-center gap-1 text-sm text-muted hover:text-red-600"
                  >
                    <Trash2 size={15} /> ลบ
                  </button>
                </div>
              </article>
            ))}
            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-brand"
            >
              <ArrowLeft size={17} /> เลือกซื้อสินค้าต่อ
            </Link>
          </div>
          <aside className="h-fit rounded-xl border border-line p-6 sm:p-8">
            <h2 className="text-2xl font-black">สรุปคำสั่งซื้อ</h2>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">ยอดรวมสินค้า ({lines.length} รายการ)</dt>
                <dd className="font-bold">{formatTHB(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">ส่วนลด</dt>
                <dd className="font-bold">{formatTHB(0)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-5 text-xl">
                <dt className="font-black">ยอดรวมทั้งหมด</dt>
                <dd className="font-black text-brand">{formatTHB(total)}</dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              className="mt-7 flex h-13 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white hover:bg-brand-dark"
            >
              ดำเนินการชำระเงิน
            </Link>
            <p className="mt-5 text-xs leading-5 text-muted">
              Voucher จะถูกจัดส่งในหน้าคำสั่งซื้อหลังชำระเงินสำเร็จ
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
