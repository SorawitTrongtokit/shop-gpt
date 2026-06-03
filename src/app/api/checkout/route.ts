import { z } from "zod";
import { reserveCheckout } from "@/lib/orders";
import { getPromptPayQrUrl } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        variantSlug: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  try {
    if (!prisma) {
      return Response.json(
        { error: "DATABASE_URL is not configured." },
        { status: 503 },
      );
    }
    const user = await requireUser();
    const input = checkoutSchema.parse(await request.json());
    const order = await reserveCheckout({
      ...input,
      userId: user.id,
      customerName: getCustomerName(user),
      customerEmail: user.email,
      customerPhone: "ACCOUNT_LOGIN",
    });
    return Response.json({
      orderNumber: order.orderNumber,
      total: order.total,
      promptPayQrUrl: getPromptPayQrUrl(order.total),
      reservationExpiry: order.reservationExpiry,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ไม่สามารถสร้างคำสั่งซื้อ";
    const status =
      message === "UNAUTHORIZED"
        ? 401
        : message.includes("DATABASE_URL")
          ? 503
          : 400;
    return Response.json({ error: message }, { status });
  }
}

function getCustomerName(user: { name?: string | null; email: string }) {
  return user.name?.trim() || user.email;
}
