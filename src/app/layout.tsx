import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-provider";
import "./globals.css";

const primepassFont = Noto_Sans_Thai({
  variable: "--font-primepass",
  subsets: ["thai", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "PrimePass | Voucher พรีเมียม พร้อมใช้ในไม่กี่นาที",
    template: "%s | PrimePass",
  },
  description:
    "เลือกซื้อ Voucher ดิจิทัลจากแหล่งที่ได้รับอนุญาต ชำระเงินง่าย และติดตามคำสั่งซื้อได้ทุกเวลา",
  openGraph: {
    title: "PrimePass",
    description: "Voucher พรีเมียม พร้อมใช้ในไม่กี่นาที",
    type: "website",
    locale: "th_TH",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={primepassFont.variable} data-scroll-behavior="smooth">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
