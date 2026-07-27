import type { IDiscountFormModel, TDiscountDetail, TDiscountRow } from "../types"

/**
 * Static, non-persisting example used by the Discounts walkthrough. The tour never
 * POSTs to /discounts — it walks through this pre-filled sample so the merchant can
 * learn the flow without leaving a real promotion on their store.
 */
export const DISCOUNT_TOUR_UID = "tour-discount"

const DAY = 24 * 60 * 60 * 1000

/** Dates are generated relative to now so the demo always reads as "active". */
function tourDates(): { start_at: string; end_at: string } {
  const now = Date.now()
  return {
    start_at: new Date(now - DAY).toISOString(),
    end_at: new Date(now + 13 * DAY).toISOString(),
  }
}

/** The form the Create Discount drawer shows while the tour is running. */
export function buildDiscountTourFormModel(): IDiscountFormModel {
  const { start_at, end_at } = tourDates()
  return {
    name: "Weekend Flash Sale",
    discountKind: "percentage",
    value: "15",
    max_discount_amount: "",
    start_at,
    end_at,
    targetMode: "all",
    productUids: [],
    variantSelections: {},
    categoryUids: [],
  }
}

function baseDiscount() {
  const { start_at, end_at } = tourDates()
  return {
    uid: DISCOUNT_TOUR_UID,
    name: "Weekend Flash Sale",
    discount_type: "percentage" as const,
    value: "15",
    max_discount_amount: null,
    start_at,
    end_at,
    is_enabled: true,
    is_applied: true,
    target_type: "storefront" as const,
    status: "active",
    variant_count: "0",
    created_at: start_at,
    updated_at: start_at,
  }
}

/** Demo row prepended to the discounts table during the tour. */
export function buildDiscountTourRow(): TDiscountRow {
  const discount = baseDiscount()
  return { ...discount, scope: discount.target_type, status: discount.status }
}

/** Demo detail rendered by the discount details page during the tour. */
export function buildDiscountTourDetail(): TDiscountDetail {
  return { ...baseDiscount(), variants: [], categories: [] }
}
