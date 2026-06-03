type OrderRow = {
  number: string;
  customer: string;
  product: string;
  total: string;
  status: string;
  date: string;
};

export function OrdersTable({ rows }: { rows?: OrderRow[] }) {
  const displayRows = rows ?? [];
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
          {displayRows.length > 0 ? (
            displayRows.map(({ number, customer, product, total, status, date }) => (
              <tr key={number} className="border-b border-line last:border-b-0">
                <td className="px-5 py-4 font-bold">{number}</td>
                <td className="px-5 py-4">{customer}</td>
                <td className="px-5 py-4">{product}</td>
                <td className="px-5 py-4 font-bold">{total}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${getStatusClassName(
                      status,
                    )}`}
                  >
                    {status}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted">{date}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-muted">
                ไม่มีรายการคำสั่งซื้อ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function getStatusClassName(status: string) {
  if (status === "รอชำระเงิน") return "bg-amber-50 text-amber-700";
  if (status === "ส่งแล้ว") return "bg-green-50 text-[#158257]";
  if (status === "หมดเวลา" || status === "ยกเลิก") return "bg-red-50 text-red-700";
  return "bg-blue-50 text-brand";
}
