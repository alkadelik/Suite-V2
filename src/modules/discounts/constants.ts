import { TableColumn } from "@components/DataTable.vue"
import type { TChipColor } from "@modules/shared/types"
import type { TCouponRow, TCouponScope, TCouponStatus, TTargetMode } from "./types"

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
  order: { label: "Order", color: "blue" },
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
