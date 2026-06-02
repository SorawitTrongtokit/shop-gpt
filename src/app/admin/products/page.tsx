import Image from "next/image";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatTHB } from "@/lib/catalog";
import { getPublishedProducts } from "@/lib/catalog-service";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const products = prisma
    ? await prisma.product.findMany({
        include: { variants: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <AdminShell title="จัดการสินค้า">
      <div className="mb-6 flex justify-end">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
        >
          <Plus size={16} />
          เพิ่มสินค้าใหม่
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              {["สินค้า", "หมวดหมู่", "ราคาเริ่มต้น", "Variants", "สถานะ", "จัดการ"].map(
                (head) => (
                  <th key={head} className="px-5 py-4 font-black">
                    {head}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.slug} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={product.imageUrl}
                        alt=""
                        width={72}
                        height={45}
                        className="rounded-md object-cover"
                      />
                      <span className="font-bold">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">{product.category}</td>
                  <td className="px-5 py-4 font-bold">
                    {product.variants.length > 0
                      ? formatTHB(product.variants[0].price)
                      : "-"}
                  </td>
                  <td className="px-5 py-4">{product.variants.length} รายการ</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        product.isPublished
                          ? "bg-green-50 text-[#158257]"
                          : "bg-surface text-muted"
                      }`}
                    >
                      {product.isPublished ? "เผยแพร่" : "ซ่อน"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="flex items-center gap-1 font-bold text-brand hover:text-brand-dark"
                    >
                      <Edit size={16} />
                      แก้ไข
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted">
                  ยังไม่มีข้อมูลสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
