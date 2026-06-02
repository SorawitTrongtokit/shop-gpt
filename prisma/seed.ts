import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed PrimePass.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const products = [
  {
    slug: "netflix-gift-code",
    name: "Netflix Gift Code",
    shortName: "Netflix",
    category: "สตรีมมิงวิดีโอ",
    description: "Voucher ดิจิทัลสำหรับเติมความบันเทิงให้บัญชีของคุณ พร้อมจัดส่งทันทีหลังชำระเงิน",
    imageUrl: "/products/netflix-gift-code.png",
    accent: "red",
    seoTitle: "Netflix Gift Code | PrimePass",
    seoDescription: "เลือกซื้อ Netflix Gift Code จากแหล่งที่ได้รับอนุญาตและรับโค้ดทันที",
    prices: [199, 559, 999],
  },
  {
    slug: "youtube-premium",
    name: "YouTube Premium",
    shortName: "YouTube",
    category: "สตรีมมิงวิดีโอ",
    description: "Voucher ดิจิทัลสำหรับบริการวิดีโอพรีเมียม พร้อมดูรายละเอียดและเงื่อนไขก่อนซื้อ",
    imageUrl: "/products/youtube-premium.png",
    accent: "coral",
    seoTitle: "YouTube Premium Voucher | PrimePass",
    seoDescription: "เลือกซื้อ YouTube Premium Voucher และติดตามคำสั่งซื้อได้ง่ายใน PrimePass",
    prices: [159, 459, 859],
  },
  {
    slug: "spotify-gift-card",
    name: "Spotify Gift Card",
    shortName: "Spotify",
    category: "สตรีมมิงเพลง",
    description: "Voucher ดิจิทัลสำหรับเติมสิทธิ์ฟังเพลงแบบพรีเมียม รับโค้ดในหน้าคำสั่งซื้อ",
    imageUrl: "/products/spotify-gift-card.png",
    accent: "green",
    seoTitle: "Spotify Gift Card | PrimePass",
    seoDescription: "เลือกซื้อ Spotify Gift Card จาก PrimePass พร้อมรับ Voucher หลังชำระเงิน",
    prices: [159, 459, 859],
  },
];

for (const product of products) {
  const { prices, ...data } = product;
  await prisma.product.upsert({
    where: { slug: product.slug },
    update: data,
    create: {
      ...data,
      variants: {
        create: prices.map((price, index) => ({
          slug: `${product.slug}-${[1, 3, 6][index]}-month`,
          label: `${[1, 3, 6][index]} เดือน`,
          durationMonths: [1, 3, 6][index],
          price,
        })),
      },
    },
  });
}

await prisma.$disconnect();
