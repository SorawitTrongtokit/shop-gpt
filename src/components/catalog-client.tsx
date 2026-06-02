"use client";

import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { CatalogProduct } from "@/lib/catalog";

export function CatalogClient({ products }: { products: CatalogProduct[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const categories = ["ทั้งหมด", ...new Set(products.map((product) => product.category))];
  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "ทั้งหมด" || product.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, products, query]);

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="flex h-12 flex-1 items-center rounded-lg border border-line px-4">
          <span className="sr-only">ค้นหา Voucher</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหา Voucher หรือบริการ"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#9aa4b8]"
          />
        </label>
        <label className="flex h-12 items-center gap-2 rounded-lg border border-line px-4 text-sm font-bold">
          <SlidersHorizontal size={17} />
          <span className="sr-only">หมวดหมู่</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="bg-white outline-none"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        {filtered.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      {!filtered.length && (
        <div className="mt-14 rounded-xl border border-dashed border-line py-16 text-center text-muted">
          ไม่พบ Voucher ที่ตรงกับคำค้นหา
        </div>
      )}
    </>
  );
}
