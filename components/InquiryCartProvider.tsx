"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Fabric } from "@/lib/data";

export type CartItem = {
  id: string;
  name: string;
  composition: string;
  weight: number;
  stockStatus: string;
  quantity: number;
  notionPageId?: string;
};

type InquiryCartContextValue = {
  items: CartItem[];
  addItem: (fabric: Fabric) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isSelected: (id: string | number) => boolean;
  totalCount: number;
};

const InquiryCartContext = createContext<InquiryCartContextValue | null>(null);

const DEFAULT_METERS = 100;

function fabricToCartItem(fabric: Fabric): CartItem {
  return {
    id: fabric.id,
    name: fabric.name,
    composition: fabric.composition,
    weight: fabric.weight,
    stockStatus: fabric.stockStatus?.trim() || "In stock",
    quantity: DEFAULT_METERS,
    notionPageId: fabric.notionPageId,
  };
}

export function InquiryCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((fabric: Fabric) => {
    setItems((prev) => {
      const id = fabric.id;
      if (prev.some((item) => item.id === id)) return prev;
      return [...prev, fabricToCartItem(fabric)];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const q =
      Number.isFinite(quantity) && quantity > 0
        ? Math.max(10, quantity)
        : DEFAULT_METERS;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: q } : item))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isSelected = useCallback(
    (id: string | number) => items.some((item) => item.id === String(id)),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isSelected,
      totalCount: items.length,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, isSelected]
  );

  return (
    <InquiryCartContext.Provider value={value}>{children}</InquiryCartContext.Provider>
  );
}

export function useInquiryCart() {
  const ctx = useContext(InquiryCartContext);
  if (!ctx) {
    throw new Error("useInquiryCart must be used within InquiryCartProvider");
  }
  return ctx;
}
