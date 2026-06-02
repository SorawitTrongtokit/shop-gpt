import { fallbackProducts, type CatalogProduct } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

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
    slug: string;
    label: string;
    durationMonths: number;
    price: number;
    currency: string;
  }>;
}): CatalogProduct {
  return {
    ...product,
    accent: product.accent as CatalogProduct["accent"],
    variants: product.variants.map((variant) => ({
      ...variant,
      currency: "THB" as const,
    })),
  };
}

export async function getPublishedProducts() {
  if (!prisma) return fallbackProducts;
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
  return products.length ? products.map(toCatalogProduct) : fallbackProducts;
}

export async function getCatalogProduct(slug: string) {
  if (!prisma) return fallbackProducts.find((product) => product.slug === slug);
  const product = await prisma.product.findUnique({
    where: { slug, isPublished: true },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { durationMonths: "asc" },
      },
    },
  });
  return product ? toCatalogProduct(product) : undefined;
}
