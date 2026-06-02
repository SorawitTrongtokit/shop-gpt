import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatTHB } from "@/lib/catalog";
import { getPublishedProducts } from "@/lib/catalog-service";

export default async function AdminProductsPage() {
  const products = await getPublishedProducts();
  return (
    <AdminShell title="จัดการสินค้า">
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              {["สินค้า", "หมวดหมู่", "ราคาเริ่มต้น", "Variants", "สถานะ"].map((head) => (
                <th key={head} className="px-5 py-4 font-black">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slug} className="border-b border-line last:border-b-0">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Image src={product.imageUrl} alt="" width={72} height={45} className="rounded-md" />
                    <span className="font-bold">{product.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">{product.category}</td>
                <td className="px-5 py-4 font-bold">{formatTHB(product.variants[0].price)}</td>
                <td className="px-5 py-4">{product.variants.length}</td>
                <td className="px-5 py-4"><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-[#158257]">เผยแพร่</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
