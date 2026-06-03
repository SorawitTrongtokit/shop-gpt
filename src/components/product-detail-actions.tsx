"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import {
  formatStockLabel,
  formatTHB,
  getSellableStock,
  hasSellableStock,
  type CatalogVariant,
} from "@/lib/catalog";

export function ProductDetailActions({ variants }: { variants: CatalogVariant[] }) {
  const [selected, setSelected] = useState(
    variants.find((variant) => hasSellableStock(variant)) ?? variants[0],
  );
  const [quantity, setQuantity] = useState(1);
  const selectedStock = getSellableStock(selected);
  const maxQuantity = Math.min(10, selectedStock);
  const selectedInStock = selectedStock > 0;
  return (
    <>
      <p className="mt-4 text-4xl font-black text-brand">{formatTHB(selected.price)}</p>
      <p
        className={`mt-3 text-sm font-bold ${
          selectedInStock ? "text-[#1d8162]" : "text-red-600"
        }`}
      >
        {selectedInStock
          ? `${formatStockLabel(selected)} พร้อมส่งหลังชำระเงิน`
          : "สินค้าหมด ไม่สามารถซื้อได้"}
      </p>
      <div className="mt-8">
        <p className="text-sm font-black">ระยะเวลา</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {variants.map((variant) => {
            const inStock = hasSellableStock(variant);
            return (
              <button
                key={variant.slug}
                type="button"
                disabled={!inStock}
                onClick={() => {
                  setSelected(variant);
                  setQuantity((current) =>
                    Math.max(1, Math.min(current, Math.min(10, getSellableStock(variant)))),
                  );
                }}
                className={`h-14 rounded-lg border px-2 text-sm font-bold ${
                  selected.slug === variant.slug
                    ? "border-brand bg-blue-50 text-brand"
                    : inStock
                      ? "border-line hover:border-blue-300"
                      : "cursor-not-allowed border-line bg-surface text-muted"
                }`}
              >
                <span>{variant.label}</span>
                <span className="mt-0.5 block text-[10px] font-bold">
                  {formatStockLabel(variant)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-[170px_1fr]">
        <div className="flex h-12 items-center justify-between rounded-lg border border-line px-4">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            aria-label="ลดจำนวน"
            disabled={quantity <= 1 || !selectedInStock}
            className="disabled:cursor-not-allowed disabled:text-muted"
          >
            <Minus size={17} />
          </button>
          <span className="font-black">{quantity}</span>
          <button
            type="button"
            onClick={() =>
              setQuantity((current) => Math.min(maxQuantity, current + 1))
            }
            aria-label="เพิ่มจำนวน"
            disabled={!selectedInStock || quantity >= maxQuantity}
            className="disabled:cursor-not-allowed disabled:text-muted"
          >
            <Plus size={17} />
          </button>
        </div>
        <AddToCartButton
          variantSlug={selected.slug}
          quantity={quantity}
          availableStock={selected.stock}
          solid
        />
      </div>
    </>
  );
}
