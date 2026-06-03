import type { VoucherStatus as VoucherStatusType } from "@/generated/prisma/enums";
import { VoucherStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const STATUSES = [
  VoucherStatus.AVAILABLE,
  VoucherStatus.RESERVED,
  VoucherStatus.DELIVERED,
  VoucherStatus.DISABLED,
] as const;

const EXPIRING_SOON_DAYS = 30;
const RECENT_VOUCHER_LIMIT = 120;

type CountMap = Record<VoucherStatusType, number>;

export type AdminInventoryData = NonNullable<
  Awaited<ReturnType<typeof getAdminInventoryData>>
>;

export async function getAdminInventoryData() {
  if (!prisma) return null;

  const now = new Date();
  const expiringSoon = new Date(
    now.getTime() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000,
  );

  const [products, groupedCounts, expiringGroups, expiredGroups, recentVouchers] =
    await Promise.all([
      prisma.product.findMany({
        select: {
          id: true,
          slug: true,
          name: true,
          shortName: true,
          category: true,
          imageUrl: true,
          isPublished: true,
          variants: {
            select: {
              id: true,
              slug: true,
              label: true,
              durationMonths: true,
              price: true,
              stockThreshold: true,
              isActive: true,
            },
            orderBy: [{ durationMonths: "asc" }, { createdAt: "asc" }],
          },
        },
        orderBy: [{ isPublished: "desc" }, { createdAt: "asc" }],
      }),
      prisma.voucherInventory.groupBy({
        by: ["variantId", "status"],
        _count: { _all: true },
      }),
      prisma.voucherInventory.groupBy({
        by: ["variantId"],
        where: {
          status: VoucherStatus.AVAILABLE,
          expiresAt: { gte: now, lte: expiringSoon },
        },
        _count: { _all: true },
      }),
      prisma.voucherInventory.groupBy({
        by: ["variantId"],
        where: {
          status: VoucherStatus.AVAILABLE,
          expiresAt: { lt: now },
        },
        _count: { _all: true },
      }),
      prisma.voucherInventory.findMany({
        select: {
          id: true,
          status: true,
          codeHash: true,
          expiresAt: true,
          reservedUntil: true,
          createdAt: true,
          updatedAt: true,
          variant: {
            select: {
              slug: true,
              label: true,
              product: {
                select: {
                  name: true,
                  shortName: true,
                },
              },
            },
          },
          reservedOrder: { select: { orderNumber: true } },
          deliveredOrder: { select: { orderNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        take: RECENT_VOUCHER_LIMIT,
      }),
    ]);

  const countsByVariant = new Map<string, CountMap>();
  for (const group of groupedCounts) {
    countsByVariant.set(group.variantId, {
      ...emptyCounts(),
      ...countsByVariant.get(group.variantId),
      [group.status]: group._count._all,
    });
  }

  const expiringByVariant = new Map(
    expiringGroups.map((group) => [group.variantId, group._count._all]),
  );
  const expiredByVariant = new Map(
    expiredGroups.map((group) => [group.variantId, group._count._all]),
  );

  const variants = products.flatMap((product) =>
    product.variants.map((variant) => {
      const counts = countsByVariant.get(variant.id) ?? emptyCounts();
      const expiredAvailable = expiredByVariant.get(variant.id) ?? 0;
      const sellable = Math.max(counts.AVAILABLE - expiredAvailable, 0);
      const total = STATUSES.reduce((sum, status) => sum + counts[status], 0);
      return {
        id: variant.id,
        slug: variant.slug,
        label: variant.label,
        durationMonths: variant.durationMonths,
        price: variant.price,
        stockThreshold: variant.stockThreshold,
        isActive: variant.isActive,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        productShortName: product.shortName,
        productCategory: product.category,
        productImageUrl: product.imageUrl,
        productPublished: product.isPublished,
        counts,
        total,
        sellable,
        lowStock: variant.isActive && sellable <= variant.stockThreshold,
        expiringSoon: expiringByVariant.get(variant.id) ?? 0,
        expiredAvailable,
      };
    }),
  );

  const summary = variants.reduce(
    (current, variant) => ({
      sellable: current.sellable + variant.sellable,
      availableRaw: current.availableRaw + variant.counts.AVAILABLE,
      reserved: current.reserved + variant.counts.RESERVED,
      delivered: current.delivered + variant.counts.DELIVERED,
      disabled: current.disabled + variant.counts.DISABLED,
      expiredAvailable: current.expiredAvailable + variant.expiredAvailable,
      expiringSoon: current.expiringSoon + variant.expiringSoon,
      total: current.total + variant.total,
      lowStockVariants: current.lowStockVariants + (variant.lowStock ? 1 : 0),
    }),
    {
      sellable: 0,
      availableRaw: 0,
      reserved: 0,
      delivered: 0,
      disabled: 0,
      expiredAvailable: 0,
      expiringSoon: 0,
      total: 0,
      lowStockVariants: 0,
    },
  );

  return {
    generatedAt: now.toISOString(),
    summary,
    variants,
    recentVouchers: recentVouchers.map((voucher) => ({
      id: voucher.id,
      codeFingerprint: voucher.codeHash.slice(0, 10).toUpperCase(),
      status: voucher.status,
      expiresAt: voucher.expiresAt?.toISOString() ?? null,
      reservedUntil: voucher.reservedUntil?.toISOString() ?? null,
      createdAt: voucher.createdAt.toISOString(),
      updatedAt: voucher.updatedAt.toISOString(),
      variantSlug: voucher.variant.slug,
      variantLabel: voucher.variant.label,
      productName: voucher.variant.product.name,
      productShortName: voucher.variant.product.shortName,
      reservedOrderNumber: voucher.reservedOrder?.orderNumber ?? null,
      deliveredOrderNumber: voucher.deliveredOrder?.orderNumber ?? null,
    })),
  };
}

function emptyCounts(): CountMap {
  return {
    AVAILABLE: 0,
    RESERVED: 0,
    DELIVERED: 0,
    DISABLED: 0,
  };
}
