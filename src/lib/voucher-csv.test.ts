import { beforeAll, describe, expect, it } from "vitest";
import { parseVoucherCsv } from "@/lib/voucher-csv";

beforeAll(() => {
  process.env.VOUCHER_ENCRYPTION_KEY = "22".repeat(32);
});

describe("voucher CSV", () => {
  it("parses valid inventory rows", () => {
    const rows = parseVoucherCsv(`variantSlug,code,expiresAt
netflix-gift-code-1-month,netflix-0001,2027-12-31`);
    expect(rows).toHaveLength(1);
    expect(rows[0].variantSlug).toBe("netflix-gift-code-1-month");
  });

  it("rejects duplicate codes inside a file", () => {
    expect(() =>
      parseVoucherCsv(`variantSlug,code
netflix-gift-code-1-month,netflix-0001
netflix-gift-code-1-month,NETFLIX-0001`),
    ).toThrow("Voucher ซ้ำ");
  });
});
