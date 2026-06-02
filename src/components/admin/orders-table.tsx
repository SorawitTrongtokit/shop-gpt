const fallbackRows = [
  ["#PP250526-0012", "กานต์ธิดา วงศ์สวัสดิ์", "Netflix Gift Code", "฿199", "ชำระแล้ว"],
  ["#PP250526-0011", "ชัยวัฒน์ พิพัฒน์ผล", "Spotify Gift Card", "฿159", "รอชำระเงิน"],
  ["#PP250526-0010", "ปริญญา สุขสมบูรณ์", "Netflix Gift Code", "฿559", "ส่งแล้ว"],
  ["#PP250525-0009", "ศิริพร จันทร์แก้ว", "YouTube Premium", "฿159", "ส่งแล้ว"],
  ["#PP250525-0008", "นพรัตน์ สินเจริญ", "Spotify Gift Card", "฿459", "ส่งแล้ว"],
] as const;

type OrderRow = {
  number: string;
  customer: string;
  product: string;
  total: string;
  status: string;
  date: string;
};

export function OrdersTable({ rows }: { rows?: OrderRow[] }) {
  const displayRows =
    rows ??
    fallbackRows.map(([number, customer, product, total, status], index) => ({
      number,
      customer,
      product,
      total,
      status,
      date: index < 3 ? "26 พ.ค. 2025" : "25 พ.ค. 2025",
    }));
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="min-w-[850px] w-full text-left text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>
            {["เลขคำสั่งซื้อ", "ลูกค้า", "สินค้า", "ยอดรวม", "สถานะ", "วันที่"].map(
              (head) => (
                <th key={head} className="px-5 py-4 font-black">
                  {head}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {displayRows.map(({ number, customer, product, total, status, date }) => (
            <tr key={number} className="border-b border-line last:border-b-0">
              <td className="px-5 py-4 font-bold">{number}</td>
              <td className="px-5 py-4">{customer}</td>
              <td className="px-5 py-4">{product}</td>
              <td className="px-5 py-4 font-bold">{total}</td>
              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    status === "รอชำระเงิน"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-green-50 text-[#158257]"
                  }`}
                >
                  {status}
                </span>
              </td>
              <td className="px-5 py-4 text-muted">{date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
