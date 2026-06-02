"use client";

import { FileUp } from "lucide-react";
import { useState } from "react";

const sample = `variantSlug,code,expiresAt
netflix-gift-code-1-month,DEMO-NETFLIX-0001,2027-12-31
spotify-gift-card-1-month,DEMO-SPOTIFY-0001,2027-12-31`;

export function InventoryImport() {
  const [csv, setCsv] = useState(sample);
  const [message, setMessage] = useState("");

  async function submit() {
    const response = await fetch("/api/admin/inventory/import", {
      method: "POST",
      headers: { "content-type": "text/csv" },
      body: csv,
    });
    const result = await response.json();
    setMessage(
      response.ok
        ? `นำเข้าแล้ว ${result.inserted} รายการ • ซ้ำ ${result.duplicates} รายการ`
        : result.error,
    );
  }

  return (
    <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <FileUp className="text-brand" />
        <div>
          <h2 className="font-black">Import Voucher ด้วย CSV</h2>
          <p className="mt-1 text-xs text-muted">รูปแบบ: variantSlug,code,expiresAt?</p>
        </div>
      </div>
      <textarea
        value={csv}
        onChange={(event) => setCsv(event.target.value)}
        className="mt-5 min-h-40 w-full rounded-lg border border-line p-3 font-mono text-xs outline-none focus:border-brand"
      />
      {message && <p className="mt-3 text-sm font-bold text-brand">{message}</p>}
      <button
        type="button"
        onClick={submit}
        className="mt-4 h-11 rounded-lg bg-brand px-5 text-sm font-bold text-white"
      >
        ตรวจสอบและนำเข้า
      </button>
    </section>
  );
}
