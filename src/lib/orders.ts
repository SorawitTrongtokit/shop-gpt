import { randomUUID } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { requirePrisma } from "@/lib/prisma";
import type { PaymentConfirmation } from "@/lib/payments";
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

export async function getPaymentOrderForUser(orderNumber: string, userId: string) {
  const prisma = requirePrisma();
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      orderNumber: true,
      userId: true,
      status: true,
      total: true,
      currency: true,
      reservationExpiry: true,
      items: {
        select: {
          productName: true,
          variantName: true,
          quantity: true,
          lineTotal: true,
        },
      },
    },
  });
  if (!order || order.userId !== userId) {
    throw new Error("ไม่พบคำสั่งซื้อ");
  }
  if (order.status === "PENDING_PAYMENT" && order.reservationExpiry < new Date()) {
    await releaseExpiredReservations();
    throw new Error("คำสั่งซื้อนี้หมดเวลาแล้ว");
  }
  return order;
}

export async function cancelPaymentOrderForUser(orderNumber: string, userId: string) {
  const prisma = requirePrisma();
  return prisma.$transaction(
    async (tx) => {
      const current = await tx.order.findUnique({
        where: { orderNumber },
      });
      if (!current || current.userId !== userId) {
        throw new Error("ไม่พบคำสั่งซื้อ");
      }
      if (current.status === "CANCELLED") {
        return current;
      }
      if (current.status === "FULFILLED" || current.status === "PAID") {
        throw new Error("คำสั่งซื้อนี้ชำระเงินสำเร็จแล้ว ไม่สามารถยกเลิกได้");
      }
      if (current.status !== "PENDING_PAYMENT" && current.status !== "EXPIRED") {
        throw new Error("คำสั่งซื้อนี้ไม่สามารถยกเลิกได้");
      }

      await tx.voucherInventory.updateMany({
        where: { reservedOrderId: current.id, status: "RESERVED" },
        data: {
          status: "AVAILABLE",
          reservedUntil: null,
          reservedOrderId: null,
        },
      });

      const cancelled = await tx.order.update({
        where: { id: current.id },
        data: { status: "CANCELLED" },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: "ORDER_CANCELLED_BY_CUSTOMER",
          entity: "Order",
          entityId: current.id,
          metadata: { orderNumber },
        },
      });

      return cancelled;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function fulfillPromptPayPayment({
  orderNumber,
  payment,
  userId,
}: {
  orderNumber: string;
  payment: PaymentConfirmation;
  userId: string;
}) {
  const prisma = requirePrisma();
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
      if (Math.abs(payment.amountInSlip - current.total) >= 0.01) {
        throw new Error("ยอดเงินในสลิปไม่ตรงกับยอดคำสั่งซื้อ");
      }

      const idempotencyKey = `easyslip:${payment.providerRef}`;
      const existingPayment = await tx.paymentAttempt.findUnique({
        where: { idempotencyKey },
      });
      if (existingPayment && existingPayment.orderId !== current.id) {
        throw new Error("สลิปนี้ถูกใช้กับคำสั่งซื้ออื่นแล้ว");
      }
      if (existingPayment) {
        await tx.paymentAttempt.update({
          where: { id: existingPayment.id },
          data: { status: "SUCCEEDED" },
        });
      } else {
        await tx.paymentAttempt.create({
          data: {
            orderId: current.id,
            provider: "easyslip",
            providerRef: payment.providerRef,
            idempotencyKey,
            status: payment.status,
          },
        });
      }

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
