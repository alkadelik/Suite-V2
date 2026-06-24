import { TableColumn } from "@components/DataTable.vue"
import type { TChipColor } from "@modules/shared/types"
import type {
  TCouponRow,
  TCouponScope,
  TCouponStatus,
  TTargetMode,
  TDiscountRow,
  TDiscountTargetType,
} from "./types"

export const COUPON_COLUMNS: TableColumn<TCouponRow>[] = [
  { header: "Name", accessor: "name", maxWidth: "240px" },
  { header: "Code", accessor: "code" },
  { header: "Scope", accessor: "scope" },
  { header: "Value", accessor: "value" },
  { header: "Usage Count", accessor: "usage" },
  { header: "Status", accessor: "status" },
  { header: "Expiry Date", accessor: "valid_until" },
  { header: "", accessor: "action" },
]

export const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed Amount", value: "fixed" },
]

export const APPLIES_TO_OPTIONS = [
  { label: "All products", value: "all" },
  { label: "Specific products", value: "products" },
  { label: "Specific categories", value: "categories" },
]

export const COUPON_STATUS_META: Record<TCouponStatus, { label: string; color: TChipColor }> = {
  active: { label: "Active", color: "success" },
  disabled: { label: "Disabled", color: "alt" },
  expired: { label: "Expired", color: "error" },
}

export const COUPON_SCOPE_META: Record<TCouponScope, { label: string; color: TChipColor }> = {
  order: { label: "Order", color: "primary" },
  products: { label: "Product", color: "purple" },
}

// Human scope label for the details header chip
export function couponScopeHeaderLabel(scope: TCouponScope, kind: "percentage" | "fixed"): string {
  const verb = kind === "percentage" ? "% off" : "Amount off"
  return scope === "order" ? `${verb} Order` : `${verb} Product`
}

export const TARGET_MODE_LABELS: Record<TTargetMode, string> = {
  all: "All products",
  products: "Specific products",
  categories: "Specific categories",
}

// ============================================================================
// DISCOUNTS
// ============================================================================
export const DISCOUNT_COLUMNS: TableColumn<TDiscountRow>[] = [
  { header: "Name", accessor: "name", maxWidth: "240px" },
  { header: "Type", accessor: "type" },
  { header: "Value", accessor: "value" },
  { header: "Target", accessor: "scope" },
  { header: "Status", accessor: "status" },
  { header: "Expiry Date", accessor: "end_at" },
  { header: "", accessor: "action" },
]

// Target chip colors: Product = orange, Category = purple, Storefront = blue
export const DISCOUNT_SCOPE_META: Record<
  TDiscountTargetType,
  { label: string; color: TChipColor }
> = {
  products: { label: "Product", color: "primary" },
  categories: { label: "Category", color: "purple" },
  storefront: { label: "Storefront", color: "blue" },
}

// Backend-computed status → chip (matches the `status` list-filter enum).
export const DISCOUNT_STATUS_META: Record<string, { label: string; color: TChipColor }> = {
  active: { label: "Active", color: "success" },
  scheduled: { label: "Scheduled", color: "blue" },
  expired: { label: "Expired", color: "error" },
  disabled: { label: "Disabled", color: "alt" },
}

// "Applies to" options for the discount TargetSelector ("all" === Storefront → all products)
export const DISCOUNT_APPLIES_TO_OPTIONS = [
  { label: "Storefront", value: "all" },
  { label: "Specific products", value: "products" },
  { label: "Specific categories", value: "categories" },
]

// Human scope label for the details header chip
export function discountScopeHeaderLabel(
  scope: TDiscountTargetType,
  kind: "percentage" | "fixed",
): string {
  const noun =
    scope === "categories" ? "Category" : scope === "storefront" ? "Storefront" : "Product"
  return kind === "percentage" ? `% off ${noun}` : `Amount off ${noun}`
}
