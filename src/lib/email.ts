import { Resend } from "resend";

type FulfillmentEmail = {
  to: string;
  customerName: string;
  orderNumber: string;
};

export async function sendFulfillmentEmail({
  to,
  customerName,
  orderNumber,
}: FulfillmentEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email:disabled] Order ${orderNumber} ready for ${to}`);
    return;
  }

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "PrimePass <onboarding@resend.dev>",
    to,
    subject: `Voucher ของคำสั่งซื้อ ${orderNumber} พร้อมแล้ว`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#0b1b46">
        <h1>Voucher ของคุณพร้อมแล้ว</h1>
        <p>สวัสดี ${customerName}</p>
        <p>คำสั่งซื้อ <strong>${orderNumber}</strong> ชำระเงินสำเร็จแล้ว</p>
        <p><a href="${appUrl}/orders/${orderNumber}">เข้าสู่ระบบเพื่อดู Voucher ของคุณ</a></p>
        <p style="color:#68728a">เพื่อความปลอดภัย PrimePass จะไม่ส่งโค้ดเต็มทางอีเมล</p>
      </div>
    `,
  });
}
