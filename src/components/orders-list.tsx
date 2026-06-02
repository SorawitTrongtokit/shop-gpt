"use client";

import { Clock3, PackageCheck } from "lucide-react";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

type DemoOrder = {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  items: Array<{ variantSlug: string; quantity: number }>;
};

type DatabaseOrder = {
  orderNumber: string;
  createdAt: string;
  itemCount: number;
  status: string;
};

export function OrdersList({
  databaseOrders = [],
}: {
  databaseOrders?: DatabaseOrder[];
}) {
  const serialized = useSyncExternalStore(
    () => () => undefined,
    () => localStorage.getItem("primepass-demo-orders") ?? "[]",
    () => "[]",
  );
  const demoOrders = useMemo<DemoOrder[]>(() => JSON.parse(serialized), [serialized]);
  const orders = [
    ...databaseOrders,
    ...demoOrders.map((order) => ({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      itemCount: order.items.length,
      status: "FULFILLED",
    })),
  ];

  if (!orders.length) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-line py-16 text-center">
        <Clock3 className="mx-auto text-brand" size={34} />
        <p className="mt-4 font-bold text-muted">ยังไม่มีคำสั่งซื้อในเครื่องนี้</p>
        <Link href="/products" className="mt-5 inline-block font-bold text-brand">
          เลือกซื้อ Voucher
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-4">
      {orders.map((order) => (
        <Link
          key={order.orderNumber}
          href={`/orders/${order.orderNumber}`}
          className="flex flex-col justify-between gap-4 rounded-xl border border-line p-5 hover:border-blue-300 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-green-50 text-[#13915b]">
              <PackageCheck size={22} />
            </span>
            <div>
              <p className="font-black">{order.orderNumber}</p>
              <p className="mt-1 text-sm text-muted">
                {order.itemCount} รายการ • {new Date(order.createdAt).toLocaleString("th-TH")}
              </p>
            </div>
          </div>
          <span className="text-sm font-bold text-[#13915b]">
            {order.status === "FULFILLED" ? "ส่ง Voucher แล้ว" : order.status}
          </span>
        </Link>
      ))}
    </div>
  );
}
