"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CART_STORAGE_KEY,
  calculateCartTotal,
  sanitizeCart,
  type CartLine,
} from "@/lib/cart-utils";

type CartContextValue = {
  items: CartLine[];
  count: number;
  total: number;
  addItem: (variantSlug: string, quantity?: number) => void;
  updateItem: (variantSlug: string, quantity: number) => void;
  removeItem: (variantSlug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) setItems(sanitizeCart(JSON.parse(stored)).items);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items }));
    }
  }, [items, ready]);

  const addItem = useCallback((variantSlug: string, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.variantSlug === variantSlug);
      if (!existing) return [...current, { variantSlug, quantity }];
      return current.map((item) =>
        item.variantSlug === variantSlug
          ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
          : item,
      );
    });
  }, []);

  const updateItem = useCallback((variantSlug: string, quantity: number) => {
    if (quantity < 1) {
      setItems((current) =>
        current.filter((item) => item.variantSlug !== variantSlug),
      );
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.variantSlug === variantSlug
          ? { ...item, quantity: Math.min(10, quantity) }
          : item,
      ),
    );
  }, []);

  const removeItem = useCallback((variantSlug: string) => {
    setItems((current) =>
      current.filter((item) => item.variantSlug !== variantSlug),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: calculateCartTotal(items),
      addItem,
      updateItem,
      removeItem,
      clear,
    }),
    [addItem, clear, items, removeItem, updateItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
