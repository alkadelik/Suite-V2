// Existing product types
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

export type TProduct = {
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

// New types for product management
export type TProductFormMode = "add" | "edit" | "view"

export type TProductStatus = "in_stock" | "out_of_stock" | "low_stock"

export interface IProductFormPayload {
  product_name: string
  description: string
  price: number
  category: string | null
  product_type: string
  has_variant: boolean
  variants?: string
  options1?: string
  options2?: string
  options3?: string
  images: { image: string; id: number }[]
  sku: Omit<TProductSku, "id">[]
  unit_weight: string
  length: string
  breadth: string
  height: string
  display: boolean
  has_discount: boolean
  discount?: string
  discount_type?: string
  strict_stock_count: boolean
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
  product_ids: number[]
  data?: {
    category?: string
    status?: boolean
    // Add other bulk update fields as needed
  }
}

// Product search and sort types
export type TProductSortField =
  | "product_name"
  | "price"
  | "total_stock"
  | "category"
  | "created"
  | "last_sale"
export type TSortDirection = "asc" | "desc"

export interface IProductSort {
  field: TProductSortField
  direction: TSortDirection
}

// Product variant types
export interface IProductVariant {
  id?: number
  option1: string
  option2?: string
  option3?: string
  price: number
  qty: number
  sku: string
  has_discount: boolean
  sku_discount?: string
  sku_discount_type?: string
}

// Product category types
export interface IProductCategory {
  id: number
  name: string
  description?: string
  parent_id?: number
  created: string
  updated: string
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

export interface IProductError {
  field: string
  message: string
  code: string
}

// Form validation types
export interface IProductValidationErrors {
  product_name?: string[]
  price?: string[]
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
