import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { decryptVoucherCode, maskVoucherCode } from "@/lib/voucher-crypto";

export async function getCurrentUserOrders() {
  if (!prisma) return [];
  const session = await getSession();
  if (!session?.user) return null;
  return prisma.order.findMany({
    where: { userId: session.user.id },
    select: {
      orderNumber: true,
      createdAt: true,
      status: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAccessibleOrder(orderNumber: string) {
  if (!prisma) return null;
  const session = await getSession();
  if (!session?.user) return null;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      deliveredVouchers: true,
    },
  });
  if (!order || (order.userId !== session.user.id && !isAdmin(session.user.email))) {
    return null;
  }
  return {
    ...order,
    vouchers: order.deliveredVouchers.map((voucher) => ({
      id: voucher.id,
      masked: maskVoucherCode(decryptVoucherCode(voucher.encryptedCode)),
    })),
  };
}

export async function getAdminOrders() {
  if (!prisma) return null;
  return prisma.order.findMany({
    select: {
      orderNumber: true,
      customerName: true,
      status: true,
      total: true,
      createdAt: true,
      items: { select: { productName: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getAdminSummary() {
  if (!prisma) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayOrders, pendingPayment, fulfilled, variants] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: today } },
      _count: true,
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: "PENDING_PAYMENT" },
      _count: true,
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: "FULFILLED" },
      _count: true,
      _sum: { total: true },
    }),
    prisma.productVariant.findMany({
      where: { isActive: true },
      select: {
        stockThreshold: true,
        _count: {
          select: { vouchers: { where: { status: "AVAILABLE" } } },
        },
      },
    }),
  ]);

  const lowStockCount = variants.filter(
    (v) => v._count.vouchers <= v.stockThreshold
  ).length;

  return {
    todayOrders: {
      count: todayOrders._count,
      total: todayOrders._sum.total ?? 0,
    },
    pendingPayment: {
      count: pendingPayment._count,
      total: pendingPayment._sum.total ?? 0,
    },
    fulfilled: {
      count: fulfilled._count,
      total: fulfilled._sum.total ?? 0,
    },
    lowStockCount,
  };
}
