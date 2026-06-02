import { randomUUID } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { requirePrisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments";
import { sendFulfillmentEmail } from "@/lib/email";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function createOrderNumber(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `PP-${date}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function releaseExpiredReservations(now = new Date()) {
  const prisma = requirePrisma();
  return prisma.$transaction(async (tx) => {
    const vouchers = await tx.voucherInventory.updateMany({
      where: {
        status: "RESERVED",
        reservedUntil: { lt: now },
      },
      data: {
        status: "AVAILABLE",
        reservedUntil: null,
        reservedOrderId: null,
      },
    });
    const orders = await tx.order.updateMany({
      where: {
        status: "PENDING_PAYMENT",
        reservationExpiry: { lt: now },
      },
      data: { status: "EXPIRED" },
    });
    return { vouchers: vouchers.count, orders: orders.count };
  });
}

type CheckoutInput = {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{ variantSlug: string; quantity: number }>;
};

export async function reserveCheckout(input: CheckoutInput) {
  const prisma = requirePrisma();
  await releaseExpiredReservations();
  const reservationExpiry = new Date(Date.now() + FIFTEEN_MINUTES);

  return prisma.$transaction(
    async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: {
          slug: { in: input.items.map((item) => item.variantSlug) },
          isActive: true,
          product: { isPublished: true },
        },
        include: { product: true },
      });
      const bySlug = new Map(variants.map((item) => [item.slug, item]));
      if (variants.length !== input.items.length) {
        throw new Error("พบสินค้าที่ไม่พร้อมจำหน่าย");
      }

      const order = await tx.order.create({
        data: {
          orderNumber: createOrderNumber(),
          userId: input.userId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          subtotal: input.items.reduce((sum, line) => {
            return sum + (bySlug.get(line.variantSlug)?.price ?? 0) * line.quantity;
          }, 0),
          total: input.items.reduce((sum, line) => {
            return sum + (bySlug.get(line.variantSlug)?.price ?? 0) * line.quantity;
          }, 0),
          reservationExpiry,
          items: {
            create: input.items.map((line) => {
              const variant = bySlug.get(line.variantSlug)!;
              return {
                variantId: variant.id,
                productName: variant.product.name,
                variantName: variant.label,
                unitPrice: variant.price,
                quantity: line.quantity,
                lineTotal: variant.price * line.quantity,
              };
            }),
          },
        },
      });

      for (const line of input.items) {
        const variant = bySlug.get(line.variantSlug)!;
        const vouchers = await tx.voucherInventory.findMany({
          where: {
            variantId: variant.id,
            status: "AVAILABLE",
            OR: [{ expiresAt: null }, { expiresAt: { gt: reservationExpiry } }],
          },
          orderBy: [{ expiresAt: "asc" }, { createdAt: "asc" }],
          take: line.quantity,
        });
        if (vouchers.length !== line.quantity) {
          throw new Error(`${variant.product.name} มี Voucher ไม่เพียงพอ`);
        }
        const reserved = await tx.voucherInventory.updateMany({
          where: {
            id: { in: vouchers.map((voucher) => voucher.id) },
            status: "AVAILABLE",
          },
          data: {
            status: "RESERVED",
            reservedUntil: reservationExpiry,
            reservedOrderId: order.id,
          },
        });
        if (reserved.count !== line.quantity) {
          throw new Error("Voucher ถูกจองโดยคำสั่งซื้ออื่น กรุณาลองใหม่");
        }
      }

      return order;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function fulfillDemoPayment(orderNumber: string, userId: string) {
  const prisma = requirePrisma();
  const provider = getPaymentProvider();
  const payment = await provider.confirm(orderNumber);

  const order = await prisma.$transaction(
    async (tx) => {
      const current = await tx.order.findUnique({
        where: { orderNumber },
      });
      if (!current || current.userId !== userId) {
        throw new Error("ไม่พบคำสั่งซื้อ");
      }
      if (current.status === "FULFILLED") {
        return current;
      }
      if (current.status !== "PENDING_PAYMENT") {
        throw new Error("คำสั่งซื้อนี้ไม่สามารถชำระเงินได้");
      }
      if (current.reservationExpiry < new Date()) {
        throw new Error("คำสั่งซื้อนี้หมดเวลาแล้ว");
      }

      await tx.paymentAttempt.upsert({
        where: { idempotencyKey: `demo:${orderNumber}` },
        update: { status: "SUCCEEDED" },
        create: {
          orderId: current.id,
          provider: provider.name,
          providerRef: payment.providerRef,
          idempotencyKey: `demo:${orderNumber}`,
          status: payment.status,
        },
      });
      await tx.voucherInventory.updateMany({
        where: { reservedOrderId: current.id, status: "RESERVED" },
        data: {
          status: "DELIVERED",
          deliveredOrderId: current.id,
          reservedUntil: null,
        },
      });
      return tx.order.update({
        where: { id: current.id },
        data: { status: "FULFILLED" },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  await sendFulfillmentEmail({
    to: order.customerEmail,
    customerName: order.customerName,
    orderNumber: order.orderNumber,
  });
  return order;
}
