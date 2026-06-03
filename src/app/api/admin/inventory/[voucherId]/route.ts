import { revalidatePath } from "next/cache";
import { z } from "zod";
import { VoucherStatus } from "@/generated/prisma/enums";
import { requirePrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const updateVoucherSchema = z.object({
  status: z.enum([VoucherStatus.AVAILABLE, VoucherStatus.DISABLED]).optional(),
  expiresAt: z.string().trim().nullable().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ voucherId: string }> },
) {
  try {
    const user = await requireAdmin();
    const prisma = requirePrisma();
    const { voucherId } = await context.params;
    const input = updateVoucherSchema.parse(await request.json());
    const current = await prisma.voucherInventory.findUnique({
      where: { id: voucherId },
      select: {
        id: true,
        status: true,
        reservedOrderId: true,
        deliveredOrderId: true,
      },
    });
    if (!current) throw new Error("ไม่พบ Voucher");
    if (
      (input.status || input.expiresAt !== undefined) &&
      (current.status === VoucherStatus.RESERVED ||
        current.status === VoucherStatus.DELIVERED ||
        current.reservedOrderId ||
        current.deliveredOrderId)
    ) {
      throw new Error("Voucher ที่ถูกจองหรือส่งแล้วไม่สามารถแก้ไขจากหน้านี้ได้");
    }

    const expiresAt = parseExpiresAt(input.expiresAt);
    const updated = await prisma.voucherInventory.update({
      where: { id: voucherId },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.expiresAt !== undefined ? { expiresAt } : {}),
      },
      select: {
        id: true,
        status: true,
        expiresAt: true,
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "VOUCHER_UPDATED",
        entity: "VoucherInventory",
        entityId: updated.id,
        metadata: {
          previousStatus: current.status,
          status: input.status,
          expiresAt: updated.expiresAt?.toISOString() ?? null,
        },
      },
    });
    revalidatePath("/admin/inventory");
    return Response.json({ voucher: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "แก้ไข Voucher ไม่สำเร็จ";
    const status =
      message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 400;
    return Response.json({ error: message }, { status });
  }
}

function parseExpiresAt(value: string | null | undefined) {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (!value.trim()) return null;
  const parsed = new Date(value.trim());
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("วันหมดอายุไม่ถูกต้อง");
  }
  return parsed;
}
