"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/cart/cart-provider";

export function AddToCartButton({
  variantSlug,
  quantity = 1,
  availableStock,
  solid = false,
}: {
  variantSlug: string;
  quantity?: number;
  availableStock?: number;
  solid?: boolean;
}) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const cartQuantity =
    items.find((item) => item.variantSlug === variantSlug)?.quantity ?? 0;
  const remaining =
    availableStock === undefined
      ? Number.POSITIVE_INFINITY
      : Math.max(availableStock - cartQuantity, 0);
  const disabled = remaining <= 0 || quantity > remaining;
  const label =
    availableStock === 0
      ? "สินค้าหมด"
      : remaining <= 0
        ? "มีในตะกร้าครบแล้ว"
        : quantity > remaining
          ? `เหลือ ${remaining} ใบ`
          : "เพิ่มลงตะกร้า";

  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.92 }}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        addItem(variantSlug, quantity, availableStock);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
      className={`inline-flex h-10 items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-bold transition-colors sm:h-11 sm:gap-2 sm:px-4 sm:text-sm ${
        disabled
          ? "cursor-not-allowed border border-line bg-surface text-muted"
          :
        solid
          ? "bg-brand text-white hover:bg-brand-dark"
          : added
          ? "border border-green-600 text-green-700 bg-green-50"
          : "border border-brand text-brand hover:bg-blue-50"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {added ? (
          <motion.div
            key="added"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-1 sm:gap-2"
          >
            <Check size={17} /> เพิ่มแล้ว
          </motion.div>
        ) : (
          <motion.div
            key="add"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-1 sm:gap-2"
          >
            <ShoppingCart size={17} /> {label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
