import { TableColumn } from "@components/DataTable.vue"

// ============================================================================
// BASE TYPES & ENUMS
// ============================================================================
export type TCouponScope = "order" | "products" // UI concept (Order vs Products)
export type TTargetMode = "all" | "products" | "categories"
export type TCouponDiscountKind = "percentage" | "fixed" // UI concept
export type TApiDiscountType = "percentage" | "flat" | "combined" // API enum
export type TCouponStatus = "active" | "disabled" | "expired"
export type TCouponAction = "view" | "edit" | "duplicate" | "disable" | "delete"

// ============================================================================
// CORE ENTITY (mirrors `Coupon` schema; *_categories & min_cart_items ASSUMED)
// ============================================================================
export interface TCoupon {
  uid: string
  code: string
  name: string
  description?: string
  discount_type: TApiDiscountType
  flat_discount: string | null
  percentage_discount: string | null
  is_global: boolean
  locations: string[]
  applicable_products: string[]
  applicable_categories: string[] // ASSUMED backend field
  exclude_promo_products: boolean
  min_order_amount: string | null
  min_cart_items: number | null // ASSUMED backend field
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
  discount_type: TApiDiscountType
  flat_discount?: string | null
  percentage_discount?: string | null
  is_global?: boolean
  locations?: string[]
  applicable_products?: string[]
  applicable_categories?: string[] // ASSUMED
  exclude_promo_products?: boolean
  min_order_amount?: string | null
  min_cart_items?: number | null // ASSUMED
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

export type { TableColumn }
