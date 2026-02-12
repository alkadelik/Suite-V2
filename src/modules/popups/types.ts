export type PopupEvent = {
  uid: string
  name: string
  description: string
  event_address: string
  start_date: string
  end_date: string
  is_active: boolean
  is_live: boolean
  status: "upcoming" | "active" | "past" | "closed"
  banner_image: string | null
  qr_code: string | null
  event_ref: string
  slug: string
  location: string
  location_name: string
  store: string
  store_name: string
  store_slug: string
  customer_count: number
  items_sold_count: number
  products_count: number
  total_orders: number
  total_sales_amount: number
  participation_fee: number | null
  created_at: string
  updated_at: string
  organizer_event_name?: string
  starting_inventory: {
    products: number
    items: number
  }
  closing_inventory: {
    products: number
    items: number
  }
}

export interface PopupEventResponse {
  results: PopupEvent[]
  count: number
  next: string | null
  previous: string | null
}

export interface PopupPayload {
  name: string
  description: string
  event_address: string
  start_date: string
  end_date: string
  participation_fee: number | null
  banner_image?: File | null
}

export interface EventfulPopup {
  uid: string
  name: string
  description: string
  event_instructions: string | null
  terms_and_conditions: string | null
  event_address: string
  start_date: string
  end_date: string
  is_active: boolean
  is_live: boolean
  is_registered: boolean
  status: string
  image: string | null
  qr_code: string | null
  event_ref: string
  slug: string
  location: string
  location_name: string
  company: string
  company_name: string
  company_email: string
  participant_fee: number | null
}

export interface EventfulResponse {
  results: EventfulPopup[]
  count: number
  next: string | null
  previous: string | null
}

// ===== OLD shape ===============
// export type PopupInventory = {
//   uid: string
//   variant: string
//   variant_name: string
//   variant_sku: string
//   product_name: string
//   product_image: string
//   available_quantity: number
//   quantity: number
//   sold_quantity: number
//   is_active: boolean
//   is_visible: boolean
//   is_out_of_stock: boolean
//   original_price: string
//   event_price: string
//   total_sales_value: string
//   created_at: string
//   updated_at: string
// }

// === NEW shape ====
export type PopupInventory = {
  uid: string
  name: string
  description: string
  category: string
  category_name: string
  brand: string
  images: {
    uid: string
    image: string
    alt_text: string
    is_primary: boolean
    sort_order: number
    created_at: string
    updated_at: string
  }[]
  variants: PopupInventoryVariant[]
}

export interface PopupInventoryVariant {
  uid: string
  name: string
  sku: string
  price: string
  image: string | null
  attributes: {
    uid: string
    attribute: string
    value: string
    attribute_name: string
    attribute_value: string
  }[]
  popup_inventory_uid: string
  quantity: number
  event_price: string
  original_price: string
  sold_quantity: number
  available_quantity: number
  is_out_of_stock: boolean
  is_visible: boolean
  is_active: boolean
}

export interface PopupInventoryResponse {
  results: PopupInventory[]
  count: number
  next: string | null
  previous: string | null
}

export interface AddProductsPayload {
  variant: string
  quantity: number
  event_price: number
  is_visible: boolean
  is_active: boolean
  uid?: string
}

export interface PopupOrderPayload {
  source: string
  popup_event: string
  customer_name: string
  customer_email: string
  customer_phone: string
  total_amount: number
  delivery_fee: number
  fulfilment_method: "pickup" | "delivery"
  delivery_address: string
  delivery_method: "manual" | "automatic"
  courier: string
  coupon_code: string
  payment_status: "unpaid" | "paid" | "partially_paid"
  payment_amount: number
  items: {
    popup_inventory: string
    quantity: number
    unit_price: number
    fulfilment_status: "unfulfilled" | "fulfilled"
  }[]
}

export interface EventDiscountCode {
  valid: boolean
  event_price: number
  discount_type: "flat_rate" | "percentage"
  discount_value: number
  discount_amount: number
  final_amount: number
  expires_at: string
  event_name: string
  usage_remaining: number | null
}
