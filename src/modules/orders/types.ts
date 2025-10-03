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
  created_at: string
  customer: string
  customer_email: string
  customer_phone: string
  customer_name?: string
  delivery_address: string | null
  delivery_fee: string
  delivery_method: "manual" | "automatic"
  discount_amount: string
  fulfilment_method: "pickup" | "delivery"
  fulfilment_status: "unfulfilled" | "fulfilled" | "partially_fulfilled"
  items: TOrderItem[]
  location: string
  location_name: string
  outstanding_balance: number
  payment_status: "unpaid" | "paid" | "partially_paid"
  rate: string
  source: "internal" | "external"
  store: string
  subtotal: string
  total_amount: number
  total_paid: number
  tracking_number: string
  user: string
  user_name: string
  is_voided: boolean
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
  value: "unpaid" | "paid" | "partially_paid"
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
  payment_status: "unpaid" | "paid" | "partially_paid"
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
  amount_paid: string
  date: string
  method: string
}

export interface IMemoPayload {
  title: string
  status: string
  severity: "low" | "medium" | "high"
  content: string
}
