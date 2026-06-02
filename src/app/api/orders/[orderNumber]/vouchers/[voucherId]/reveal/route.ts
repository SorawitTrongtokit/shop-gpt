import { decryptVoucherCode } from "@/lib/voucher-crypto";
import { isAdmin } from "@/lib/auth";
import { requirePrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function POST(
  _request: Request,
  context: { params: Promise<{ orderNumber: string; voucherId: string }> },
) {
  try {
    const user = await requireUser();
    const { orderNumber, voucherId } = await context.params;
    const prisma = requirePrisma();
    const voucher = await prisma.voucherInventory.findFirst({
      where: {
        id: voucherId,
        status: "DELIVERED",
        deliveredOrder: { orderNumber },
      },
      include: {
        deliveredOrder: true,
      },
    });
    if (
      !voucher ||
      !voucher.deliveredOrder ||
      (voucher.deliveredOrder.userId !== user.id && !isAdmin(user.email))
    ) {
      return Response.json({ error: "ไม่พบ Voucher" }, { status: 404 });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "VOUCHER_REVEALED",
        entity: "VoucherInventory",
        entityId: voucher.id,
      },
    });
    return Response.json({ code: decryptVoucherCode(voucher.encryptedCode) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ไม่สามารถแสดง Voucher";
    return Response.json(
      { error: message },
      { status: message === "UNAUTHORIZED" ? 401 : 503 },
    );
  }
}
