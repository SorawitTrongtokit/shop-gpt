import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white py-10">
      <div className="container-shell flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted">
            Marketplace สำหรับ Voucher ดิจิทัลจากแหล่งที่ได้รับอนุญาต
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm font-bold text-[#4b5875]">
          <Link href="/products">สินค้าทั้งหมด</Link>
          <Link href="/orders">คำสั่งซื้อ</Link>
          <Link href="/login">เข้าสู่ระบบ</Link>
          <Link href="/admin">ผู้ดูแลระบบ</Link>
        </div>
      </div>
    </footer>
  );
}
