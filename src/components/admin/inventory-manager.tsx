"use client";

import {
  AlertTriangle,
  ArchiveRestore,
  Ban,
  Clipboard,
  Clock3,
  Database,
  FileSpreadsheet,
  Loader2,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  TicketCheck,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { AdminInventoryData } from "@/lib/admin-inventory";
import { formatTHB } from "@/lib/catalog";

type VoucherStatus = "AVAILABLE" | "RESERVED" | "DELIVERED" | "DISABLED";
type Message = { tone: "success" | "error"; text: string } | null;
type Tab = "stock" | "add" | "csv" | "vouchers";

const sampleCsv = `variantSlug,code,expiresAt
netflix-gift-code-1-month,NETFLIX-0001,2027-12-31
spotify-gift-card-1-month,SPOTIFY-0001,2027-12-31`;
const EMPTY_VARIANTS: AdminInventoryData["variants"] = [];
const EMPTY_VOUCHERS: AdminInventoryData["recentVouchers"] = [];

export function InventoryManager({
  data,
}: {
  data: AdminInventoryData | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<Tab>("stock");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | VoucherStatus>("ALL");
  const [selectedVariantSlug, setSelectedVariantSlug] = useState(
    data?.variants[0]?.slug ?? "",
  );
  const [manualCodes, setManualCodes] = useState("");
  const [manualExpiry, setManualExpiry] = useState("");
  const [csv, setCsv] = useState(sampleCsv);
  const [message, setMessage] = useState<Message>(null);

  const variants = data?.variants ?? EMPTY_VARIANTS;
  const recentVouchers = data?.recentVouchers ?? EMPTY_VOUCHERS;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredVariants = useMemo(() => {
    if (!normalizedQuery) return variants;
    return variants.filter((variant) =>
      [
        variant.productName,
        variant.productShortName,
        variant.productCategory,
        variant.label,
        variant.slug,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, variants]);
  const filteredVouchers = useMemo(() => {
    return recentVouchers.filter((voucher) => {
      const matchesStatus =
        statusFilter === "ALL" || voucher.status === statusFilter;
      const matchesSearch =
        !normalizedQuery ||
        [
          voucher.productName,
          voucher.productShortName,
          voucher.variantLabel,
          voucher.variantSlug,
          voucher.codeFingerprint,
          voucher.reservedOrderNumber,
          voucher.deliveredOrderNumber,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesStatus && matchesSearch;
    });
  }, [normalizedQuery, recentVouchers, statusFilter]);

  if (!data) {
    return (
      <section className="rounded-lg border border-line bg-white p-8 text-center">
        <Database className="mx-auto text-brand" size={34} />
        <h2 className="mt-4 text-xl font-black">ยังไม่ได้เชื่อมต่อฐานข้อมูล</h2>
        <p className="mt-2 text-sm text-muted">
          ตั้งค่า DATABASE_URL แล้วกลับมาจัดการ stock ได้จากหน้านี้
        </p>
      </section>
    );
  }

  async function refreshAfterMutation(nextMessage?: Message) {
    if (nextMessage) setMessage(nextMessage);
    startTransition(() => router.refresh());
  }

  async function importManual() {
    setMessage(null);
    const response = await fetch("/api/admin/inventory/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        variantSlug: selectedVariantSlug,
        codes: manualCodes,
        expiresAt: manualExpiry || undefined,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage({ tone: "error", text: result.error ?? "เติม stock ไม่สำเร็จ" });
      return;
    }
    setManualCodes("");
    await refreshAfterMutation({
      tone: "success",
      text: `เติม stock แล้ว ${result.inserted} รายการ ซ้ำ ${result.duplicates} รายการ`,
    });
  }

  async function importCsv() {
    setMessage(null);
    const response = await fetch("/api/admin/inventory/import", {
      method: "POST",
      headers: { "content-type": "text/csv" },
      body: csv,
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage({ tone: "error", text: result.error ?? "นำเข้า CSV ไม่สำเร็จ" });
      return;
    }
    await refreshAfterMutation({
      tone: "success",
      text: `นำเข้าแล้ว ${result.inserted}/${result.requested} รายการ จาก ${result.variants} variant`,
    });
  }

  async function updateVoucher(
    voucherId: string,
    body: { status?: VoucherStatus; expiresAt?: string | null },
  ) {
    setMessage(null);
    const response = await fetch(`/api/admin/inventory/${voucherId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage({ tone: "error", text: result.error ?? "แก้ไข Voucher ไม่สำเร็จ" });
      return;
    }
    await refreshAfterMutation({
      tone: "success",
      text: "อัปเดต Voucher แล้ว",
    });
  }

  async function releaseExpiredReservations() {
    setMessage(null);
    const response = await fetch("/api/admin/inventory/release-expired", {
      method: "POST",
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage({
        tone: "error",
        text: result.error ?? "คืน stock ที่หมดเวลาไม่สำเร็จ",
      });
      return;
    }
    await refreshAfterMutation({
      tone: "success",
      text: `คืน Voucher ${result.vouchers} ใบ และปิด order หมดเวลา ${result.orders} รายการ`,
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="พร้อมขาย"
          value={data.summary.sellable}
          detail={`ทั้งหมด ${data.summary.availableRaw} ใบ`}
          icon={TicketCheck}
          tone="green"
        />
        <MetricCard
          label="ถูกจอง"
          value={data.summary.reserved}
          detail="รอชำระเงิน"
          icon={Clock3}
          tone="amber"
        />
        <MetricCard
          label="ส่งแล้ว"
          value={data.summary.delivered}
          detail={`${data.summary.total} ใบในระบบ`}
          icon={PackageCheck}
          tone="blue"
        />
        <MetricCard
          label="ต้องดูแล"
          value={data.summary.lowStockVariants + data.summary.expiredAvailable}
          detail={`${data.summary.lowStockVariants} variant ใกล้หมด`}
          icon={AlertTriangle}
          tone="red"
        />
      </section>

      <section className="rounded-lg border border-line bg-white">
        <div className="flex flex-col gap-4 border-b border-line p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              ["stock", "ภาพรวม stock"],
              ["add", "เติม stock"],
              ["csv", "Import CSV"],
              ["vouchers", "Voucher ล่าสุด"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key as Tab)}
                className={`h-10 rounded-lg px-4 text-sm font-black ${
                  activeTab === key
                    ? "bg-brand text-white"
                    : "bg-surface text-[#52607b] hover:bg-blue-50 hover:text-brand"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 sm:w-80">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                size={17}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาสินค้า, variantSlug, order"
                className="h-10 w-full rounded-lg border border-line pl-10 pr-3 text-sm outline-none focus:border-brand"
              />
            </label>
            <button
              type="button"
              onClick={releaseExpiredReservations}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line px-4 text-sm font-black text-[#52607b] hover:border-brand hover:text-brand disabled:opacity-60"
            >
              {isPending ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
              คืน stock หมดเวลา
            </button>
          </div>
        </div>

        {message && (
          <div
            aria-live="polite"
            className={`mx-4 mt-4 rounded-lg px-4 py-3 text-sm font-bold ${
              message.tone === "success"
                ? "bg-green-50 text-[#158257]"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {activeTab === "stock" && (
          <StockTable variants={filteredVariants} onSelectAdd={(slug) => {
            setSelectedVariantSlug(slug);
            setActiveTab("add");
          }} />
        )}
        {activeTab === "add" && (
          <ManualImportPanel
            variants={variants}
            selectedVariantSlug={selectedVariantSlug}
            setSelectedVariantSlug={setSelectedVariantSlug}
            manualCodes={manualCodes}
            setManualCodes={setManualCodes}
            manualExpiry={manualExpiry}
            setManualExpiry={setManualExpiry}
            onSubmit={importManual}
            isPending={isPending}
          />
        )}
        {activeTab === "csv" && (
          <CsvImportPanel
            csv={csv}
            setCsv={setCsv}
            onSubmit={importCsv}
            isPending={isPending}
          />
        )}
        {activeTab === "vouchers" && (
          <VoucherTable
            vouchers={filteredVouchers}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onUpdateVoucher={updateVoucher}
            isPending={isPending}
          />
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: "blue" | "green" | "amber" | "red";
}) {
  const tones = {
    blue: "bg-blue-50 text-brand",
    green: "bg-green-50 text-[#158257]",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <article className="rounded-lg border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted">{label}</p>
          <p className="mt-2 text-3xl font-black">{value.toLocaleString("th-TH")}</p>
          <p className="mt-1 text-xs text-muted">{detail}</p>
        </div>
        <span className={`flex size-11 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={21} />
        </span>
      </div>
    </article>
  );
}

function StockTable({
  variants,
  onSelectAdd,
}: {
  variants: AdminInventoryData["variants"];
  onSelectAdd: (slug: string) => void;
}) {
  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-[980px] w-full text-left text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>
            {["สินค้า", "variantSlug", "พร้อมขาย", "จอง", "ปิด", "ใกล้หมดอายุ", "สถานะ", ""].map(
              (head) => (
                <th key={head} className="px-3 py-3 font-black">
                  {head}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {variants.map((variant) => (
            <tr key={variant.id} className="border-b border-line last:border-b-0">
              <td className="px-3 py-4">
                <p className="font-black">{variant.productName}</p>
                <p className="mt-1 text-xs text-muted">{variant.label} • {formatTHB(variant.price)}</p>
              </td>
              <td className="px-3 py-4">
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(variant.slug)}
                  className="inline-flex items-center gap-2 rounded-md bg-surface px-2 py-1 font-mono text-xs font-bold text-[#52607b] hover:text-brand"
                >
                  <Clipboard size={13} />
                  {variant.slug}
                </button>
              </td>
              <td className="px-3 py-4">
                <StockMeter
                  value={variant.sellable}
                  threshold={variant.stockThreshold}
                />
              </td>
              <td className="px-3 py-4 font-bold">{variant.counts.RESERVED}</td>
              <td className="px-3 py-4 font-bold">{variant.counts.DISABLED}</td>
              <td className="px-3 py-4">
                <span className={variant.expiringSoon || variant.expiredAvailable ? "font-bold text-amber-700" : "text-muted"}>
                  {variant.expiringSoon} / {variant.expiredAvailable} หมดอายุแล้ว
                </span>
              </td>
              <td className="px-3 py-4">
                <StatusPill
                  label={
                    !variant.isActive
                      ? "ปิด variant"
                      : variant.lowStock
                        ? "ใกล้หมด"
                        : "ปกติ"
                  }
                  tone={!variant.isActive ? "muted" : variant.lowStock ? "red" : "green"}
                />
              </td>
              <td className="px-3 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onSelectAdd(variant.slug)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-3 text-xs font-black text-white hover:bg-brand-dark"
                >
                  <Plus size={15} />
                  เติม
                </button>
              </td>
            </tr>
          ))}
          {!variants.length && (
            <tr>
              <td colSpan={8} className="px-3 py-12 text-center text-muted">
                ไม่พบ variant ที่ตรงกับการค้นหา
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StockMeter({ value, threshold }: { value: number; threshold: number }) {
  const target = Math.max(threshold * 3, 1);
  const percent = Math.min(100, Math.round((value / target) * 100));
  const tone =
    value <= threshold ? "bg-red-500" : value <= threshold * 2 ? "bg-amber-500" : "bg-[#158257]";
  return (
    <div className="min-w-40">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xl font-black">{value}</span>
        <span className="text-xs font-bold text-muted">ขั้นต่ำ {threshold}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ManualImportPanel({
  variants,
  selectedVariantSlug,
  setSelectedVariantSlug,
  manualCodes,
  setManualCodes,
  manualExpiry,
  setManualExpiry,
  onSubmit,
  isPending,
}: {
  variants: AdminInventoryData["variants"];
  selectedVariantSlug: string;
  setSelectedVariantSlug: (value: string) => void;
  manualCodes: string;
  setManualCodes: (value: string) => void;
  manualExpiry: string;
  setManualExpiry: (value: string) => void;
  onSubmit: () => Promise<void>;
  isPending: boolean;
}) {
  const selectedVariant = variants.find((variant) => variant.slug === selectedVariantSlug);
  return (
    <div className="grid gap-5 p-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="rounded-lg border border-line p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
          <label className="grid gap-2 text-sm font-bold">
            Variant
            <select
              value={selectedVariantSlug}
              onChange={(event) => setSelectedVariantSlug(event.target.value)}
              className="h-11 rounded-lg border border-line px-3 text-sm outline-none focus:border-brand"
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.slug}>
                  {variant.productName} - {variant.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            วันหมดอายุ
            <input
              type="date"
              value={manualExpiry}
              onChange={(event) => setManualExpiry(event.target.value)}
              className="h-11 rounded-lg border border-line px-3 text-sm outline-none focus:border-brand"
            />
          </label>
        </div>
        <label className="mt-4 grid gap-2 text-sm font-bold">
          Voucher codes
          <textarea
            value={manualCodes}
            onChange={(event) => setManualCodes(event.target.value)}
            placeholder="วางโค้ด 1 บรรทัดต่อ 1 ใบ"
            className="min-h-64 rounded-lg border border-line p-3 font-mono text-sm outline-none focus:border-brand"
          />
        </label>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!selectedVariantSlug || !manualCodes.trim() || isPending}
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {isPending ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}
          เติม stock
        </button>
      </section>
      <aside className="rounded-lg border border-line bg-surface p-5">
        <p className="text-sm font-black">รายการที่เลือก</p>
        {selectedVariant ? (
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-xl font-black">{selectedVariant.productName}</p>
            <p className="text-muted">{selectedVariant.label} • {formatTHB(selectedVariant.price)}</p>
            <div className="rounded-lg bg-white p-4">
              <p className="text-xs font-bold text-muted">พร้อมขายตอนนี้</p>
              <p className="mt-1 text-3xl font-black">{selectedVariant.sellable}</p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <p className="text-xs font-bold text-muted">variantSlug</p>
              <p className="mt-1 break-all font-mono text-xs font-bold">
                {selectedVariant.slug}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">ยังไม่มี variant</p>
        )}
      </aside>
    </div>
  );
}

function CsvImportPanel({
  csv,
  setCsv,
  onSubmit,
  isPending,
}: {
  csv: string;
  setCsv: (value: string) => void;
  onSubmit: () => Promise<void>;
  isPending: boolean;
}) {
  async function loadFile(file: File | undefined) {
    if (!file) return;
    setCsv(await file.text());
  }

  return (
    <div className="p-4">
      <section className="rounded-lg border border-line p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-blue-50 text-brand">
              <FileSpreadsheet size={22} />
            </span>
            <div>
              <h2 className="font-black">Import CSV</h2>
              <p className="mt-1 text-xs text-muted">variantSlug, code, expiresAt</p>
            </div>
          </div>
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line px-4 text-sm font-black text-[#52607b] hover:border-brand hover:text-brand">
            <UploadCloud size={16} />
            เลือกไฟล์ CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => loadFile(event.target.files?.[0])}
            />
          </label>
        </div>
        <textarea
          value={csv}
          onChange={(event) => setCsv(event.target.value)}
          className="mt-5 min-h-72 w-full rounded-lg border border-line p-3 font-mono text-xs outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!csv.trim() || isPending}
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {isPending ? <Loader2 className="animate-spin" size={17} /> : <UploadCloud size={17} />}
          ตรวจและนำเข้า
        </button>
      </section>
    </div>
  );
}

function VoucherTable({
  vouchers,
  statusFilter,
  setStatusFilter,
  onUpdateVoucher,
  isPending,
}: {
  vouchers: AdminInventoryData["recentVouchers"];
  statusFilter: "ALL" | VoucherStatus;
  setStatusFilter: (value: "ALL" | VoucherStatus) => void;
  onUpdateVoucher: (
    voucherId: string,
    body: { status?: VoucherStatus; expiresAt?: string | null },
  ) => Promise<void>;
  isPending: boolean;
}) {
  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        {(["ALL", "AVAILABLE", "RESERVED", "DELIVERED", "DISABLED"] as const).map(
          (status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`h-9 rounded-lg px-3 text-xs font-black ${
                statusFilter === status
                  ? "bg-brand text-white"
                  : "bg-surface text-[#52607b] hover:text-brand"
              }`}
            >
              {status === "ALL" ? "ทั้งหมด" : getStatusLabel(status)}
            </button>
          ),
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1060px] w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              {["Voucher", "สินค้า", "สถานะ", "วันหมดอายุ", "Order", "เพิ่มเมื่อ", ""].map(
                (head) => (
                  <th key={head} className="px-3 py-3 font-black">
                    {head}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {vouchers.map((voucher) => {
              const editable =
                voucher.status === "AVAILABLE" || voucher.status === "DISABLED";
              return (
                <tr key={voucher.id} className="border-b border-line last:border-b-0">
                  <td className="px-3 py-4">
                    <p className="font-mono text-xs font-black">#{voucher.codeFingerprint}</p>
                    <p className="mt-1 text-xs text-muted">{voucher.id.slice(0, 10)}</p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="font-black">{voucher.productName}</p>
                    <p className="mt-1 text-xs text-muted">{voucher.variantLabel} • {voucher.variantSlug}</p>
                  </td>
                  <td className="px-3 py-4">
                    <StatusPill label={getStatusLabel(voucher.status)} tone={getStatusTone(voucher.status)} />
                  </td>
                  <td className="px-3 py-4">
                    {editable ? (
                      <input
                        type="date"
                        defaultValue={toDateInputValue(voucher.expiresAt)}
                        onBlur={(event) => {
                          const next = event.currentTarget.value || null;
                          if (next !== toDateInputValue(voucher.expiresAt)) {
                            onUpdateVoucher(voucher.id, { expiresAt: next });
                          }
                        }}
                        className="h-9 rounded-lg border border-line px-3 text-xs font-bold outline-none focus:border-brand"
                      />
                    ) : (
                      <span className="text-muted">{formatDate(voucher.expiresAt)}</span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-xs text-muted">
                    {voucher.reservedOrderNumber ?? voucher.deliveredOrderNumber ?? "-"}
                  </td>
                  <td className="px-3 py-4 text-xs text-muted">
                    {formatDateTime(voucher.createdAt)}
                  </td>
                  <td className="px-3 py-4 text-right">
                    {voucher.status === "AVAILABLE" && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          onUpdateVoucher(voucher.id, { status: "DISABLED" })
                        }
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-black text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        <Ban size={14} />
                        ปิด
                      </button>
                    )}
                    {voucher.status === "DISABLED" && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          onUpdateVoucher(voucher.id, { status: "AVAILABLE" })
                        }
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-green-200 px-3 text-xs font-black text-[#158257] hover:bg-green-50 disabled:opacity-60"
                      >
                        <ArchiveRestore size={14} />
                        คืน
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!vouchers.length && (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-muted">
                  ไม่พบ Voucher ที่ตรงกับตัวกรอง
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "amber" | "blue" | "red" | "muted";
}) {
  const tones = {
    green: "bg-green-50 text-[#158257]",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-brand",
    red: "bg-red-50 text-red-700",
    muted: "bg-surface text-muted",
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${tones[tone]}`}>
      {label}
    </span>
  );
}

function getStatusLabel(status: VoucherStatus) {
  if (status === "AVAILABLE") return "พร้อมขาย";
  if (status === "RESERVED") return "ถูกจอง";
  if (status === "DELIVERED") return "ส่งแล้ว";
  return "ปิดใช้งาน";
}

function getStatusTone(status: VoucherStatus) {
  if (status === "AVAILABLE") return "green";
  if (status === "RESERVED") return "amber";
  if (status === "DELIVERED") return "blue";
  return "muted";
}

function formatDate(value: string | null) {
  if (!value) return "ไม่กำหนด";
  return new Date(value).toLocaleDateString("th-TH");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}
