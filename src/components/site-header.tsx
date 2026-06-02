"use client";

import { Menu, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { Logo } from "@/components/ui/logo";

const nav = [
  ["หน้าแรก", "/"],
  ["สินค้าทั้งหมด", "/products"],
  ["วิธีใช้งาน", "/#how-it-works"],
  ["คำสั่งซื้อ", "/orders"],
];

export function SiteHeader() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-shell flex h-[74px] items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="เมนูหลัก">
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-bold text-[#253252] hover:text-brand"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/products"
            aria-label="ค้นหาสินค้า"
            className="flex size-10 items-center justify-center rounded-lg text-[#07163d] hover:bg-surface"
          >
            <Search size={21} />
          </Link>
          <Link
            href="/cart"
            aria-label={`ตะกร้าสินค้า ${count} รายการ`}
            className="relative flex size-10 items-center justify-center rounded-lg text-[#07163d] hover:bg-surface"
          >
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-black text-white">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/login"
            className="hidden px-2 text-sm font-bold text-[#253252] hover:text-brand sm:block"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/products"
            className="hidden h-11 items-center rounded-lg bg-brand px-5 text-sm font-bold text-white hover:bg-brand-dark md:flex"
          >
            เลือกซื้อ Voucher
          </Link>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg lg:hidden"
            aria-label="เปิดเมนู"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
