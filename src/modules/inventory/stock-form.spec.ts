import { describe, expect, it } from "vitest"

import { getAddStockDefaults } from "./stock-form"

describe("add-stock form defaults", () => {
  it("uses the previous cost price instead of the selling price", () => {
    expect(getAddStockDefaults("1250.00")).toEqual({
      unitCost: "1250.00",
      note: "New purchase",
      recordExpense: true,
    })
  })

  it("leaves unit cost empty when there is no previous cost", () => {
    expect(getAddStockDefaults(null).unitCost).toBe("")
  })
})
