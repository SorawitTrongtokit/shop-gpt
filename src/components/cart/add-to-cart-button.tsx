"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

export function AddToCartButton({
  variantSlug,
  quantity = 1,
  solid = false,
}: {
  variantSlug: string;
  quantity?: number;
  solid?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addItem(variantSlug, quantity);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
      className={`inline-flex h-10 items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-bold sm:h-11 sm:gap-2 sm:px-4 sm:text-sm ${
        solid
          ? "bg-brand text-white hover:bg-brand-dark"
          : "border border-brand text-brand hover:bg-blue-50"
      }`}
    >
      {added ? <Check size={17} /> : <ShoppingCart size={17} />}
      {added ? "เพิ่มแล้ว" : "เพิ่มลงตะกร้า"}
    </button>
  );
}
