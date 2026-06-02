export type CatalogVariant = {
  slug: string;
  label: string;
  durationMonths: number;
  price: number;
  currency: "THB";
};

export type CatalogProduct = {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  imageUrl: string;
  accent: "red" | "coral" | "green";
  seoTitle: string;
  seoDescription: string;
  variants: CatalogVariant[];
};

const variant = (
  productSlug: string,
  durationMonths: number,
  price: number,
): CatalogVariant => ({
  slug: `${productSlug}-${durationMonths}-month`,
  label: `${durationMonths} เดือน`,
  durationMonths,
  price,
  currency: "THB",
});

export const fallbackProducts: CatalogProduct[] = [
  {
    slug: "netflix-gift-code",
    name: "Netflix Gift Code",
    shortName: "Netflix",
    category: "สตรีมมิงวิดีโอ",
    description:
      "เติมความบันเทิงให้บัญชีของคุณด้วย Voucher ดิจิทัลจากแหล่งที่ได้รับอนุญาต พร้อมรับโค้ดหลังชำระเงินสำเร็จ",
    imageUrl: "/products/netflix-gift-code.png",
    accent: "red",
    seoTitle: "Netflix Gift Code | PrimePass",
    seoDescription:
      "เลือกซื้อ Netflix Gift Code จาก PrimePass พร้อมรับ Voucher หลังชำระเงิน",
    variants: [
      variant("netflix-gift-code", 1, 199),
      variant("netflix-gift-code", 3, 559),
      variant("netflix-gift-code", 6, 999),
    ],
  },
  {
    slug: "youtube-premium",
    name: "YouTube Premium",
    shortName: "YouTube",
    category: "สตรีมมิงวิดีโอ",
    description:
      "Voucher ดิจิทัลสำหรับบริการวิดีโอพรีเมียม เลือกระยะเวลาที่ต้องการและตรวจสอบเงื่อนไขก่อนนำไปใช้งาน",
    imageUrl: "/products/youtube-premium.png",
    accent: "coral",
    seoTitle: "YouTube Premium Voucher | PrimePass",
    seoDescription:
      "เลือกซื้อ YouTube Premium Voucher และติดตามคำสั่งซื้อได้ง่ายใน PrimePass",
    variants: [
      variant("youtube-premium", 1, 159),
      variant("youtube-premium", 3, 459),
      variant("youtube-premium", 6, 859),
    ],
  },
  {
    slug: "spotify-gift-card",
    name: "Spotify Gift Card",
    shortName: "Spotify",
    category: "สตรีมมิงเพลง",
    description:
      "Voucher ดิจิทัลสำหรับเติมสิทธิ์ฟังเพลงพรีเมียม รับโค้ดในหน้าคำสั่งซื้อและกลับมาดูได้ทุกเวลา",
    imageUrl: "/products/spotify-gift-card.png",
    accent: "green",
    seoTitle: "Spotify Gift Card | PrimePass",
    seoDescription:
      "เลือกซื้อ Spotify Gift Card จาก PrimePass พร้อมรับ Voucher หลังชำระเงิน",
    variants: [
      variant("spotify-gift-card", 1, 159),
      variant("spotify-gift-card", 3, 459),
      variant("spotify-gift-card", 6, 859),
    ],
  },
];

export const formatTHB = (amount: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);

export function getProduct(slug: string) {
  return fallbackProducts.find((product) => product.slug === slug);
}

export function getVariant(variantSlug: string) {
  for (const product of fallbackProducts) {
    const found = product.variants.find((item) => item.slug === variantSlug);
    if (found) {
      return { product, variant: found };
    }
  }
}
