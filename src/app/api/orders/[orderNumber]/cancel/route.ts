import { revalidatePath } from "next/cache";
import { cancelPaymentOrderForUser } from "@/lib/orders";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const user = await requireUser();
    const { orderNumber } = await context.params;
    const order = await cancelPaymentOrderForUser(orderNumber, user.id);

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderNumber}`);

    return Response.json({
      orderNumber: order.orderNumber,
      status: order.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ยกเลิกคำสั่งซื้อไม่สำเร็จ";
    const status =
      message === "UNAUTHORIZED"
        ? 401
        : message.includes("DATABASE_URL")
          ? 503
          : 400;
    return Response.json({ error: message }, { status });
  }
}
