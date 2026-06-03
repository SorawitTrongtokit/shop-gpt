import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProductDetailActions } from "@/components/product-detail-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCatalogProduct } from "@/lib/catalog-service";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getCatalogProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.seoTitle,
    description: product.seoDescription,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  await connection();
  const product = await getCatalogProduct((await params).slug);
  if (!product) notFound();
  const hasStock = product.variants.some((variant) => (variant.stock ?? 0) > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "THB",
      lowPrice: product.variants[0].price,
      highPrice: product.variants.at(-1)?.price,
      availability: hasStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <SiteHeader />
      <main className="container-shell py-9 sm:py-14">
        <p className="text-sm text-muted">
          หน้าแรก / สินค้าทั้งหมด / {product.name}
        </p>
        <section className="grid gap-9 py-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
          <div className="flex items-center rounded-2xl bg-[#f8faff] p-4 sm:p-9">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={900}
              height={563}
              priority
              className="voucher-shadow aspect-[16/10] w-full rounded-2xl object-cover"
            />
          </div>
          <div className="py-2">
            <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 leading-7 text-muted">{product.description}</p>
            <ProductDetailActions variants={product.variants} />
            <p className="mt-5 text-sm text-muted">
              Voucher ดิจิทัล จัดส่งในหน้าคำสั่งซื้อ
            </p>
          </div>
        </section>
        <section className="border-t border-line py-9">
          <div className="flex gap-7 text-sm font-black">
            <span className="border-b-2 border-brand pb-3 text-brand">รายละเอียดสินค้า</span>
            <span>วิธีใช้งาน</span>
            <span>เงื่อนไข</span>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ["1", "เลือก Voucher", "เลือกระยะเวลาและจำนวนที่ต้องการ"],
              ["2", "ชำระเงิน", "ตรวจสอบรายการและยืนยันการชำระเงิน"],
              ["3", "รับโค้ดและนำไปใช้งาน", "รับโค้ดในหน้าคำสั่งซื้อของคุณ"],
            ].map(([number, title, body]) => (
              <div key={number} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 font-black text-brand">
                  {number}
                </span>
                <div>
                  <h2 className="font-black">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
