"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { formatTHB, type CatalogVariant } from "@/lib/catalog";

export function ProductDetailActions({ variants }: { variants: CatalogVariant[] }) {
  const [selected, setSelected] = useState(variants[0]);
  const [quantity, setQuantity] = useState(1);
  return (
    <>
      <p className="mt-4 text-4xl font-black text-brand">{formatTHB(selected.price)}</p>
      <p className="mt-3 text-sm font-bold text-[#1d8162]">
        พร้อมส่งทันทีหลังชำระเงิน
      </p>
      <div className="mt-8">
        <p className="text-sm font-black">ระยะเวลา</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {variants.map((variant) => (
            <button
              key={variant.slug}
              type="button"
              onClick={() => setSelected(variant)}
              className={`h-13 rounded-lg border text-sm font-bold ${
                selected.slug === variant.slug
                  ? "border-brand bg-blue-50 text-brand"
                  : "border-line hover:border-blue-300"
              }`}
            >
              {variant.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-[170px_1fr]">
        <div className="flex h-12 items-center justify-between rounded-lg border border-line px-4">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            aria-label="ลดจำนวน"
          >
            <Minus size={17} />
          </button>
          <span className="font-black">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.min(10, current + 1))}
            aria-label="เพิ่มจำนวน"
          >
            <Plus size={17} />
          </button>
        </div>
        <AddToCartButton variantSlug={selected.slug} quantity={quantity} solid />
      </div>
    </>
  );
}
