import type { CatalogProduct } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

const RESERVATION_WINDOW_MS = 15 * 60 * 1000;

function toCatalogProduct(product: {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  imageUrl: string;
  accent: string;
  seoTitle: string;
  seoDescription: string;
  variants: Array<{
    id: string;
    slug: string;
    label: string;
    durationMonths: number;
    price: number;
    currency: string;
  }>;
}, stockByVariantId: Map<string, number>): CatalogProduct {
  return {
    ...product,
    accent: product.accent as CatalogProduct["accent"],
    variants: product.variants.map((variant) => {
      const { id, ...publicVariant } = variant;
      return {
        ...publicVariant,
        currency: "THB" as const,
        stock: stockByVariantId.get(id) ?? 0,
      };
    }),
  };
}

export async function getPublishedProducts() {
  if (!prisma) return [];
  const now = new Date();
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { durationMonths: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  const productsWithVariants = products.filter((product) => product.variants.length > 0);
  const stockByVariantId = await getStockByVariantId(
    productsWithVariants.flatMap((product) =>
      product.variants.map((variant) => variant.id),
    ),
    now,
  );
  return productsWithVariants.map((product) =>
    toCatalogProduct(product, stockByVariantId),
  );
}

export async function getCatalogProduct(slug: string) {
  if (!prisma) return undefined;
  const now = new Date();
  const product = await prisma.product.findUnique({
    where: { slug, isPublished: true },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { durationMonths: "asc" },
      },
    },
  });
  if (!product || product.variants.length === 0) return undefined;
  const stockByVariantId = await getStockByVariantId(
    product.variants.map((variant) => variant.id),
    now,
  );
  return toCatalogProduct(product, stockByVariantId);
}

async function getStockByVariantId(variantIds: string[], now: Date) {
  if (!prisma || !variantIds.length) return new Map<string, number>();
  const sellableUntil = new Date(now.getTime() + RESERVATION_WINDOW_MS);
  const groups = await prisma.voucherInventory.groupBy({
    by: ["variantId"],
    where: {
      variantId: { in: variantIds },
      status: "AVAILABLE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: sellableUntil } }],
    },
    _count: { _all: true },
  });

  return new Map(groups.map((group) => [group.variantId, group._count._all]));
}
