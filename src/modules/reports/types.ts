export type TEodOrders = {
  order_number: string
  order_date: string
  customer_name: string
  customer_type: "New" | "Returning"
  status: "fulfilled" | "unfulfilled" | "shipped" | "awaiting_pay"
  items: number
  total_amount: number
  payment_method: "card" | "cash" | "bank_transfer"
}

export type TEodProductsSold = {
  product_name: string
  quantity: number
  revenue: number
  avg_price: number
  stock_after_sale: number
  status: "critical" | "low" | "ok"
}

export type TEodAbandoned = {
  customer_name: string
  items: string[]
  amount: number
  drop_off: "shipping_info" | "payment_page"
}
