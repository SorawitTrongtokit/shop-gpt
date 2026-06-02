import Papa from "papaparse";
import { hashVoucherCode, normalizeVoucherCode } from "@/lib/voucher-crypto";

export type VoucherCsvRow = {
  variantSlug: string;
  code: string;
  expiresAt?: Date;
  codeHash: string;
};

export function parseVoucherCsv(csv: string): VoucherCsvRow[] {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length) {
    throw new Error(`CSV ไม่ถูกต้อง: ${parsed.errors[0].message}`);
  }

  const hashes = new Set<string>();
  return parsed.data.map((row, index) => {
    const variantSlug = row.variantSlug?.trim();
    const code = normalizeVoucherCode(row.code ?? "");
    const expiresAt = row.expiresAt?.trim()
      ? new Date(row.expiresAt.trim())
      : undefined;

    if (!variantSlug || !code) {
      throw new Error(`แถว ${index + 2}: ต้องมี variantSlug และ code`);
    }
    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      throw new Error(`แถว ${index + 2}: expiresAt ไม่ถูกต้อง`);
    }

    const codeHash = hashVoucherCode(code);
    if (hashes.has(codeHash)) {
      throw new Error(`แถว ${index + 2}: พบ Voucher ซ้ำในไฟล์`);
    }
    hashes.add(codeHash);

    return { variantSlug, code, expiresAt, codeHash };
  });
}
