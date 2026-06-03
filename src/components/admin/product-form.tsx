"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { saveProduct, deleteProduct } from "@/app/admin/products/actions";
import { type ProductFormValues } from "@/app/admin/products/schema";

type ProductVariantFormValues = ProductFormValues["variants"][number];

export function ProductForm({ initialData }: { initialData?: ProductFormValues }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState<ProductFormValues>(
    initialData ?? {
      slug: "",
      name: "",
      shortName: "",
      category: "สตรีมมิงวิดีโอ",
      description: "",
      imageUrl: "",
      accent: "coral",
      seoTitle: "",
      seoDescription: "",
      isPublished: true,
      variants: [
        {
          slug: "",
          label: "",
          durationMonths: 1,
          price: 0,
          stockThreshold: 5,
          isActive: true,
        },
      ],
    },
  );

  function handleChange<Field extends keyof ProductFormValues>(
    field: Field,
    value: ProductFormValues[Field],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleVariantChange<Field extends keyof ProductVariantFormValues>(
    index: number,
    field: Field,
    value: ProductVariantFormValues[Field],
  ) {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  }

  function addVariant() {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          slug: "",
          label: "",
          durationMonths: 1,
          price: 0,
          stockThreshold: 5,
          isActive: true,
        },
      ],
    }));
  }

  function removeVariant(index: number) {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await saveProduct(formData);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "เกิดข้อผิดพลาดในการบันทึกข้อมูล"));
      }
    });
  }

  async function handleDelete() {
    if (!formData.id) return;
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้? ข้อมูลแพ็กเกจย่อยทั้งหมดจะถูกลบไปด้วย")) return;
    setError("");
    startTransition(async () => {
      try {
        await deleteProduct(formData.id!);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "เกิดข้อผิดพลาดในการลบข้อมูล"));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 pb-20">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 rounded-xl border border-line bg-white p-6">
        <h2 className="text-lg font-black">ข้อมูลทั่วไปของสินค้า</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            ชื่อสินค้า
            <input
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-brand"
              placeholder="เช่น Netflix Gift Code"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            ชื่อเรียกย่อ
            <input
              required
              value={formData.shortName}
              onChange={(e) => handleChange("shortName", e.target.value)}
              className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-brand"
              placeholder="เช่น Netflix"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            รหัส (Slug)
            <input
              required
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-brand"
              placeholder="เช่น netflix-gift-code"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            หมวดหมู่
            <select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-brand"
            >
              <option value="สตรีมมิงวิดีโอ">สตรีมมิงวิดีโอ</option>
              <option value="สตรีมมิงเพลง">สตรีมมิงเพลง</option>
              <option value="เกม">เกม</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold sm:col-span-2">
            รายละเอียดสินค้า
            <textarea
              required
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="rounded-lg border border-line p-3 font-normal outline-none focus:border-brand"
              placeholder="อธิบายรายละเอียด..."
            />
          </label>
        </div>
      </div>

      <div className="grid gap-6 rounded-xl border border-line bg-white p-6">
        <h2 className="text-lg font-black">รูปภาพและการตกแต่ง</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            ลิงก์รูปภาพ (URL)
            <input
              required
              value={formData.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-brand"
              placeholder="เช่น /products/netflix.png หรือ https://..."
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            สี Accent
            <select
              value={formData.accent}
              onChange={(e) => handleChange("accent", e.target.value)}
              className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-brand"
            >
              <option value="red">สีแดง (Red)</option>
              <option value="coral">สีส้มอมชมพู (Coral)</option>
              <option value="green">สีเขียว (Green)</option>
              <option value="blue">สีฟ้า (Blue)</option>
              <option value="purple">สีม่วง (Purple)</option>
            </select>
          </label>
          {formData.imageUrl && (
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-bold">ตัวอย่างรูปภาพ</p>
              <div className="relative h-[200px] w-full max-w-[320px] overflow-hidden rounded-xl bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                  onLoad={(e) => (e.currentTarget.style.display = "block")}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 rounded-xl border border-line bg-white p-6">
        <h2 className="text-lg font-black">ข้อมูล SEO</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            SEO Title
            <input
              required
              value={formData.seoTitle}
              onChange={(e) => handleChange("seoTitle", e.target.value)}
              className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-brand"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold sm:col-span-2">
            SEO Description
            <textarea
              required
              value={formData.seoDescription}
              onChange={(e) => handleChange("seoDescription", e.target.value)}
              rows={2}
              className="rounded-lg border border-line p-3 font-normal outline-none focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-6 rounded-xl border border-line bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">แพ็กเกจย่อย (Variants)</h2>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 rounded-lg bg-surface px-4 py-2 text-sm font-bold hover:bg-line"
          >
            <Plus size={16} />
            เพิ่มแพ็กเกจ
          </button>
        </div>

        {formData.variants.length === 0 && (
          <p className="py-4 text-center text-sm text-muted">ยังไม่มีแพ็กเกจย่อย</p>
        )}

        <div className="grid gap-4">
          {formData.variants.map((v, i) => (
            <div key={i} className="relative rounded-lg border border-line bg-surface/30 p-4">
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="absolute right-4 top-4 text-red-500 hover:text-red-700"
                aria-label="ลบแพ็กเกจ"
              >
                <Trash2 size={18} />
              </button>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 pr-8">
                <label className="grid gap-2 text-sm font-bold">
                  ชื่อแพ็กเกจ
                  <input
                    required
                    value={v.label}
                    onChange={(e) => handleVariantChange(i, "label", e.target.value)}
                    className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-brand"
                    placeholder="เช่น 1 เดือน"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  รหัส (Slug)
                  <input
                    required
                    value={v.slug}
                    onChange={(e) => handleVariantChange(i, "slug", e.target.value)}
                    className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-brand"
                    placeholder="เช่น netflix-1-month"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  ราคา (บาท)
                  <input
                    required
                    type="number"
                    min="0"
                    value={v.price}
                    onChange={(e) =>
                      handleVariantChange(i, "price", parseInt(e.target.value) || 0)
                    }
                    className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-brand"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  ระยะเวลา (เดือน)
                  <input
                    required
                    type="number"
                    min="1"
                    value={v.durationMonths}
                    onChange={(e) =>
                      handleVariantChange(
                        i,
                        "durationMonths",
                        parseInt(e.target.value) || 1,
                      )
                    }
                    className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-brand"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  เตือนเมื่อสต็อกเหลือน้อย
                  <input
                    required
                    type="number"
                    min="0"
                    value={v.stockThreshold}
                    onChange={(e) =>
                      handleVariantChange(
                        i,
                        "stockThreshold",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-brand"
                  />
                </label>
                <label className="flex items-center gap-2 pt-6 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={v.isActive}
                    onChange={(e) => handleVariantChange(i, "isActive", e.target.checked)}
                    className="size-4"
                  />
                  เปิดใช้งาน
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 mt-4">
        <label className="flex items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) => handleChange("isPublished", e.target.checked)}
            className="size-4"
          />
          เผยแพร่สินค้า (แสดงหน้าร้าน)
        </label>
        
        <div className="flex gap-4">
          {formData.id && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="flex h-12 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-6 font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
            >
              <Trash2 size={18} />
              ลบสินค้า
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-brand px-8 font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            <Save size={18} />
            {isPending ? "กำลังบันทึก..." : "บันทึกสินค้า"}
          </button>
        </div>
      </div>
    </form>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
