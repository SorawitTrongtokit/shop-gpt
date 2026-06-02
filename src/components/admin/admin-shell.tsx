import {
  Boxes,
  ClipboardList,
  Gauge,
  Package,
  Settings,
  TicketCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const links = [
  ["ภาพรวม", "/admin", Gauge],
  ["สินค้า", "/admin/products", Package],
  ["คลัง Voucher", "/admin/inventory", Boxes],
  ["คำสั่งซื้อ", "/admin/orders", ClipboardList],
  ["ลูกค้า", "/admin/orders", Users],
  ["ตั้งค่า", "/admin", Settings],
] as const;

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fbfcff]">
      <aside className="fixed inset-y-0 left-0 hidden w-[228px] border-r border-line bg-white px-4 py-5 lg:block">
        <Logo />
        <div className="mt-9 flex items-center gap-3 rounded-xl bg-blue-50 p-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand text-white">
            <TicketCheck size={18} />
          </span>
          <div>
            <p className="text-sm font-black">ผู้ดูแลระบบ</p>
            <p className="text-xs text-muted">Admin</p>
          </div>
        </div>
        <nav className="mt-7 grid gap-1">
          {links.map(([label, href, Icon]) => (
            <Link
              key={`${label}-${href}`}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-[#52607b] hover:bg-blue-50 hover:text-brand"
            >
              <Icon size={19} strokeWidth={1.8} /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-[228px]">
        <div className="border-b border-line bg-white px-5 py-5 sm:px-8">
          <h1 className="text-2xl font-black tracking-[-0.04em]">{title}</h1>
        </div>
        <div className="p-5 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
