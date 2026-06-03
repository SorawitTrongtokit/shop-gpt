import { afterEach, describe, expect, it } from "vitest";
import { getPromptPayQrUrl } from "@/lib/payments";

const originalPromptPayId = process.env.PROMPTPAY_ID;

afterEach(() => {
  process.env.PROMPTPAY_ID = originalPromptPayId;
});

describe("payment utilities", () => {
  it("builds PromptPay QR URLs with the configured receiver", () => {
    process.env.PROMPTPAY_ID = "1234567890";
    expect(getPromptPayQrUrl(199)).toBe("https://promptpay.io/1234567890/199.png");
  });

  it("keeps satang precision when the amount has decimals", () => {
    process.env.PROMPTPAY_ID = "1234567890";
    expect(getPromptPayQrUrl(199.5)).toBe("https://promptpay.io/1234567890/199.50.png");
  });
});
