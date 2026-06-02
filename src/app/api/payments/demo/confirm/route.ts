import { z } from "zod";
import { fulfillDemoPayment } from "@/lib/orders";
import { requireUser } from "@/lib/session";

const confirmSchema = z.object({
  orderNumber: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { orderNumber } = confirmSchema.parse(await request.json());
    const order = await fulfillDemoPayment(orderNumber, user.id);
    return Response.json({ orderNumber: order.orderNumber, status: order.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ไม่สามารถยืนยันการชำระเงิน";
    const status =
      message === "UNAUTHORIZED"
        ? 401
        : message.includes("DATABASE_URL")
          ? 503
          : 400;
    return Response.json({ error: message }, { status });
  }
}
