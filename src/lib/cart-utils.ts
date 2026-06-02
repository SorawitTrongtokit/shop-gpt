import { getVariant } from "@/lib/catalog";

export const CART_STORAGE_KEY = "primepass-cart-v1";

export type CartLine = {
  variantSlug: string;
  quantity: number;
};

export type StoredCart = {
  version: 1;
  items: CartLine[];
};

export function sanitizeCart(input: unknown): StoredCart {
  if (!input || typeof input !== "object" || !("items" in input)) {
    return { version: 1, items: [] };
  }

  const rawItems = Array.isArray(input.items) ? input.items : [];
  const items = rawItems.flatMap((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      !("variantSlug" in item) ||
      !("quantity" in item) ||
      typeof item.variantSlug !== "string" ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 10 ||
      !getVariant(item.variantSlug)
    ) {
      return [];
    }
    return [{ variantSlug: item.variantSlug, quantity: item.quantity }];
  });

  return { version: 1, items };
}

export function calculateCartTotal(items: CartLine[]) {
  return items.reduce((total, item) => {
    const catalogItem = getVariant(item.variantSlug);
    return total + (catalogItem?.variant.price ?? 0) * item.quantity;
  }, 0);
}
