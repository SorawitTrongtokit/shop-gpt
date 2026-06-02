# PrimePass

ร้าน Voucher ดิจิทัลภาษาไทยสำหรับสินค้าจาก distributor ที่ได้รับอนุญาต สร้างด้วย Next.js App Router, Prisma, PostgreSQL, Better Auth และ Resend

## ฟีเจอร์

- Storefront responsive: หน้าแรก, catalog, product detail, cart และ checkout
- Demo payment adapter พร้อม UI สำหรับ PromptPay QR และเส้นทางเปลี่ยน provider ใน production
- Better Auth แบบ email/password
- Prisma schema สำหรับสินค้า variants, Voucher inventory, order, payment และ audit log
- Voucher encryption แบบ AES-256-GCM, duplicate hash, masked display และ reveal audit
- Admin dashboard สำหรับสินค้า, order และ CSV inventory import
- SEO metadata, JSON-LD, sitemap และ robots policy

## เริ่มต้นใช้งาน

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate:dev -- --name init
npm run db:seed
npm run dev
```

สร้าง encryption key:

```bash
openssl rand -hex 32
```

หากยังไม่ตั้ง `DATABASE_URL` หน้าร้านยังเปิดดูและทดลอง cart/checkout ได้ โดย checkout จะใช้ local demo fallback ระบบบัญชีและ API production จะเปิดเมื่อเชื่อม PostgreSQL แล้ว

## CSV Inventory

```csv
variantSlug,code,expiresAt
netflix-gift-code-1-month,EXAMPLE-CODE-0001,2027-12-31
spotify-gift-card-1-month,EXAMPLE-CODE-0002,
```

Voucher จะถูกเข้ารหัสก่อนบันทึก และ `codeHash` จะใช้ตรวจรายการซ้ำโดยไม่เก็บ plaintext

## Deploy: Vercel + Neon

1. สร้าง Neon database ผ่าน Vercel Marketplace
2. ตั้งค่า env ตาม `.env.example`
3. รัน `npm run db:migrate` และ `npm run db:seed`
4. Verify domain ใน Resend แล้วตั้ง `RESEND_API_KEY` และ `EMAIL_FROM`
5. Deploy ไปยัง Vercel; `vercel.json` ตั้ง daily cleanup สำหรับ Hobby plan
6. ทดสอบ register, checkout, email link, reveal และ admin CSV import

เมื่อเปิดรับเงินจริง ให้สร้าง Stripe adapter เพิ่มจาก interface ใน `src/lib/payments.ts`, เชื่อม webhook และเปิด PromptPay ใน Stripe Dashboard

## ตรวจสอบคุณภาพ

```bash
npm run lint
npm run test
npm run build
```
