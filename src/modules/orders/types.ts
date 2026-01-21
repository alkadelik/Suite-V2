import { IShippingCourier } from "@modules/shared/types"

export type TOrderItem = {
  uid: string
  variant: string
  variant_name: string
  variant_sku: string
  product_name: string
  popup_inventory: string | null
  quantity: number
  unit_price: string
  total_price: string
  fulfilment_status: "unfulfilled" | "fulfilled"
  qty_fulfilled: number
  notes: string
}

export type TOrder = {
  uid: string
  order_number: string
  coupon: string | null
  courier: string
  courier_name?: string
  created_at: string
  order_date: string
  customer: string
  customer_email: string
  customer_phone: string
  customer_name?: string
  delivery_address: string | null
  delivery_fee: string
  delivery_method: "manual" | "automatic"
  discount_amount: string
  fulfilment_method: "pickup" | "delivery"
  fulfilment_status: "unfulfilled" | "fulfilled" | "partially_fulfilled" | "voided"
  items: TOrderItem[]
  location: string
  location_name: string
  outstanding_balance: number
  payment_status: "unpaid" | "paid" | "partially_paid"
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

export type TOrderMemo = {
  uid: string
  title?: string
  status: "merchant-action" | "customer-action"
  severity: "low" | "medium" | "high"
  content: string
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
  status: string
  severity: "low" | "medium" | "high"
  content: string
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
