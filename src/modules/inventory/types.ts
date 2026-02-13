// ============================================================================
// BASE TYPES & ENUMS
// ============================================================================

export type TProductFormMode = "add" | "edit" | "view"
export type TProductStatus = "in_stock" | "out_of_stock" | "low_stock"
export type TProductAction = "view" | "edit" | "duplicate" | "delete" | "archive" | "restore"
export type TProductBulkAction =
  | "delete"
  | "archive"
  | "update_category"
  | "update_status"
  | "export"
export type TProductSortField =
  | "name"
  | "total_stock"
  | "category"
  | "created_at"
  | "variants_count"
export type TSortDirection = "asc" | "desc"
export type TInventoryMovementType = "in" | "out" | "adjustment" | "transfer"
export type TTransferRequestStatus = "pending" | "approved" | "rejected" | "fulfilled"
export type TTransferRequestType = "transfer" | "request"

// ============================================================================
// CORE PRODUCT TYPES
// ============================================================================

// List view product type (used in tables, cards, etc.)
export type TProduct = {
  uid: string
  name: string
  total_stock: number
  sellable_stock: number
  needs_reorder: boolean
  variants_count: number
  is_active: boolean
  is_hidden_from_storefront: boolean
  category: string | null
  created_at: string
  primary_image: IProductImage | null
  price: string | null
  amount_sold: number
  quantity_sold: number
  memo_count: number
  return_count: number
  is_best_seller?: boolean
}

// Detailed product type (used in single product view/edit)
export interface IProductDetails {
  uid: string
  name: string
  description: string
  story: string
  category: string
  category_name: string
  brand: string
  is_active: boolean
  is_hidden_from_storefront: boolean
  is_variable: boolean
  requires_approval: boolean
  variants: IProductVariantDetails[]
  images: Array<IProductImage & { sort_order: number; created_at: string; updated_at: string }>
  min_price: number
  max_price: number
  total_stock: number
  needs_reorder: boolean
  amount_sold: number
  quantity_sold: number
  memo_count: number
  return_count: number
  popup_quantity_taken: number
  created_at: string
}

// Product variant (detailed view)
export interface IProductVariantDetails {
  uid: string
  name: string
  sku: string
  price: string
  image: string | null
  promo_price: string
  promo_expiry: string
  cost_price: string
  weight: string
  length: string
  width: string
  height: string
  reorder_point: number
  max_stock: number
  opening_stock: number
  is_active: boolean
  is_default: boolean
  batch_number: string
  expiry_date: string
  created_at: string
  updated_at: string
  attributes: IProductVariantAttribute[]
  available_stock: number
  reserved_stock: number
  sellable_stock: number
  needs_reorder: boolean
  is_overstocked: boolean
  popup_quantity_taken: number
  [key: string]: unknown
}

// Variant attribute (in detailed view)
export interface IProductVariantAttribute {
  uid: string
  attribute: string
  value: string
  attribute_name: string
  attribute_value: string
}

// Product image
export interface IProductImage {
  uid: string
  image: string
  alt_text?: string
  is_primary: boolean
  order: number
}

