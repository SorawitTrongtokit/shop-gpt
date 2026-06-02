import { z } from "zod";
import { parseVoucherCsv } from "@/lib/voucher-csv";
import { encryptVoucherCode, hashVoucherCode } from "@/lib/voucher-crypto";
import { requirePrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const manualSchema = z.object({
  variantSlug: z.string().trim().min(1),
  code: z.string().trim().min(1),
  expiresAt: z.string().trim().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    const prisma = requirePrisma();
    const contentType = request.headers.get("content-type") ?? "";
    const normalizedRows = contentType.includes("text/csv")
      ? parseVoucherCsv(await request.text())
      : await request.json().then((body) => {
          const row = manualSchema.parse(body);
          return [
            {
              variantSlug: row.variantSlug,
              code: row.code,
              expiresAt: row.expiresAt ? new Date(row.expiresAt) : undefined,
              codeHash: hashVoucherCode(row.code),
            },
          ];
        });

    const variants = await prisma.productVariant.findMany({
      where: { slug: { in: normalizedRows.map((row) => row.variantSlug) } },
    });
    const variantsBySlug = new Map(variants.map((variant) => [variant.slug, variant]));
    if (variants.length !== new Set(normalizedRows.map((row) => row.variantSlug)).size) {
      throw new Error("พบ variantSlug ที่ไม่มีในระบบ");
    }

    const result = await prisma.voucherInventory.createMany({
      data: normalizedRows.map((row) => ({
        variantId: variantsBySlug.get(row.variantSlug)!.id,
        encryptedCode: encryptVoucherCode(row.code),
        codeHash: row.codeHash,
        expiresAt: row.expiresAt,
      })),
      skipDuplicates: true,
    });
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "VOUCHERS_IMPORTED",
        entity: "VoucherInventory",
        metadata: {
          requested: normalizedRows.length,
          inserted: result.count,
        },
      },
    });
    return Response.json({
      requested: normalizedRows.length,
      inserted: result.count,
      duplicates: normalizedRows.length - result.count,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "นำเข้า Voucher ไม่สำเร็จ";
    const status =
      message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 400;
    return Response.json({ error: message }, { status });
  }
}
