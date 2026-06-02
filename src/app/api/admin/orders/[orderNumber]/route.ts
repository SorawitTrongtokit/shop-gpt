import { z } from "zod";
import { requirePrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const updateSchema = z.object({
  status: z.enum(["CANCELLED", "FULFILLED"]),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const user = await requireAdmin();
    const { orderNumber } = await context.params;
    const { status } = updateSchema.parse(await request.json());
    const prisma = requirePrisma();
    const order = await prisma.order.update({
      where: { orderNumber },
      data: { status },
    });
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ORDER_STATUS_UPDATED",
        entity: "Order",
        entityId: order.id,
        metadata: { status },
      },
    });
    return Response.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "แก้ไขคำสั่งซื้อไม่สำเร็จ";
    return Response.json(
      { error: message },
      { status: message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 400 },
    );
  }
}
