import { AdminShell } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <AdminShell title="เพิ่มสินค้าใหม่">
      <ProductForm />
    </AdminShell>
  );
}
