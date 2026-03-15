export type TEodOrders = {
  amount: number
  status: "Unfulfilled" | "Fulfilled" | "Shipped" | "Awaiting Payment"
  order_uid: string
  created_at: string
  order_type: "New" | "Returning"
  items_count: number
  customer_uid: string
  order_number: string
  customer_name: string
  payment_method: "Online" | "Cash" | "Bank Transfer"
}

export type TEodProductsSold = {
  sku: string
  status: "Critical" | "Low" | "OK"
  revenue: number
  product_uid: string
  variant_uid: string
  product_name: string
  average_price: number
  quantity_sold: number
  stock_remaining: number
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

export interface IEODReportSummary {
  net_revenue: number
  order_count: number
  gross_revenue: number
  total_refunds: number
  total_discounts: number
  active_customers: number
  total_items_sold: number
  average_order_value: number
  total_shipping_costs: number
  unique_products_sold: number
}

export interface IEODPayment {
  method: string
  amount: number
  order_count: number
  percent?: number
}

export interface IEODCashDigitalReconciliation {
  cash_collected: number
  pending_payments: number
  confirmed_revenue: number
  refunds_processed: number
  digital_payments_total: number
}

export interface IEODCustomers {
  new_customers: number
  unique_customers: number
  returning_revenue: number
  returning_customers: number
  repeat_orderers_today: number
  returning_revenue_percent: number
}

export interface IEODHourlySales {
  hour: number
  revenue: number
  order_count: number
}

export interface IEODFulfilment {
  status: string
  orders: number
  revenue: number
}

export interface IEODCourierPerformance {
  courier: string
  orders: number
  delivered: number
  pending: number
}

export interface IEODFulfilmentKPIs {
  delivered_today: number
  orders_fulfilled: number
  returns_received: number
  pending_fulfillment: number
}

export type TEodPendingOrder = {
  order_number: string
  issue: "awaiting_payment" | "low_stock"
  amount: number
  action: "send_reminder" | "reorder_item"
}

export interface IEODFailedPayments {
  count: number
  total_failed_amount: number
}

export interface IEODRefundsBreakdown {
  refund_count: number
  reason_summary: TRefundRow[]
  total_refund_amount: number
}

export interface IEODSummaryComparison {
  net_revenue_percent_change: number
  gross_revenue_percent_change: number
  average_order_value_absolute_change: number
}

export interface IEODExpensesByCategory {
  amount: number
  category: string
  percent_of_revenue?: number
}

export interface IEODExpensesOverview {
  biggest_expense_amount: number
  expense_to_revenue_percent: number
  biggest_expense_category_name: string | null
}

export type TEodSalesByOrigin = {
  origin_name: string
  order_count: number
  revenue: number
  percent_of_revenue: number
}

export interface IEODAbandonedCarts {
  count: number
  orders: TEodAbandoned[]
  total_potential_revenue: number
}

export interface IEODInventoryFlow {
  units_sold: number
  closing_stock: number
  opening_stock: number
  units_returned: number
  units_restocked: number
}

export interface IEODLowStockAlert {
  product_name: string
  current_stock: number
  status: "critical" | "low"
}

export interface IEODUnresolvedIssue {
  type: string
  count: number
  details: string
}

export interface IEODNarratives {
  daily_summary: string
  fulfilment_insight: string
  tomorrow_priorities: string
  abandoned_carts_insight: string
  failed_payments_insight: string
  payment_reconciliation_insight: string
}

export interface IEODPeriod {
  end: string
  date: string
  start: string
  prev_end: string
  prev_date: string
  prev_start: string
}

export interface IEODReport {
  detail?: string
  summary: IEODReportSummary
  previous_day_summary: IEODReportSummary
  payments: IEODPayment[]
  cash_digital_reconciliation: IEODCashDigitalReconciliation
  customers: IEODCustomers
  hourly_sales: IEODHourlySales[]
  fulfilment: IEODFulfilment[]
  courier_performance: IEODCourierPerformance[]
  fulfilment_kpis: IEODFulfilmentKPIs
  fulfillment_metrics: IEODFulfilmentKPIs
  pending_orders: TEodPendingOrder[]
  orders: TEodOrders[]
  all_orders: TEodOrders[]
  orders_grand_total: number
  products: TEodProductsSold[]
  products_sold: TEodProductsSold[]
  failed_payments: IEODFailedPayments
  previous_day_failed_payments: IEODFailedPayments
  refunds_breakdown: IEODRefundsBreakdown
  summary_comparison: IEODSummaryComparison
  total_expenses: number
  expenses_by_category: IEODExpensesByCategory[]
  expenses_overview: IEODExpensesOverview
  sales_by_origin: TEodSalesByOrigin[]
  abandoned_carts: IEODAbandonedCarts
  inventory_flow: IEODInventoryFlow
  low_stock_alerts: IEODLowStockAlert[]
  unresolved_issues: IEODUnresolvedIssue[]
  insights: string[]
  narratives: IEODNarratives
  period: IEODPeriod
}

export interface IEODReportGenerationStatus {
  uid: string
  report_date: string
  status: "generating" | "completed"
  payload: Record<string, unknown>
  generated_at: string | null
  created_at: string
  updated_at: string
}

export interface IMonthlyReport {
  detail?: string
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
    average_order_value: number
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

export interface IReportGenerationStatus {
  status: "generating" | "completed"
  uid: string
  year: number
  month: number
  payload?: IMonthlyReport
}
