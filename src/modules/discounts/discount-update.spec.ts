import { describe, expect, it } from "vitest"
import { buildDiscountUpdatePayload, discountToFormModel } from "./utils"
import type { IDiscountFormModel, TDiscountDetail } from "./types"

function detail(overrides: Partial<TDiscountDetail> = {}): TDiscountDetail {
  return {
    uid: "discount-1",
    name: "Weekend offer",
    discount_type: "fixed_amount",
    value: "1000.00",
    max_discount_amount: null,
    start_at: "2026-07-01T08:00:00Z",
    end_at: null,
    is_enabled: true,
    is_applied: true,
    target_type: "products",
    status: "active",
    variant_count: "3",
    created_at: "2026-07-01T08:00:00Z",
    updated_at: "2026-07-20T08:00:00Z",
    variants: [
      {
        uid: "variant-1",
        name: "Small",
        sku: "SMALL",
        price: "10000.00",
        promo_price: "9000.00",
        product_uid: "product-1",
        product_name: "Canvas Bag",
      },
      {
        uid: "variant-2",
        name: "Large",
        sku: "LARGE",
        price: "12000.00",
        promo_price: "11000.00",
        product_uid: "product-1",
        product_name: "Canvas Bag",
      },
      {
        uid: "variant-3",
        name: "Default",
        sku: "SOCKS",
        price: "5000.00",
        promo_price: "4000.00",
        product_uid: "product-2",
        product_name: "Smile Socks",
      },
    ],
    categories: [],
    ...overrides,
  }
}

function form(overrides: Partial<IDiscountFormModel> = {}): IDiscountFormModel {
  return {
    name: " Updated offer ",
    discountKind: "fixed",
    value: "1000.00",
    max_discount_amount: "",
    start_at: "2026-07-01T08:00:00Z",
    end_at: "2026-08-01T08:00:00Z",
    targetMode: "products",
    productUids: ["product-1"],
    variantSelections: { "product-1": ["variant-2"] },
    categoryUids: [],
    ...overrides,
  }
}

describe("discount update contract", () => {
  it("hydrates the exact current product and variant targets from discount detail", () => {
    const model = discountToFormModel(detail())

    expect(model.productUids).toEqual(["product-1", "product-2"])
    expect(model.variantSelections).toEqual({
      "product-1": ["variant-1", "variant-2"],
      "product-2": ["variant-3"],
    })
  })

  it("hydrates current category targets from discount detail", () => {
    const model = discountToFormModel(
      detail({
        target_type: "categories",
        variants: [],
        categories: [{ uid: "category-1", name: "Accessories", product_count: "4" }],
      }),
    )

    expect(model.targetMode).toBe("categories")
    expect(model.categoryUids).toEqual(["category-1"])
  })

  it("sends variants as the full desired replacement set without immutable fields", () => {
    const payload = buildDiscountUpdatePayload(form(), ["variant-2", "variant-4"], true)

    expect(payload).toEqual({
      name: "Updated offer",
      end_at: "2026-08-01T08:00:00Z",
      force_overwrite: true,
      variants: ["variant-2", "variant-4"],
    })
    expect(payload).not.toHaveProperty("target_type")
    expect(payload).not.toHaveProperty("discount_type")
    expect(payload).not.toHaveProperty("start_at")
  })

  it("sends categories as the full desired replacement set", () => {
    const payload = buildDiscountUpdatePayload(
      form({ targetMode: "categories", categoryUids: ["category-2"] }),
      [],
    )

    expect(payload).toEqual({
      name: "Updated offer",
      end_at: "2026-08-01T08:00:00Z",
      force_overwrite: false,
      categories: ["category-2"],
    })
  })

  it("does not invent a target payload for immutable storefront targeting", () => {
    const payload = buildDiscountUpdatePayload(form({ targetMode: "all" }), [])

    expect(payload).not.toHaveProperty("variants")
    expect(payload).not.toHaveProperty("categories")
  })
})
