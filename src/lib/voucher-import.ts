import { z } from "zod";
import type { VoucherCsvRow } from "@/lib/voucher-csv";
import { hashVoucherCode, normalizeVoucherCode } from "@/lib/voucher-crypto";

const singleRowSchema = z.object({
  variantSlug: z.string().trim().min(1),
  code: z.string().trim().min(1),
  expiresAt: z.string().trim().optional(),
});

const bulkRowsSchema = z.object({
  variantSlug: z.string().trim().min(1),
  codes: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
  expiresAt: z.string().trim().optional(),
});

const rowsPayloadSchema = z.object({
  rows: z.array(singleRowSchema).min(1).max(1000),
});

export function parseVoucherJsonPayload(input: unknown): VoucherCsvRow[] {
  const rowsPayload = rowsPayloadSchema.safeParse(input);
  if (rowsPayload.success) {
    return normalizeRows(rowsPayload.data.rows);
  }

  const bulkPayload = bulkRowsSchema.safeParse(input);
  if (bulkPayload.success) {
    const codes = Array.isArray(bulkPayload.data.codes)
      ? bulkPayload.data.codes
      : bulkPayload.data.codes.split(/\r?\n/);
    return normalizeRows(
      codes
        .map((code) => code.trim())
        .filter(Boolean)
        .map((code) => ({
          variantSlug: bulkPayload.data.variantSlug,
          code,
          expiresAt: bulkPayload.data.expiresAt,
        })),
    );
  }

  const singleRow = singleRowSchema.parse(input);
  return normalizeRows([singleRow]);
}

function normalizeRows(
  rows: Array<{ variantSlug: string; code: string; expiresAt?: string }>,
) {
  const hashes = new Set<string>();

  return rows.map((row, index) => {
    const variantSlug = row.variantSlug.trim();
    const code = normalizeVoucherCode(row.code);
    const expiresAt = parseExpiry(row.expiresAt, index);
    if (!variantSlug || !code) {
      throw new Error(`แถว ${index + 1}: ต้องมี variantSlug และ code`);
    }

    const codeHash = hashVoucherCode(code);
    if (hashes.has(codeHash)) {
      throw new Error(`แถว ${index + 1}: พบ Voucher ซ้ำในข้อมูลที่นำเข้า`);
    }
    hashes.add(codeHash);

    return { variantSlug, code, expiresAt, codeHash };
  });
}

function parseExpiry(expiresAt: string | undefined, index: number) {
  if (!expiresAt?.trim()) return undefined;
  const parsed = new Date(expiresAt.trim());
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`แถว ${index + 1}: expiresAt ไม่ถูกต้อง`);
  }
  return parsed;
}
