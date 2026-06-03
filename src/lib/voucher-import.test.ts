import { beforeAll, describe, expect, it } from "vitest";
import { parseVoucherJsonPayload } from "@/lib/voucher-import";

beforeAll(() => {
  process.env.VOUCHER_ENCRYPTION_KEY = "22".repeat(32);
});

describe("voucher JSON import", () => {
  it("parses bulk codes from a textarea payload", () => {
    const rows = parseVoucherJsonPayload({
      variantSlug: "netflix-gift-code-1-month",
      codes: " netflix-0001 \nnetflix-0002\n",
      expiresAt: "2027-12-31",
    });

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      variantSlug: "netflix-gift-code-1-month",
      code: "NETFLIX-0001",
    });
    expect(rows[0].expiresAt?.toISOString()).toBe("2027-12-31T00:00:00.000Z");
  });

  it("rejects duplicate codes inside a JSON payload", () => {
    expect(() =>
      parseVoucherJsonPayload({
        variantSlug: "netflix-gift-code-1-month",
        codes: "netflix-0001\n NETFLIX-0001 ",
      }),
    ).toThrow("Voucher ซ้ำ");
  });
});
