import { IShippingCourier } from "@modules/shared/types"

export type TOrderItem = {
  uid: string
  variant: string
  variant_name: string
  variant_sku: string
  product_name: string
  popup_inventory: string | null
  quantity: number
  original_price?: string | null
  unit_price: string
  total_price: string
  total_cost?: string | null
  fulfilment_status: "unfulfilled" | "fulfilled"
  qty_fulfilled: number
  notes: string
  attributes?: string | null
  product_images?: { image: string }[]
}

export type TOrderCourier = {
  name: string
  email?: string
  phone?: string
  courier_name?: string
  courier_image?: string
}

export type TOrder = {
  uid: string
  order_number: string
  coupon: string | null
  courier: TOrderCourier | string
  courier_name?: string
  created_at: string
  order_date: string
  customer: string
  customer_email: string
  customer_phone: string
  customer_name?: string
  customer_address: string
  delivery_address: string | null
  delivery_fee: string
  delivery_method: "manual" | "shipbubble" | "custom"
  delivery_payment_option: string
  discount_amount: string
  fulfilment_method: "pickup" | "delivery"
  fulfilment_status: "unfulfilled" | "fulfilled" | "partially_fulfilled" | "voided"
  items: TOrderItem[]
  location: string
  location_name: string
  memos_count: number
  /** Count of memos still open on the order */
  open_memos_count?: number
  outstanding_balance: number
  payment_status: "unpaid" | "paid" | "partially_paid"
  payment_source?: string
  rate: string
  source: "internal" | "external"
  store: string
  store_name: string
  subtotal: string
  total_amount: number
  tax_amount: string
  tax_rate_used: string
  total_paid: number
  tracking_number: string
  user: string
  user_name: string
  is_voided: boolean
  manual_delivery_type?: "standard" | "express"
  shipping_details?: {
    shipbubble_order_id: string
    tracking_url: string
    tracking_number?: string
  }

  // Needed
  store_email?: string
  store_phone?: string
  store_logo?: string
}

export type TOrderChannel = {
  label: string
  value: string
  icon?: string
}

export type TOrderShippingCompany = {
  label: string
  value: number
}

export type TOrderPaymentMethod = {
  label: string
  value: string
  icon?: string
}

export type TOrderPaymentStatus = {
  label: string
  value: "unpaid" | "paid" | "partially_paid"
  icon?: string
  color?: "primary" | "success" | "warning" | "error" | "alt" | "blue" | "purple" | undefined
}

export interface OrderPayload {
  source: string
  customer: string
  popup_event?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  total_amount: string | number
  fulfilment_method: "pickup" | "delivery"
  fulfilment_status: "unfulfilled" | "fulfilled" | "partially_fulfilled" | "voided"
  delivery_fee?: string | number
  delivery_address?: string
  delivery_method?: "manual" | "automatic"
  delivery_payment_option?: string
  courier: IShippingCourier | string
  coupon_code: string | null
  payment_status: "unpaid" | "paid" | "partially_paid"
  payment_amount: string | number
  payment_source?: string
  items: OrderItemPayload[]
  order_channel: string
  order_date?: string
  reference?: string
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

/** Party a memo was resolved by */
export type TMemoParty = "merchant" | "customer"

/** Party a memo is awaiting action from */
export type TMemoAwaiting = TMemoParty | "nobody"

export type TOrderMemo = {
  uid: string
  title?: string
  awaiting: TMemoAwaiting
  status: "open" | "resolved"
  severity: "low" | "medium" | "high"
  content: string
  /** Optional note recorded when the memo was resolved */
  resolution_note: string | null
  resolved_at: string | null
  resolved_by: TMemoParty | null
  resolved_by_name: string | null
  author: string
  author_name: string
  author_email: string
  created_at: string
  updated_at: string
}

export type TOrderPayment = {
  uid: string
  amount: string
  payment_method: string
  reference: string | null
  created_at: string
  order: string
}

export interface ISinglePayment {
  uid: string
  amount: number
  status: string
  source: string
  transaction_id: string | null
  date_paid: string | null
  created_at: string
  payer_name: string
  notes: string | null
}

export interface IPaymentHistory {
  order_id: string
  order_number: string
  total_amount: number
  total_paid: number
  outstanding_balance: number
  payments: ISinglePayment[]
}

export interface IPaymentPayload {
  amount: string
  date: string
  source: string
}

export interface IMemoPayload {
  title: string
  awaiting: TMemoAwaiting
  severity: "low" | "medium" | "high"
  content: string
}

export interface IResolveMemoPayload {
  resolved_by: TMemoParty
  note?: string
}

export interface OrderDashboardStats {
  period: {
    year: number
    month: number
  }

  current: {
    order_count: number
    total_amount: number
    total_outstanding: number
    fulfilled_count: number
  }

  previous: {
    order_count: number
    total_amount: number
    total_outstanding: number
    fulfilled_count: number
  }

  change: {
    order_count_pct: number
    total_amount_pct: number
    total_outstanding_pct: number
    fulfilled_count_pct: number
  }
}

/** ShipBubble shipment record from GET /shipping/orders/ */
export type TShipbubbleShipment = {
  uid: string
  shipbubble_order_id: string
  order: TOrder
  merchant_name: string
  courier: {
    name: string
    email: string
    phone: string
    courier_name?: string
    courier_image?: string
  }
  price: string
  service_charge: string
  total_shipping_cost: string
  prepaid_delivery_fee: string
  fee_variance: string
  variance_type: string
  status: string
  tracking_url: string | null
  waybill_document_url: string | null
  tracking_data: string | null
  last_status_update: string | null
  quote_expires_at: string | null
  quote_status: string | null
  /** Hours until the quote expires, e.g. 149 */
  quote_hours_remaining: number | null
  is_suite_order: boolean
  pickup_date: string | null
  delivery_estimate: string | null
  created_at: string
}

/** Body for POST /shipping/orders/{uid}/create/ — payment_reference comes from Paystack */
export type TCreateShipmentPayload = {
  order: string
  rate: string
  courier: string
  payment_reference: string
}

/** What ShipBubble hands back once the booking is accepted. The quote row the
 * drawer was built from predates all of this, so the success modal has to read
 * these off the response rather than off the row. */
export type TBookedShipment = {
  shipbubble_order_id?: string
  delivery_estimate?: string
  tracking_number?: string
}

/** Booking details the create drawer hands to the page for its success modal */
export type TShipmentCreatedDetails = {
  trackingNumber: string
  expectedDelivery: string
}

export type TShipbubbleShipmentResponse = {
  results: TShipbubbleShipment[]
  count: number
  next: string | null
  previous: string | null
}

/** Normalized row rendered by the shipments tables — ShipBubble rows carry the
 * shipment record, manual/pickup rows are plain orders (shipment is null). */
export type TShipmentRow = {
  uid: string
  order_number: string
  customer_name: string
  courier: TOrderCourier | null
  fee: string | number
  amount: string | number
  date: string
  status: string
  order: TOrder
  shipment: TShipbubbleShipment | null
  delivery_estimate: string | null
}
