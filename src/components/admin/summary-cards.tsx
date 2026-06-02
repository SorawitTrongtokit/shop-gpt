import { AlertTriangle, Clock3, Send, ShoppingCart } from "lucide-react";
import { formatTHB } from "@/lib/catalog";

export type SummaryData = {
  todayOrders: { count: number; total: number };
  pendingPayment: { count: number; total: number };
  fulfilled: { count: number; total: number };
  lowStockCount: number;
};

export function SummaryCards({ data }: { data?: SummaryData | null }) {
  const cards = [
    ["คำสั่งซื้อวันนี้", data?.todayOrders.count ?? 0, `ยอดรวม ${formatTHB(data?.todayOrders.total ?? 0)}`, ShoppingCart],
    ["รอชำระเงิน", data?.pendingPayment.count ?? 0, `ยอดรวม ${formatTHB(data?.pendingPayment.total ?? 0)}`, Clock3],
    ["ส่ง Voucher แล้ว", data?.fulfilled.count ?? 0, `ยอดรวม ${formatTHB(data?.fulfilled.total ?? 0)}`, Send],
    ["Voucher ใกล้หมด", data?.lowStockCount ?? 0, "รายการ", AlertTriangle],
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, detail, Icon]) => (
        <article key={label as string} className="rounded-xl border border-line bg-white p-5">
          <div className="flex gap-4">
            <span className="flex size-11 items-center justify-center rounded-full bg-blue-50 text-brand">
              <Icon size={21} strokeWidth={1.7} />
            </span>
            <div>
              <p className="text-sm font-bold">{label as string}</p>
              <p className="mt-1 text-3xl font-black">{value as React.ReactNode}</p>
              <p className="mt-1 text-xs text-muted">{detail as string}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
