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

export type TMonthlyProductRow = {
  sn: number
  product_name: string
  amount: number
  units_sold: number
  avg_price: number
  margin: number
  sell_through: number
  inventory_turnover: number
}

export type TRefundRow = {
  reason: string
  count: number
  amount: number
  percentage: number
}

export interface IMonthlyReport {
  summary: {
    aov: number
    net: number
    cogs: number
    gross: number
    refunds: number
    shipping: number
    discounts: number
    items_sold: number
    order_count: number
    gross_profit: number
    total_expenses: number
    unique_products: number
    active_customers: number
    net_income_ebitda: number
    net_margin_percent: number
  }
  kpi_cards: Array<{
    key: string
    value: number
    percent_change_vs_previous: number | null
  }>
  cogs: number
  total_expenses: number
  expenses_by_category: []
  expenses_overview: unknown
  tax_summary: {
    vat_rate_percent: number
    applicable_revenue: number
    estimated_vat_liability: number
  }
  trends: {
    metric: string
    series: Array<{
      week: string
      value: number
    }>
  }
  weekly_revenue_expenses: {
    series: Array<{
      week: string
      revenue: number
      expenses: number
      order_count: number
    }>
  }
  daily_revenue_trend: Array<{
    day: string
    revenue: number
    order_count: number
  }>
  financial_summary_breakdown: Array<{
    amount: number
    line_item: string
    percent_of_revenue: number
    percent_change_vs_previous: number | null
  }>
  breakdowns: {
    products: Array<{
      name: string
      image: string | null
      percent: number
      revenue: number
      quantity: number
      product_id: string
      out_of_stock: boolean
    }>
    customers: {
      list: Array<{
        name: string
        percent: number
        customer_id: string
        order_count: number
        amount_spent: number
      }>
      new_vs_repeat: {
        new: number
        repeat: number
      }
      avg_spend_per_customer: number
    }
  }
  analysis: {
    channels: Array<{
      orders: number
      channel: string
      percent: number
      revenue: number
    }>
    couriers: unknown[]
    payments: Array<{
      mode: string
      amount: number
      orders: number
      percent_collected: number
    }>
    fulfilment: Array<{
      items: number
      value: number
      orders: number
      fulfilment_method: string
    }>
  }
  revenue_composition: {
    net: number
    gross: number
    refunds: number
    shipping: number
    discounts: number
  }
  performance_metrics: {
    aov: number
    conversion_rate: number | null
    mark_up_percent: number
    sell_through_rate: number | null
    inventory_turnover: number | null
    avg_items_per_order: number
    gross_margin_percent: number
    cart_abandonment_rate: number
    discount_impact_percent: number
    estimated_lost_revenue_from_abandonment: number
  }
  peak_sales_hours_heatmap: Array<{
    hour: number
    weekday: number
    order_count: number
    weekday_name: string
  }>
  customer_metrics: {
    cac: number | null
    clv: number | null
    ltv_cac_ratio: number | null
    new_customers: number
    new_vs_returning_revenue: {
      new_percent: number
      new_revenue: number
      returning_percent: number
      returning_revenue: number
    }
    total_active_customers_180: number
    customer_growth_rate_percent: number
    repeat_customer_rate_180_percent: number
  }
  top_10_products: Array<{
    name: string
    rank: number
    revenue: number
    units_sold: number
    average_price: number
    inventory_turnover: number | null
    gross_margin_percent: number
    sell_through_percent: number
  }>
  revenue_by_category: Array<{
    percent: number
    revenue: number
    category: string
  }>
  operations_kpis: {
    returns_rate_percent: number
    fulfilment_rate_percent: number
    avg_fulfilment_time_days: number | null
    cancellation_rate_percent: number
    on_time_delivery_rate_percent: number | null
  }
  refund_breakdown: {
    count: number
    total: number
    by_reason: TRefundRow[]
    insufficient_data: boolean
  }
  sales_by_region: Array<{
    city: string
    state: string
    revenue: number
  }>
  revenue_by_day_of_week: Array<{
    revenue: number
    weekday: number
    weekday_name: string
  }>
  transaction_size_distribution: Array<{
    range: string
    revenue: number
    order_count: number
  }>
  insights: {
    summary: string[]
    channels: string[]
    payments: string[]
    products: string[]
    customers: string[]
  }
  narratives: {
    product_insight: string
    customer_insight: string
    executive_summary: string
    financial_insight: string
    operations_insight: string
    performance_insight: string
  }
  period: {
    end: string
    year: number
    month: number
    start: string
    prev_end: string
    prev_start: string
  }
}
