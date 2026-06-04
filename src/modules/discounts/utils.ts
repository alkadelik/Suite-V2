import type {
  TCoupon,
  TCouponScope,
  TCouponStatus,
  ICouponFormModel,
  ICouponPayload,
  TApiDiscountType,
} from "./types"

/** SelectField emits the whole option object; pull a scalar value safely. */
export function optionValue<T = string>(v: unknown, key = "value"): T {
  if (v && typeof v === "object" && key in (v as Record<string, unknown>)) {
    return (v as Record<string, unknown>)[key] as T
  }
  return v as T
}

/** Random uppercase alphanumeric coupon code. */
export function generateCouponCode(length = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let out = ""
  const arr = new Uint32Array(length)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr)
    for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length]
  } else {
    for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export function deriveScope(
  c: Pick<TCoupon, "applicable_products" | "applicable_categories">,
): TCouponScope {
  const hasTargets =
    (c.applicable_products?.length ?? 0) > 0 || (c.applicable_categories?.length ?? 0) > 0
  return hasTargets ? "products" : "order"
}

export function deriveStatus(c: Pick<TCoupon, "is_active" | "valid_until">): TCouponStatus {
  if (c.valid_until && new Date(c.valid_until).getTime() < Date.now()) return "expired"
  return c.is_active ? "active" : "disabled"
}

/** Map the UI wizard model to the API payload. */
export function buildCouponPayload(m: ICouponFormModel): ICouponPayload {
  let discount_type: TApiDiscountType
  let percentage_discount: string | null = null
  let flat_discount: string | null = null

  if (m.discountKind === "percentage") {
    if (m.max_discount_amount) {
      discount_type = "combined"
      percentage_discount = m.percentage_off
      flat_discount = m.max_discount_amount
    } else {
      discount_type = "percentage"
      percentage_discount = m.percentage_off
    }
  } else {
    discount_type = "flat"
    flat_discount = m.flat_amount
  }

  const isProducts = m.scope === "products"
  const applicable_products = isProducts && m.targetMode === "products" ? m.productUids : []
  const applicable_categories = isProducts && m.targetMode === "categories" ? m.categoryUids : []

  return {
    code: m.code.trim().toUpperCase(),
    name: m.name.trim(),
    discount_type,
    percentage_discount,
    flat_discount,
    is_global: true,
    applicable_products,
    applicable_categories,
    exclude_promo_products: false,
    min_order_amount: m.enable_min_amount && m.min_order_amount ? m.min_order_amount : null,
    min_cart_items: m.enable_min_items && m.min_cart_items ? Number(m.min_cart_items) : null,
    max_usage: m.max_usage ? Number(m.max_usage) : null,
    max_usage_per_customer: m.max_usage_per_customer ? Number(m.max_usage_per_customer) : 0,
    valid_from: m.valid_from,
    valid_until: m.valid_until || null,
    is_active: true,
  }
}

/** Hydrate a wizard model from an existing coupon (Edit / Duplicate). */
export function couponToFormModel(c: TCoupon): ICouponFormModel {
  const kind = c.discount_type === "flat" ? "fixed" : "percentage"
  return {
    scope: deriveScope(c),
    name: c.name,
    code: c.code,
    discountKind: kind,
    percentage_off: c.percentage_discount ?? "",
    max_discount_amount: c.discount_type === "combined" ? (c.flat_discount ?? "") : "",
    flat_amount: c.discount_type === "flat" ? (c.flat_discount ?? "") : "",
    valid_from: c.valid_from,
    valid_until: c.valid_until ?? "",
    targetMode:
      (c.applicable_categories?.length ?? 0) > 0
        ? "categories"
        : (c.applicable_products?.length ?? 0) > 0
          ? "products"
          : "all",
    productUids: c.applicable_products ?? [],
    variantSelections: {},
    categoryUids: c.applicable_categories ?? [],
    max_usage: c.max_usage != null ? String(c.max_usage) : "",
    max_usage_per_customer: c.max_usage_per_customer ? String(c.max_usage_per_customer) : "",
    enable_min_amount: c.min_order_amount != null,
    min_order_amount: c.min_order_amount ?? "",
    enable_min_items: c.min_cart_items != null,
    min_cart_items: c.min_cart_items != null ? String(c.min_cart_items) : "",
  }
}

const _MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
function _ord(d: number) {
  if (d > 3 && d < 21) return "th"
  switch (d % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}
/** "20%" for percentage/combined, formatted currency for flat. */
export function couponValueLabel(
  c: Pick<TCoupon, "discount_type" | "percentage_discount" | "flat_discount">,
  format: (n: number) => string,
): string {
  if (c.discount_type === "percentage" || c.discount_type === "combined") {
    return `${c.percentage_discount ?? 0}%`
  }
  return format(Number(c.flat_discount ?? 0))
}

/** "27th May, 2026" */
export function formatCouponDate(iso: string | null | undefined): string {
  if (!iso) return "--"
  const d = new Date(iso)
  return `${d.getDate()}${_ord(d.getDate())} ${_MONTHS[d.getMonth()]}, ${d.getFullYear()}`
}

/** "12/05/2026" (DD/MM/YYYY) */
export function formatNumericDate(iso: string | null | undefined): string {
  if (!iso) return "--"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "--"
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

/** "9:37:00 am" */
export function formatTimeOfDay(iso: string | null | undefined): string {
  if (!iso) return "--"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "--"
  let h = d.getHours()
  const ampm = h >= 12 ? "pm" : "am"
  h = h % 12 || 12
  return `${h}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")} ${ampm}`
}

/** Normalize whatever the list endpoint returns into { results, count }. */
export function normalizeCouponList(body: unknown): { results: TCoupon[]; count: number } {
  type TListShape = {
    data?: { results?: TCoupon[]; count?: number }
    results?: TCoupon[]
    count?: number
  }
  const b = body as TListShape
  if (b?.data?.results)
    return { results: b.data.results, count: b.data.count ?? b.data.results.length }
  if (b?.results) return { results: b.results, count: b.count ?? b.results.length }
  if (Array.isArray(b)) return { results: b as TCoupon[], count: (b as TCoupon[]).length }
  return { results: [], count: 0 }
}
