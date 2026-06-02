import type { Metadata } from "next";
import { CartPage } from "@/components/cart/cart-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "ตะกร้าสินค้า",
  robots: { index: false, follow: false },
};

export default function CartRoute() {
  return (
    <>
      <SiteHeader />
      <CartPage />
      <SiteFooter />
    </>
  );
}
