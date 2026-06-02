"use client";

import { Check, Copy, Eye } from "lucide-react";
import { useState } from "react";

export function VoucherReveal({
  orderNumber,
  voucherId,
  masked,
  demoCode,
}: {
  orderNumber: string;
  voucherId: string;
  masked: string;
  demoCode?: string;
}) {
  const [code, setCode] = useState(masked);
  const [copied, setCopied] = useState(false);

  async function reveal() {
    if (demoCode) {
      setCode(demoCode);
      return;
    }
    const response = await fetch(
      `/api/orders/${orderNumber}/vouchers/${voucherId}/reveal`,
      { method: "POST" },
    );
    const body = await response.json();
    if (response.ok) setCode(body.code);
  }

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line p-4">
      <code className="text-sm font-black text-[#162851]">{code}</code>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reveal}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-blue-200 px-3 text-xs font-bold text-brand"
        >
          <Eye size={15} /> แสดงโค้ด
        </button>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-blue-200 px-3 text-xs font-bold text-brand"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "คัดลอกแล้ว" : "คัดลอก"}
        </button>
      </div>
    </div>
  );
}
