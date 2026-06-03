import { afterEach, describe, expect, it } from "vitest";
import { verifyEasySlipBankImage } from "./payments";

const originalPromptPayId = process.env.PROMPTPAY_ID;

describe("verifyEasySlipBankImage security rules", () => {
  afterEach(() => {
    global.fetch = undefined as any;
    process.env.EASYSLIP_API_KEY = undefined;
    process.env.PROMPTPAY_ID = originalPromptPayId;
  });

  const mockImage = new File(["dummy content"], "slip.jpg", { type: "image/jpeg" });

  it("throws if API key is not configured", async () => {
    await expect(verifyEasySlipBankImage({ image: mockImage, orderNumber: "1", total: 100 }))
      .rejects.toThrow("EASYSLIP_API_KEY is not configured.");
  });

  it("throws if slip receiver does not match shop promptpay ID", async () => {
    process.env.EASYSLIP_API_KEY = "test";
    process.env.PROMPTPAY_ID = "0812345678"; // 10 digits
    
    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          amountInSlip: 100,
          rawSlip: { receiver: { proxy: { account: "082-xxx-5678" } } } // wrong receiver (first digit differs)
        }
      })
    }) as any;

    await expect(verifyEasySlipBankImage({ image: mockImage, orderNumber: "1", total: 100 }))
      .rejects.toThrow("บัญชีผู้รับเงินในสลิปไม่ถูกต้อง (ไม่ใช่บัญชีของร้านค้า)");
  });

  it("succeeds if receiver matches and amount matches", async () => {
    process.env.EASYSLIP_API_KEY = "test";
    process.env.PROMPTPAY_ID = "0812345678"; 
    
    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          amountInSlip: 100,
          rawSlip: { receiver: { proxy: { account: "081-xxx-*678" } } } // correct receiver masked
        }
      })
    }) as any;

    const result = await verifyEasySlipBankImage({ image: mockImage, orderNumber: "1", total: 100 });
    expect(result.status).toBe("SUCCEEDED");
  });
});
