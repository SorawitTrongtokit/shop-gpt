import { describe, expect, it } from "vitest";
import { formatStockLabel, hasSellableStock, type CatalogVariant } from "@/lib/catalog";

function variant(stock?: number): CatalogVariant {
  return {
    slug: "netflix-gift-code-1-month",
    label: "1 เดือน",
    durationMonths: 1,
    price: 199,
    currency: "THB",
    stock,
  };
}

describe("catalog stock helpers", () => {
  it("formats known stock for storefront labels", () => {
    expect(formatStockLabel(variant(4))).toBe("เหลือ 4 ใบ");
    expect(formatStockLabel(variant(0))).toBe("สินค้าหมด");
  });

  it("treats fallback catalog variants as sellable", () => {
    expect(formatStockLabel(variant())).toBe("พร้อมส่งทันที");
    expect(hasSellableStock(variant())).toBe(true);
  });
});
