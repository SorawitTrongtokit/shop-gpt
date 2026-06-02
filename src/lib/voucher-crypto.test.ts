import { beforeAll, describe, expect, it } from "vitest";
import {
  decryptVoucherCode,
  encryptVoucherCode,
  hashVoucherCode,
  maskVoucherCode,
  normalizeVoucherCode,
} from "@/lib/voucher-crypto";

beforeAll(() => {
  process.env.VOUCHER_ENCRYPTION_KEY = "11".repeat(32);
});

describe("voucher crypto", () => {
  it("normalizes, encrypts, and decrypts a voucher", () => {
    const encrypted = encryptVoucherCode(" prime-pass 0001 ");
    expect(encrypted).not.toContain("PRIME");
    expect(decryptVoucherCode(encrypted)).toBe("PRIME-PASS0001");
  });

  it("masks all but the final four characters", () => {
    expect(maskVoucherCode("PRIME-PASS-AB12")).toBe("XXXX-XXXX-AB12");
  });

  it("hashes normalized values consistently", () => {
    expect(hashVoucherCode("ab cd")).toBe(hashVoucherCode("ABCD"));
    expect(normalizeVoucherCode(" ab cd ")).toBe("ABCD");
  });
});
