import { ArrowRight, Clock3, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FadeIn, FadeInItem, FloatImage, StaggerChildren } from "@/components/ui/animations";
import { getPublishedProducts } from "@/lib/catalog-service";

const confidence = [
  [ShieldCheck, "Voucher จากแหล่งที่ได้รับอนุญาต"],
  [Zap, "รับโค้ดทันทีหลังชำระเงิน"],
  [Clock3, "ดูคำสั่งซื้อได้ทุกเวลา"],
] as const;

export default async function Home() {
  await connection();
  const products = await getPublishedProducts();
  return (
    <>
      <SiteHeader />
      <main>
        <section className="container-shell grid min-h-[630px] items-center gap-12 py-14 lg:grid-cols-[1.03fr_.97fr] lg:py-20">
          <FadeIn>
            <h1 className="max-w-[660px] text-[48px] font-black leading-[1.16] tracking-[-0.055em] text-[#070f2a] sm:text-[68px]">
              พรีเมียมที่ชอบ
              <br />
              พร้อมใช้ในไม่กี่นาที
            </h1>
            <p className="mt-7 max-w-[590px] text-lg leading-8 text-muted">
              เลือก Voucher ที่ต้องการ ชำระเงินง่าย และรับโค้ดทันที
              พร้อมกลับมาดูคำสั่งซื้อได้ทุกเวลา
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link
                href="/products"
                className="inline-flex h-14 items-center rounded-lg bg-brand px-7 text-base font-bold text-white hover:bg-brand-dark"
              >
                เลือกซื้อเลย
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 font-bold text-brand"
              >
                ดูวิธีใช้งาน <ArrowRight size={18} />
              </Link>
            </div>
          </FadeIn>
          <div className="relative mx-auto h-[360px] w-full max-w-[650px] sm:h-[480px]">
            <FloatImage delay={0.2} className="absolute left-[3%] top-[20%] w-[58%] z-0">
              <Image
                src="/products/netflix-gift-code.png"
                alt="Netflix Gift Code"
                width={660}
                height={412}
                priority
                loading="eager"
                className="voucher-shadow -rotate-6 rounded-2xl"
              />
            </FloatImage>
            <FloatImage delay={0.4} className="absolute left-[23%] top-[6%] z-10 w-[58%]">
              <Image
                src="/products/youtube-premium.png"
                alt="YouTube Premium"
                width={660}
                height={412}
                priority
                loading="eager"
                className="voucher-shadow rounded-2xl"
              />
            </FloatImage>
            <FloatImage delay={0.6} className="absolute right-[0%] top-[28%] w-[58%] z-0">
              <Image
                src="/products/spotify-gift-card.png"
                alt="Spotify Gift Card"
                width={660}
                height={412}
                priority
                loading="eager"
                className="voucher-shadow rotate-6 rounded-2xl"
              />
            </FloatImage>
          </div>
        </section>

        <section className="border-y border-line">
          <StaggerChildren className="container-shell grid grid-cols-3 gap-px">
            {confidence.map(([Icon, label]) => (
              <FadeInItem
                key={label}
                className="flex flex-col items-center gap-2 border-line px-2 py-4 text-center md:flex-row md:gap-4 md:border-r md:px-8 md:py-6 md:text-left md:first:border-l"
              >
                <Icon className="text-brand" size={27} strokeWidth={1.8} />
                <span className="text-[10px] font-bold leading-4 text-[#233252] md:text-sm">
                  {label}
                </span>
              </FadeInItem>
            ))}
          </StaggerChildren>
        </section>

        <section className="container-shell py-14 sm:py-20">
          <FadeIn className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.04em]">Voucher ยอดนิยม</h2>
              <p className="mt-2 text-muted">เริ่มต้นง่าย เลือกระยะเวลาได้ตามต้องการ</p>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-2 text-sm font-bold text-brand sm:flex"
            >
              ดูสินค้าทั้งหมด <ArrowRight size={17} />
            </Link>
          </FadeIn>
          <StaggerChildren className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
            {products.map((product) => (
              <FadeInItem key={product.slug}>
                <ProductCard product={product} />
              </FadeInItem>
            ))}
          </StaggerChildren>
        </section>

        <section id="how-it-works" className="border-y border-line bg-[#fbfcff]">
          <div className="container-shell py-14 sm:py-20">
            <FadeIn>
              <h2 className="text-3xl font-black tracking-[-0.04em]">วิธีใช้งาน</h2>
            </FadeIn>
            <StaggerChildren className="mt-8 grid gap-8 md:grid-cols-3">
              {[
                ["01", "เลือก Voucher", "เลือกบริการ ระยะเวลา และจำนวนที่คุณต้องการ"],
                ["02", "ชำระเงิน", "ตรวจสอบรายการและยืนยันการชำระเงินอย่างปลอดภัย"],
                ["03", "รับโค้ดทันที", "ดู Voucher ในหน้าคำสั่งซื้อและคัดลอกไปใช้งาน"],
              ].map(([number, title, description]) => (
                <FadeInItem key={number} className="border-t-2 border-brand pt-5">
                  <span className="text-sm font-black text-brand">{number}</span>
                  <h3 className="mt-3 text-xl font-black">{title}</h3>
                  <p className="mt-2 leading-7 text-muted">{description}</p>
                </FadeInItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
