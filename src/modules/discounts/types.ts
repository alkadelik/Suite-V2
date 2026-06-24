import { TableColumn } from "@components/DataTable.vue"

// ============================================================================
// BASE TYPES & ENUMS
// ============================================================================
export type TCouponScope = "order" | "products" // UI concept (Order vs Products)
export type TTargetMode = "all" | "products" | "categories"
export type TCouponDiscountKind = "percentage" | "fixed" // UI concept
export type TApiDiscountType = "percentage" | "flat" | "combined" // API enum
export type TCouponTargetType = "order" | "products" | "categories" // API enum
export type TCouponStatus = "active" | "disabled" | "expired"
export type TCouponAction = "view" | "edit" | "duplicate" | "disable" | "delete"

// ============================================================================
// CORE ENTITY (mirrors the live `Coupon` schema)
// ============================================================================
export interface TCoupon {
  uid: string
  code: string
  name: string
  description?: string
  target_type: TCouponTargetType
  discount_type: TApiDiscountType
  flat_discount: string | null
  percentage_discount: string | null
  discount_cap: string | null // max discount amount for a percentage coupon (% cap)
  is_global: boolean
  locations: string[]
  applicable_products: string[]
  categories: string[]
  exclude_promo_products: boolean
  min_order_amount: string | null
  min_order_quantity: number | null
  max_usage: number | null
  max_usage_per_customer: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  discount_description: string // read-only computed
  is_valid: string // read-only computed
  created_at: string
}

// Row type used by the table (derived/flattened for cell rendering)
export type TCouponRow = TCoupon &
  Record<string, unknown> & {
    scope: TCouponScope
    status: TCouponStatus
  }

// ============================================================================
// PAYLOAD (mirrors `CouponCreate` + assumed fields)
// ============================================================================
export interface ICouponPayload {
  code: string
  name: string
  description?: string
  target_type?: TCouponTargetType
  discount_type: TApiDiscountType
  flat_discount?: string | null
  percentage_discount?: string | null
  discount_cap?: string | null
  is_global?: boolean
  locations?: string[]
  applicable_products?: string[]
  categories?: string[]
  exclude_promo_products?: boolean
  min_order_amount?: string | null
  min_order_quantity?: number | null
  max_usage?: number | null
  max_usage_per_customer?: number
  valid_from: string
  valid_until?: string | null
  is_active?: boolean
}

// Usage stats for the details gauge — shape ASSUMED, confirm at integration
export interface TCouponUsageStats {
  total_usage: number
  max_usage: number | null
  remaining: number | null
}

// Normalized wizard form model (UI-side; mapped to ICouponPayload on submit)
export interface ICouponFormModel {
  scope: TCouponScope
  name: string
  code: string
  discountKind: TCouponDiscountKind
  percentage_off: string
  max_discount_amount: string // % cap (optional)
  flat_amount: string
  valid_from: string
  valid_until: string
  // applies-to (products scope only)
  targetMode: TTargetMode
  productUids: string[]
  variantSelections: Record<string, string[]> // productUid -> selected variant uids ([] = all)
  categoryUids: string[]
  // usage limits
  max_usage: string
  max_usage_per_customer: string
  enable_min_amount: boolean
  min_order_amount: string
  enable_min_items: boolean
  min_cart_items: string
}

// Paginated list response (defensive — supports wrapped + direct shapes)
export interface ICouponListResponse {
  data?: { count: number; next: string | null; previous: string | null; results: TCoupon[] }
  count?: number
  results?: TCoupon[]
}

// ============================================================================
// DISCOUNTS — live `/api/v2/discounts/` contract. A discount targets either a
// list of ProductVariant UIDs (`target_type: products`), a list of category UIDs
// (`target_type: categories`), or the whole store (`target_type: storefront`).
// Backend provides computed `status` + `variant_count`.
// ============================================================================
export type TDiscountTargetType = "products" | "categories" | "storefront"
export type TDiscountApiType = "percentage" | "fixed_amount"
// Backend `status` (confirmed enum on the `status` list filter).
export type TDiscountStatus = "active" | "scheduled" | "expired" | "disabled"

// Embedded in DiscountDetail.variants (read-only summary, no client hydration).
export interface TDiscountVariant {
  uid: string
  name: string
  sku: string
  price: string
  promo_price: string | null
  product_uid: string
  product_name: string
  product_image?: string | null
  image?: string | null
}

// Embedded in DiscountDetail.categories (read-only summary) for category discounts.
export interface TDiscountCategorySummary {
  uid: string
  name: string
  product_count: string
}

export interface TDiscount {
  uid: string
  name: string
  discount_type: TDiscountApiType
  value: string // percentage (0-100) or fixed amount
  max_discount_amount: string | null // % cap (percentage only)
  start_at: string
  end_at: string | null
  is_enabled: boolean
  is_applied: boolean // ro — true once promo_price written to all variants
  target_type: TDiscountTargetType
  status: string // ro, backend-computed (TDiscountStatus values)
  variant_count: string // ro
  created_at: string
  updated_at: string
}

export interface TDiscountDetail extends TDiscount {
  variants: TDiscountVariant[]
  categories: TDiscountCategorySummary[]
}

export type TDiscountRow = TDiscount &
  Record<string, unknown> & {
    scope: TDiscountTargetType
    status: string
  }

// POST /discounts/ body (DiscountCreate)
// - products:   send `variants` (ProductVariant UIDs)
// - categories: send `categories` (category UIDs; backend resolves the variants)
// - storefront: send neither (applies to the whole store)
export interface IDiscountPayload {
  name: string
  discount_type: TDiscountApiType
  value: string
  max_discount_amount?: string | null
  start_at: string
  end_at?: string | null
  is_enabled?: boolean
  target_type?: TDiscountTargetType
  variants?: string[]
  categories?: string[]
  force_overwrite?: boolean
}

// PATCH /discounts/{uid}/ body — only these are editable
export interface IDiscountUpdatePayload {
  name?: string
  end_at?: string | null
  is_enabled?: boolean
}

// Normalized wizard form model (UI-side; mapped to IDiscountPayload on submit)
export interface IDiscountFormModel {
  name: string
  discountKind: TCouponDiscountKind // "percentage" | "fixed"
  value: string // percentage or fixed amount
  max_discount_amount: string // % cap (percentage only)
  start_at: string
  end_at: string
  // applies-to: "all" === Storefront (resolves to all catalogue variants)
  targetMode: TTargetMode
  productUids: string[]
  variantSelections: Record<string, string[]>
  categoryUids: string[]
}

export type { TableColumn }
