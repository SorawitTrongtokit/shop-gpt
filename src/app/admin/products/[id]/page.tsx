import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  if (!prisma) return notFound();
  
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!product) return notFound();

  return (
    <AdminShell title={`แก้ไขสินค้า: ${product.name}`}>
      <ProductForm initialData={product} />
    </AdminShell>
  );
}
