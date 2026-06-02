import { AlertTriangle, Clock3, Send, ShoppingCart } from "lucide-react";

const cards = [
  ["คำสั่งซื้อวันนี้", "24", "ยอดรวม ฿5,320", ShoppingCart],
  ["รอชำระเงิน", "6", "ยอดรวม ฿1,250", Clock3],
  ["ส่ง Voucher แล้ว", "18", "ยอดรวม ฿4,070", Send],
  ["Voucher ใกล้หมด", "7", "รายการ", AlertTriangle],
] as const;

export function SummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, detail, Icon]) => (
        <article key={label} className="rounded-xl border border-line bg-white p-5">
          <div className="flex gap-4">
            <span className="flex size-11 items-center justify-center rounded-full bg-blue-50 text-brand">
              <Icon size={21} strokeWidth={1.7} />
            </span>
            <div>
              <p className="text-sm font-bold">{label}</p>
              <p className="mt-1 text-3xl font-black">{value}</p>
              <p className="mt-1 text-xs text-muted">{detail}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
