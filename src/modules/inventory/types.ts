// Updated product types to match API response
export type TProductEvent = {
  id: number
  event_ref: string
  event_name: string
  start_date: string
  end_date: string
  created: string
}

export type TProductSkuEventData = {
  qty: number
  price: number
}

export type TProductSku = {
  id: number
  sku: string
  option1: string
  option2: string
  option3: string
  has_discount: boolean
  sku_discount: string
  sku_discount_type: string
  price: number
  qty: number
  event_data: Record<string, TProductSkuEventData>
}

export type TProductDisplayEventData = {
  display_product: boolean
}

// Updated main product type to match API response
export type TProduct = {
  uid: string // Changed from id to uid
  name: string // Changed from product_name to name
  total_stock: number
  needs_reorder: boolean
  variants_count: number
  is_active: boolean
  category: string | null
  created_at: string // Changed from created to created_at
}

// Extended product type for detailed view (keeping original fields for compatibility)
export type TProductDetailed = {
  id: number
  product_name: string
  product_type: string
  description: string
  price: number
  total_stock: number
  has_variant: boolean
  display: boolean
  discount: string
  discount_type: string
  has_discount: boolean
  slug: string
  store: string
  temp_id: string
  category: string | null
  rating: string
  review_count: number
  rate_tracking: string
  strict_stock_count: boolean
  created: string
  last_sale: string
  owner: string | null
  options1: string
  options2: string
  options3: string
  variants: string
  combinations: string | null
  images: { image: string; id: number }[]
  sku: TProductSku[]
  events: TProductEvent[]
  display_event_data: Record<string, TProductDisplayEventData>
  inventory_data: Record<string, number>
  unit_weight: string
  length: string
  breadth: string
  height: string
}

// API Response type
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

// Product form mode and other existing types remain the same
export type TProductFormMode = "add" | "edit" | "view"

export type TProductStatus = "in_stock" | "out_of_stock" | "low_stock"

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

export interface IProductMetrics {
  total_products: number
  in_stock_products: number
  out_of_stock_products: number
  low_stock_products: number
  total_value: number
  categories_count: number
}

export interface IProductExportData {
  format: "csv" | "xlsx" | "json"
  fields: string[]
  filters?: IProductFilters
  include_variants?: boolean
  include_events?: boolean
}

// Product action types
export type TProductAction = "view" | "edit" | "duplicate" | "delete" | "archive" | "restore"

// Product bulk action types
export type TProductBulkAction =
  | "delete"
  | "archive"
  | "update_category"
  | "update_status"
  | "export"

export interface IProductBulkActionPayload {
  action: TProductBulkAction
  product_ids: string[] // Changed from number[] to string[] to match uid
  data?: {
    category?: string
    status?: boolean
  }
}

// Product search and sort types
export type TProductSortField =
  | "name" // Changed from product_name to name
  | "total_stock"
  | "category"
  | "created_at" // Changed from created to created_at
  | "variants_count" // Added new field
export type TSortDirection = "asc" | "desc"

export interface IProductSort {
  field: TProductSortField
  direction: TSortDirection
}

// Product category types
export interface IProductCategory {
  uid: string
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ICategoriesApiResponse {
  data: {
    count: number
    next: string | null
    previous: string | null
    results: IProductCategory[]
  }
}

export interface IProductCategoryFormPayload {
  name: string
  description: string
  is_active: boolean
}

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

// Product image types
export interface IProductImage {
  id: number
  image: string
  alt_text?: string
  is_primary: boolean
  order: number
}

// API response types
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

export interface IProductAttribute {
  attribute: string
  value: string
}

export interface IProductError {
  field: string
  message: string
  code: string
}

// Form validation types
export interface IProductValidationErrors {
  name?: string[] // Changed from product_name to name
  category?: string[]
  description?: string[]
  images?: string[]
  sku?: string[]
  variants?: string[]
  general?: string[]
}

// Product stats for dashboard
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

export interface IProductAttributeFormPayload {
  name: string
  data_type: string
  is_required: boolean
  sort_order: number
  is_active: boolean
}

export interface IProductAttributesApiResponse {
  data: {
    count: number
    next: string | null
    previous: string | null
    results: IProductAttributeDetails[]
  }
}

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

export interface IProductAttributeValuePayload {
  value: string
  sort_order: number
  attributeUid: string
}
