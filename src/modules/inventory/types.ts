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

// ============================================================================
// CORE PRODUCT TYPES
// ============================================================================

// List view product type (used in tables, cards, etc.)
export type TProduct = {
  uid: string
  name: string
  total_stock: number
  needs_reorder: boolean
  variants_count: number
  is_active: boolean
  category: string | null
  created_at: string
}

// Detailed product type (used in single product view/edit)
export interface IProductDetails {
  uid: string
  name: string
  description: string
  story: string
  category: string
  brand: string
  is_active: boolean
  is_variable: boolean
  requires_approval: boolean
  variants: IProductVariantDetails[]
  images: IProductImage[]
  created_at: string
}

// Product variant (detailed view)
export interface IProductVariantDetails {
  uid: string
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
}

// Variant attribute
export interface IProductAttribute {
  attribute: string
  value: string
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
  count: number
  next: string | null
  previous: string | null
  results: IInventoryMovement[]
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
  is_variable: boolean
  requires_approval: boolean
  variants: IProductVariant[]
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

// Attribute value
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
  unit_cost?: string
  reference?: string
  note: string
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
