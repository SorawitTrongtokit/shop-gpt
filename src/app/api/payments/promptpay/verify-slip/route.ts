import { z } from "zod";
import { getPaymentOrderForUser, fulfillPromptPayPayment } from "@/lib/orders";
import { verifyEasySlipBankImage } from "@/lib/payments";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

const verifySlipSchema = z.object({
  orderNumber: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const parsed = verifySlipSchema.safeParse({
      orderNumber: formData.get("orderNumber"),
    });
    if (!parsed.success) {
      throw new Error("ข้อมูลการชำระเงินไม่ถูกต้อง");
    }

    const order = await getPaymentOrderForUser(parsed.data.orderNumber, user.id);
    if (order.status === "FULFILLED") {
      return Response.json({
        orderNumber: order.orderNumber,
        status: order.status,
      });
    }
    if (order.status !== "PENDING_PAYMENT") {
      throw new Error("คำสั่งซื้อนี้ไม่สามารถชำระเงินได้");
    }

    const image = formData.get("slipImage");
    if (!(image instanceof File) || image.size === 0) {
      throw new Error("กรุณาอัปโหลดรูปสลิป");
    }

    const payment = await verifyEasySlipBankImage({
      image,
      orderNumber: order.orderNumber,
      total: order.total,
    });
    const fulfilled = await fulfillPromptPayPayment({
      orderNumber: order.orderNumber,
      payment,
      userId: user.id,
    });

    return Response.json({
      orderNumber: fulfilled.orderNumber,
      status: fulfilled.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ไม่สามารถตรวจสอบสลิปได้";
    const status =
      message === "UNAUTHORIZED"
        ? 401
        : message.includes("DATABASE_URL") || message.includes("EASYSLIP_API_KEY")
          ? 503
          : 400;
    return Response.json({ error: message }, { status });
  }
}
