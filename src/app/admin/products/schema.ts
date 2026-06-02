import { z } from "zod";

export const variantSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1, "กรุณากรอกรหัสแพ็กเกจ"),
  label: z.string().min(1, "กรุณากรอกชื่อแพ็กเกจ"),
  durationMonths: z.coerce.number().min(1, "จำนวนเดือนต้องมากกว่า 0"),
  price: z.coerce.number().min(0, "ราคาต้องไม่ติดลบ"),
  stockThreshold: z.coerce.number().min(0),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1, "กรุณากรอกรหัสสินค้า (Slug)"),
  name: z.string().min(1, "กรุณากรอกชื่อสินค้า"),
  shortName: z.string().min(1, "กรุณากรอกชื่อแบบย่อ"),
  category: z.string().min(1, "กรุณากรอกหมวดหมู่"),
  description: z.string().min(1, "กรุณากรอกรายละเอียด"),
  imageUrl: z.string().min(1, "กรุณากรอกลิงก์รูปภาพ"),
  accent: z.string().min(1, "กรุณากรอกสี Accent"),
  seoTitle: z.string().min(1, "กรุณากรอก SEO Title"),
  seoDescription: z.string().min(1, "กรุณากรอก SEO Description"),
  isPublished: z.boolean().default(true),
  variants: z.array(variantSchema).min(1, "ต้องมีแพ็กเกจอย่างน้อย 1 รายการ"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
