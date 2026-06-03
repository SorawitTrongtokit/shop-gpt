import { getVariant, type CatalogProduct } from "@/lib/catalog";

export const CART_STORAGE_KEY = "primepass-cart-v1";

export type CartLine = {
  variantSlug: string;
  quantity: number;
};

export type StoredCart = {
  version: 1;
  items: CartLine[];
};

export function sanitizeCart(input: unknown, catalog: CatalogProduct[] = []): StoredCart {
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
      item.quantity > 10
    ) {
      return [];
    }
    if (catalog.length > 0 && !getVariant(item.variantSlug, catalog)) {
      return [];
    }
    return [{ variantSlug: item.variantSlug, quantity: item.quantity }];
  });

  return { version: 1, items };
}

export function calculateCartTotal(items: CartLine[], catalog: CatalogProduct[] = []) {
  return items.reduce((total, item) => {
    const catalogItem = getVariant(item.variantSlug, catalog);
    return total + (catalogItem?.variant.price ?? 0) * item.quantity;
  }, 0);
}
