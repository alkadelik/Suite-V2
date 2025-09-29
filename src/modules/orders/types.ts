import { TCustomer } from "@modules/customers/types"

export type TOrderProductInfo = {
  id: number
  product_name: string
  product_type: string
  description: string
  price: number | string
  total_stock: number
  has_variant: boolean
  display: boolean
  discount: string
  discount_type: string
  has_discount: boolean
  slug: string
  store: number | string
  temp_id: string
  category: string | null
  rating: string
  review_count: number
  rate_tracking: string
  strict_stock_count: boolean
  created: string
  last_sale: string
  options1: string
  options2: string
  options3: string
  variants: string
  combinations: string | null
  images: { id: number; image: string; alt: string }[]
  sku: Array<{
    id: number
    sku: string
    option1: string
    option2: string
    option3: string
    has_discount: boolean
    sku_discount: string
    sku_discount_type: string
    price: number | string
    qty: number
    event_data: Record<string, object | number | string | null>
  }>
  events: Array<{
    id: number
    event_ref: string
    event_name: string
    start_date: string
    end_date: string
    created: string
  }>
  display_event_data: Record<string, { display_product: boolean }>
  inventory_data: Record<string, number>
  unit_weight: string
  length: string
  breadth: string
  height: string
}

export type TOrderItem = {
  id: string
  has_feedback: boolean
  index: number
  lead_time: number | null
  note: string
  product: number
  productid: number
  sku: number | string | null
  product_info: TOrderProductInfo
  var1name: string
  var2name: string
  selected_option1: string
  selected_option2: string
  qty: number
  delivered_qty: number
  price_sold: number
  status: number
  sub_total: string
  created: string
  modified: string
  selected_position: number
  is_returned: boolean
  images: { id: number; image: string; alt: string }[]
}

export type TOrder = {
  id: number
  order_ref: string
  items_count: number
  total_amount: string
  store: number
  customer: number | null
  customer_info: TCustomer | null
  shipping_price: string
  products_total: string
  fulfilled: number
  unique_items: number
  paid_amount: string
  shipping_company: string
  rate: number | null
  shipping_paid: boolean
  shipping_mode: boolean
  payment_status: number
  payment_mode: number
  channel: number
  refund: boolean
  refund_amount: string
  issues_count: number
  cancelled: boolean
  address: string | null
  order_date: string
  items: TOrderItem[]
  event: number | null
  is_voided: boolean
  void_reason: string | null
  status: number
  shipping_provider: string
  has_shipping: boolean
}

export type TOrderChannel = {
  label: string
  value: number
  icon: string
}

export type TOrderShippingCompany = {
  label: string
  value: number
}

export type TOrderPaymentMethod = {
  label: string
  value: number
  icon: string
}

export type TOrderPaymentStatus = {
  label: string
  value: number
  icon: string
  color: "primary" | "success" | "warning" | "error" | "alt" | "blue" | "purple" | undefined
}

export interface OrderPayload {
  source: string
  customer: string
  total_amount: string | number
  delivery_fee: string | number
  fulfilment_method: "pickup" | "delivery"
  delivery_address: string
  delivery_method: "manual" | "automatic"
  courier: string
  coupon_code: string | null
  payment_status: "unpaid" | "paid" | "partial"
  payment_amount: string | number
  items: OrderItemPayload[]
}

export interface OrderItemPayload {
  variant: string
  quantity: number
  unit_price: string | number
  fulfilment_status: "unfulfilled" | "fulfilled"
  qty_fulfilled: number
  notes?: string
}

export type TOrderResponse = {
  results: TOrder[]
  count: number
  next: string | null
  previous: string | null
}
