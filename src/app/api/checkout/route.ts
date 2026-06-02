import { z } from "zod";
import { reserveCheckout } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.email(),
  customerPhone: z.string().trim().min(8).max(30),
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
    const order = await reserveCheckout({ ...input, userId: user.id });
    return Response.json({
      orderNumber: order.orderNumber,
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
