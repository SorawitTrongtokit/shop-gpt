import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const updateSchema = z.object({
  description: z.string().trim().min(10).max(500).optional(),
  isPublished: z.boolean().optional(),
  variantPrices: z
    .array(z.object({ slug: z.string().trim().min(1), price: z.number().int().positive() }))
    .optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await requireAdmin();
    const { slug } = await context.params;
    const input = updateSchema.parse(await request.json());
    const prisma = requirePrisma();
    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { slug },
        data: {
          description: input.description,
          isPublished: input.isPublished,
        },
      });
      for (const variant of input.variantPrices ?? []) {
        await tx.productVariant.update({
          where: { slug: variant.slug, productId: updated.id },
          data: { price: variant.price },
        });
      }
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "PRODUCT_UPDATED",
          entity: "Product",
          entityId: updated.id,
        },
      });
      return updated;
    });
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    return Response.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "แก้ไขสินค้าไม่สำเร็จ";
    return Response.json(
      { error: message },
      { status: message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 400 },
    );
  }
}
