import { createHash } from "node:crypto";

const EASYSLIP_VERIFY_BANK_URL = "https://api.easyslip.com/v2/verify/bank";
const MAX_SLIP_IMAGE_SIZE = 4 * 1024 * 1024;
const ALLOWED_SLIP_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export type PaymentConfirmation = {
  providerRef: string;
  status: "SUCCEEDED";
  amountInSlip: number;
  isDuplicate: boolean;
  raw: unknown;
};

type EasySlipSuccessResponse = {
  success: true;
  data: {
    isDuplicate?: boolean;
    amountInSlip?: number;
    amountInOrder?: number;
    isAmountMatched?: boolean;
    receiver?: {
      account?: {
        name?: { th?: string; en?: string };
        bank?: { id?: string; name?: string };
        account?: string;
      };
      proxy?: {
        type?: string;
        account?: string;
      };
    };
    rawSlip?: {
      payload?: string;
      transRef?: string;
      date?: string;
      amount?: {
        amount?: number;
      };
      sendingBank?: string;
      receivingBank?: string;
      transDate?: string;
      transTime?: string;
    };
  };
  message?: string;
};

type EasySlipErrorResponse = {
  success?: false;
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
};

export function getPromptPayQrUrl(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("ยอดชำระเงินไม่ถูกต้อง");
  }
  return `https://promptpay.io/${encodeURIComponent(getPromptPayId())}/${formatPromptPayAmount(
    amount,
  )}.png`;
}

function getPromptPayId() {
  return process.env.PROMPTPAY_ID ?? "165990251409";
}

function formatPromptPayAmount(amount: number) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

export async function verifyEasySlipBankImage({
  image,
  orderNumber,
  total,
}: {
  image: File;
  orderNumber: string;
  total: number;
}): Promise<PaymentConfirmation> {
  const apiKey = process.env.EASYSLIP_API_KEY;
  if (!apiKey) {
    throw new Error("EASYSLIP_API_KEY is not configured.");
  }
  validateSlipImage(image);

  const formData = new FormData();
  formData.append("image", image);
  formData.append("remark", orderNumber);
  formData.append("matchAmount", String(total));
  formData.append("checkDuplicate", "true");

  const response = await fetch(EASYSLIP_VERIFY_BANK_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });
  const result = (await response.json().catch(() => null)) as
    | EasySlipSuccessResponse
    | EasySlipErrorResponse
    | null;

  if (!response.ok || !result || result.success !== true) {
    throw new Error(getEasySlipErrorMessage(result, response.status));
  }

  const amountInSlip = Number(
    result.data.amountInSlip ?? result.data.rawSlip?.amount?.amount,
  );
  if (!Number.isFinite(amountInSlip)) {
    throw new Error("ไม่สามารถอ่านยอดเงินจากสลิปได้");
  }

  // Verify receiver account ends with the last 4 digits of our PromptPay ID
  const shopPromptPay = getPromptPayId().replace(/\D/g, "");
  const last4 = shopPromptPay.slice(-4);
  const receiverAcc = (result.data.receiver?.proxy?.account ?? result.data.receiver?.account?.account ?? "").replace(/\D/g, "");
  if (!receiverAcc.endsWith(last4)) {
    throw new Error("บัญชีผู้รับเงินในสลิปไม่ถูกต้อง (ไม่ใช่บัญชีของร้านค้า)");
  }

  if (result.data.isAmountMatched === false || !amountsMatch(amountInSlip, total)) {
    throw new Error("ยอดเงินในสลิปไม่ตรงกับยอดคำสั่งซื้อ");
  }

  return {
    providerRef: getSlipProviderRef(result.data, image),
    status: "SUCCEEDED",
    amountInSlip,
    isDuplicate: Boolean(result.data.isDuplicate),
    raw: result,
  };
}

function validateSlipImage(image: File) {
  if (!ALLOWED_SLIP_IMAGE_TYPES.has(image.type)) {
    throw new Error("รองรับเฉพาะไฟล์สลิป JPEG, PNG, GIF หรือ WebP");
  }
  if (image.size > MAX_SLIP_IMAGE_SIZE) {
    throw new Error("ไฟล์สลิปต้องมีขนาดไม่เกิน 4 MB");
  }
}

function amountsMatch(amountInSlip: number, total: number) {
  return Math.abs(amountInSlip - total) < 0.01;
}

function getSlipProviderRef(
  data: EasySlipSuccessResponse["data"],
  image: File,
) {
  const rawSlip = data.rawSlip;
  if (rawSlip?.transRef) return rawSlip.transRef;

  return createHash("sha256")
    .update(
      [
        image.name,
        image.size,
        image.lastModified,
        data.amountInSlip,
        rawSlip?.payload,
        rawSlip?.date,
        rawSlip?.amount?.amount,
        rawSlip?.sendingBank,
        rawSlip?.receivingBank,
        rawSlip?.transDate,
        rawSlip?.transTime,
      ].join(":"),
    )
    .digest("hex");
}

function getEasySlipErrorMessage(
  result: EasySlipSuccessResponse | EasySlipErrorResponse | null,
  status: number,
) {
  if (result && "error" in result && result.error?.message) {
    return result.error.message;
  }
  if (result?.message) return result.message;
  if (status === 403) return "EasySlip quota หรือ API key ไม่พร้อมใช้งาน";
  if (status === 404) return "ไม่พบข้อมูลสลิป หรือสลิปไม่ถูกต้อง";
  return "ไม่สามารถตรวจสอบสลิปได้";
}