// Product category
export interface IProductCategory {
  uid: string
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Product attribute definition
export interface IProductAttributeDetails {
  uid: string
  name: string
  data_type: string
  is_required: boolean
  sort_order: number
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at?: string
}

// Product dimension
export interface IProductDimension {
  name: string
  description_image_url: string
  height: number
  width: number
  depth: number
  max_weight: number
  shortLabel: string
  label: string
  range: string
  examples: string
}

// Product variant (for create/update)
export interface IProductVariant {
  name: string
  sku: string
  price: string
  promo_price: string
  promo_expiry: string
  cost_price: string
  weight: string
  length: string
  width: string
  height: string
  reorder_point: string
  max_stock: string
  opening_stock: string
  is_active: boolean
  is_default: boolean
  batch_number: string
  expiry_date: string
  attributes: IProductAttribute[]
  uid?: string
}

// Variant attribute
export interface IProductAttribute {
  attribute: string
  value: string
  valueLabel?: string
}

// Inventory movement (detailed view)
export interface IInventoryMovement {
  uid: string
  variant: string
  store: string
  location: string
  type: TInventoryMovementType
  reason: string
  quantity: number
  unit_cost: string
  reference: string
  note: string
  created_by: string
  created_at: string
  [key: string]: unknown
}

// Inventory transfer/request
export interface IInventoryTransferRequest {
  uid: string
  store: string
  store_name: string
  from_location: string
  from_location_name: string
  to_location: string
  to_location_name: string
  variant: string
  variant_name: string
  variant_sku: string
  quantity: number
  status: TTransferRequestStatus
  type: TTransferRequestType
  note: string
  created_by: string
  created_by_name: string
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  rejected_by: string | null
  rejected_by_name: string | null
  rejected_at: string | null
  created_at: string
  updated_at: string
  [key: string]: unknown
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

// Paginated products list response
export interface IProductsApiResponse {
  error: null | string
  message: string
  data: {
    count: number
    next: string | null
    previous: string | null
    results: TProduct[]
  }
}

// Single product details response
export interface IGetProductResponse {
  success: boolean
  data: IProductDetails
  message?: string
}

// Generic product response (for create, update, delete)
export interface IProductResponse {
  success: boolean
  data: TProduct | TProduct[]
  message?: string
  meta?: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
}

// Categories list response
export interface ICategoriesApiResponse {
  data: {
    count: number
    next: string | null
    previous: string | null
    results: IProductCategory[]
  }
}

// Attributes list response
export interface IProductAttributesApiResponse {
  data: {
    count: number
    next: string | null
    previous: string | null
    results: IProductAttributeDetails[]
  }
}

// Inventory movements list response
export interface IInventoryMovementsApiResponse {
  data: {
    count: number
    next: string | null
    previous: string | null
    results: IInventoryMovement[]
  }
}

// Inventory transfer/requests list response
export interface IInventoryTransferRequestsApiResponse {
  data: {
    count: number
    next: string | null
    previous: string | null
    results: IInventoryTransferRequest[]
  }
}

// ============================================================================
// PAYLOAD TYPES (for API requests)
// ============================================================================

// Create/Update product
export interface IProductFormPayload {
  name: string
  description: string
  story: string
  category: string
  brand: string
  is_active: boolean
  is_hidden_from_storefront?: boolean
  is_variable: boolean
  requires_approval: boolean
  variants: IProductVariant[]
}

// Update product details only (without variants)
export interface IProductDetailsUpdatePayload {
  name: string
  description: string
  story: string
  category: string
  brand: string
  is_active: boolean
  is_variable: boolean
  requires_approval: boolean
}

// Bulk actions payload
export interface IProductBulkActionPayload {
  action: TProductBulkAction
  product_ids: string[]
  data?: {
    category?: string
    status?: boolean
  }
}

// Category create/update
export interface IProductCategoryFormPayload {
  name: string
  description: string
  is_active: boolean
}

// Attribute create/update
export interface IProductAttributeFormPayload {
  name: string
  data_type: string
  is_required: boolean
  sort_order: number
  is_active: boolean
}

export interface IAttributeValueItem {
  value: string
  sort_order: number
}

export interface IProductAttributeValuePayload {
  value: string
  sort_order: number
  attributeUid: string
}

// Image upload
export interface IProductImageUploadPayload {
  product: string
  image: File
  alt_text?: string
  is_primary?: boolean
  sort_order?: number
}

// Image update
export interface IProductImageUpdatePayload {
  alt_text?: string
  is_primary?: boolean
  sort_order?: number
}

// Export data
export interface IProductExportData {
  format: "csv" | "xlsx" | "json"
  fields: string[]
  filters?: IProductFilters
  include_variants?: boolean
  include_events?: boolean
}

// Inventory movement create
export interface IInventoryMovementPayload {
  variant: string
  store: string
  location: string
  type: TInventoryMovementType
  reason: string
  quantity: number
  unit_cost?: string
  reference?: string
  note?: string
}

// Add stock payload
export interface IAddStockPayload {
  quantity: number
  unit_cost: string
  reference?: string
  note: string
}

// Reduce stock payload
export interface IReduceStockPayload {
  quantity: number
  reason: string
  reference?: string
  note: string
}

// Stock transfer item
export interface IStockTransferItem {
  variant: string
  quantity: number
}

// Stock transfer payload (for both direct transfer and request)
export interface IStockTransferPayload {
  to_location: string
  transfers: IStockTransferItem[]
  note: string
}

// Approve/Reject transfer request payload
export interface IApproveRejectRequestPayload {
  request_ids: string[]
  action: "approve" | "reject"
  note?: string
}

// Bulk variant operations payload
export interface IBulkVariantPayload {
  to_delete?: string[]
  to_add?: IProductVariant[]
}

// ============================================================================
// UTILITY TYPES (for filtering, sorting, validation)
// ============================================================================

// Filters
export interface IProductFilters {
  search?: string
  category?: string
  status?: TProductStatus
  price_range?: {
    min: number
    max: number
  }
  stock_range?: {
    min: number
    max: number
  }
  has_variant?: boolean
}

// Sorting
export interface IProductSort {
  field: TProductSortField
  direction: TSortDirection
}

// Validation errors
export interface IProductValidationErrors {
  name?: string[]
  category?: string[]
  description?: string[]
  images?: string[]
  sku?: string[]
  variants?: string[]
  general?: string[]
}

// Error details
export interface IProductError {
  field: string
  message: string
  code: string
}

// ============================================================================
// METRICS & STATISTICS
// ============================================================================

// Product metrics
export interface IProductMetrics {
  total_products: number
  in_stock_products: number
  out_of_stock_products: number
  low_stock_products: number
  total_value: number
  categories_count: number
}

// Dashboard stats
export interface IProductStats {
  today: {
    products_added: number
    products_sold: number
    revenue: number
  }
  week: {
    products_added: number
    products_sold: number
    revenue: number
  }
  month: {
    products_added: number
    products_sold: number
    revenue: number
  }
}

interface ProductVariantAttribute {
  uid: string
  attribute: string
  value: string
  attribute_name: string
  attribute_value: string
}

interface ProductVariant {
  uid: string
  sku: string
  name: string
  attributes: ProductVariantAttribute[]
  available_stock: number
  batch_number: string
  cost_price: number | null
  created_at: string
  expiry_date: string
  height: string
  is_active: boolean
  is_default: boolean
  is_overstocked: boolean
  length: string
  max_stock: number
  needs_reorder: boolean
  opening_stock: number
  price: string
  promo_expiry: string
  promo_price: number | null
  reorder_point: number
  reserved_stock: number
  sellable_stock: number
  popup_quantity_taken: number
  updated_at: string
  weight: string
  width: string
}

export interface IProductCatalogue {
  uid: string // UUID
  name: string
  description: string
  story: string
  category: string
  category_name: string
  brand: string
  is_active: boolean
  is_variable: boolean
  variants: ProductVariant[]
  images: { image: string; uid: string; is_primary: boolean }[]
  total_stock: number
  created_at: string
}

export interface IProductStats {
  total_products: number
  total_variants: number
  total_stock_value: number
  low_stock_count: number
  overstocked_count: number
}
