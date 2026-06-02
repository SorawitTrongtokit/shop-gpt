"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { productSchema, type ProductFormValues } from "./schema";

export async function saveProduct(data: ProductFormValues) {
  await requireAdmin();

  if (!prisma) throw new Error("Database not connected");

  const parsed = productSchema.parse(data);
  const { id, variants, ...productData } = parsed;

  if (id) {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: productData,
      });

      const existingVariants = await tx.productVariant.findMany({
        where: { productId: id },
      });
      const variantIdsToKeep = variants.map((v) => v.id).filter(Boolean) as string[];

      const toDelete = existingVariants.filter(
        (v) => !variantIdsToKeep.includes(v.id),
      );
      if (toDelete.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: toDelete.map((v) => v.id) } },
        });
      }

      for (const v of variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              slug: v.slug,
              label: v.label,
              durationMonths: v.durationMonths,
              price: v.price,
              stockThreshold: v.stockThreshold,
              isActive: v.isActive,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              slug: v.slug,
              label: v.label,
              durationMonths: v.durationMonths,
              price: v.price,
              stockThreshold: v.stockThreshold,
              isActive: v.isActive,
            },
          });
        }
      }
    });
  } else {
    await prisma.product.create({
      data: {
        ...productData,
        variants: {
          create: variants.map((v) => ({
            slug: v.slug,
            label: v.label,
            durationMonths: v.durationMonths,
            price: v.price,
            stockThreshold: v.stockThreshold,
            isActive: v.isActive,
          })),
        },
      },
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  if (!prisma) throw new Error("Database not connected");

  await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}
