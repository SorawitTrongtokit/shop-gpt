import { describe, expect, it } from "vitest";
import { calculateCartTotal, sanitizeCart } from "@/lib/cart-utils";

describe("cart utilities", () => {
  it("calculates totals from trusted catalog prices", () => {
    expect(
      calculateCartTotal([
        { variantSlug: "netflix-gift-code-1-month", quantity: 1 },
        { variantSlug: "spotify-gift-card-1-month", quantity: 2 },
      ]),
    ).toBe(517);
  });

  it("drops malformed cart lines", () => {
    const cart = sanitizeCart({
      items: [
        { variantSlug: "netflix-gift-code-1-month", quantity: 1 },
        { variantSlug: "missing", quantity: 3 },
      ],
    });
    expect(cart.items).toHaveLength(1);
  });
});
