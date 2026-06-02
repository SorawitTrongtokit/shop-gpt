import type { Metadata } from "next";
import { CatalogClient } from "@/components/catalog-client";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedProducts } from "@/lib/catalog-service";

export const metadata: Metadata = {
  title: "สินค้าทั้งหมด",
  description: "เลือก Voucher ดิจิทัลที่ใช่สำหรับคุณจาก PrimePass",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const products = await getPublishedProducts();
  return (
    <>
      <SiteHeader />
      <main className="container-shell min-h-[760px] py-9 sm:py-14">
        <p className="text-sm text-muted">หน้าแรก / สินค้าทั้งหมด</p>
        <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl">
          เลือก Voucher ที่ใช่สำหรับคุณ
        </h1>
        <p className="mt-3 text-muted">
          รวมบริการดิจิทัลยอดนิยม เติมง่าย สั่งไว พร้อมใช้งานทันที
        </p>
        <CatalogClient products={products} />
      </main>
      <SiteFooter />
    </>
  );
}
