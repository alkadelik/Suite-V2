import { describe, expect, it } from "vitest"

import { buildDiscountTogglePayload } from "./discount-toggle"

describe("discount toggle contract", () => {
  it("sends the current name and explicit desired enabled state", () => {
    expect(buildDiscountTogglePayload("Weekend offer", false)).toEqual({
      name: "Weekend offer",
      is_enabled: false,
    })
  })

  it("rejects an empty name before making the request", () => {
    expect(() => buildDiscountTogglePayload("   ", true)).toThrow("Discount name is required")
  })
})
