// ============================================================================
// Command/Health Center dashboard types.
//
// Two layers:
//  1. UI view types (IHealthVital, ITask, IReceivablesPanel, …) — what the
//     components render. Produced either from fixtures (mock mode) or by
//     mapping the live API responses (see mappers.ts).
//  2. Raw API response types (I*ApiData) — the exact shapes returned by the
//     live /health-center/* endpoints. See docs/…/health-center-samples.json.
// ============================================================================

// ---- Health vitals (DASH-21) ----
export type VitalStatus = "positive" | "warning" | "critical" | "neutral"

export type VitalKey =
  | "sales_today"
  | "orders_today"
  | "deliveries_in_flight"
  | "low_stock"
  | "nearing_expiry"
  | "owed_to_you"

export interface IHealthVital {
  key: VitalKey
  label: string
  /** Preformatted display value, e.g. "₦86,400", "7", "5 Items". Rendered verbatim. */
  value: string
  status: VitalStatus
  /** Sub-status line, e.g. "+12% on 7-day avg". null → render nothing (no "+NaN%"). */
  detail: string | null
  /** When true the detail renders with a trend-up glyph instead of a status dot. */
  trendUp?: boolean
}

export interface IDashboardHealth {
  vitals: IHealthVital[]
}

// ---- Worklist (DASH-22/23) ----
export type TaskVariant = "flat" | "aggregate"
export type UrgencyLevel = "low" | "medium" | "high"
export type TaskTone = "danger" | "warning" | "plain"

/** Every action the client can trigger (DASH-24). */
export type TaskAction =
  | "mark_sent"
  | "create_shipment"
  | "reschedule"
  | "send_reminder"
  | "add_stock"
  | "start_run"
  | "discount_or_use"
  | "close_popup"
  | "mark_paid"

export interface ITaskTag {
  label: string
  /** Maps to a Chip color: primary | success | warning | error | alt | blue | purple. */
  color: string
  /** Render a leading status dot inside the chip (e.g. "Manual Delivery"). */
  dot?: boolean
}

export interface ITaskRow {
  id: string
  /** e.g. "Amaka Nwosu". */
  title: string
  /** e.g. "#S08C2DFE5". */
  reference: string
  urgency: UrgencyLevel
  /** Preformatted age label, e.g. "7 days", "2 days", "Today". */
  ageLabel: string
  /** Preformatted money label, e.g. "₦214,000". null → no amount column. */
  amountLabel: string | null
  /** Variable extra column, e.g. destination for create-shipment rows. */
  destination?: string | null
  action: TaskAction
  actionLabel: string
}

export interface ITask {
  id: string
  variant: TaskVariant
  /** e.g. "Send out 3 orders", "Close the Lekki Sunday Market popup". */
  title: string
  /** Subtext, e.g. "Paid and unfulfilled · ₦67,500 across the three". null → hidden. */
  subtitle: string | null
  tags: ITaskTag[]
  tone: TaskTone
  /** Flat cards: the single action. */
  action?: TaskAction
  actionLabel?: string
  /** Flat cards: inline amount chip next to the title, e.g. "₦142,000". */
  amountLabel?: string | null
  /** Aggregate cards: expandable per-order rows (DASH-23). */
  rows?: ITaskRow[]
  /** Aggregate cards: optional bulk action shown in the expanded state. */
  bulkActionLabel?: string | null
}

export interface IWorklistResponse {
  /** Greeting name, e.g. "Adaeze". */
  firstName: string
  /** Count for "N things need you today.". */
  count: number
  /** Server-composed summary line for Quick Overview. Rendered verbatim (DASH-20). */
  summaryLine: string
  /** Optional second sentence; null → omit. */
  summaryLineSecondary: string | null
  /** Tasks in final server rank order. Client must NOT re-sort (DASH-22). */
  tasks: ITask[]
}

// ---- Awareness rail (DASH-25) ----
export interface IReceivable {
  customerId: string
  name: string
  /** e.g. "47 days". */
  ageLabel: string
  amountLabel: string
  /** Aged rows render visually distinct from fresh ones. */
  aged: boolean
}

export interface IReceivablesPanel {
  totalLabel: string
  customerCount: number
  items: IReceivable[]
}

export interface IOrdersInFlight {
  outForDelivery: number
  waitingToBeCollected: number
  deliveredToday: number
}

export interface IPopupStatus {
  id: string
  name: string
  /** e.g. "ends 19 Jul" or "ended 11 Jul". */
  statusLabel: string
  active: boolean
}

export interface IAwarenessRail {
  receivables: IReceivablesPanel
  /** null when the backend has no orders-in-flight data yet (panel hidden). */
  ordersInFlight: IOrdersInFlight | null
  popups: IPopupStatus[]
}

// ---- UI events ----
/** Normalized payload emitted when a task/row/bulk action is triggered (DASH-24). */
export interface ITaskResolveEvent {
  action: TaskAction
  /** The task or row id whose action is being resolved; drives per-target loading. */
  targetId: string
  /** For bulk actions: the row ids being resolved together. */
  rowIds?: string[]
}

// ============================================================================
// Raw live API response shapes — GET /api/v2/health-center/* (all JWT-scoped).
// Every endpoint wraps its payload in { error, message, data }.
// ============================================================================
export interface IApiEnvelope<T> {
  error: unknown
  message: string
  data: T
}

/** GET /health-center/health/ */
export interface IHealthApiData {
  sales: {
    today: string
    order_count_today: number
    avg_revenue_7d: string | null
    avg_order_count_7d: number | null
    baseline_available: boolean
  }
  low_stock: { product_count: number; material_count: number; total_count: number }
  credit: { total_outstanding: string; aged_subtotal: string }
}

/** GET /health-center/summary/ */
export interface ISummaryApiData {
  task_count: number
  total_exposure: string
  top_item: { type: string; value: number; label: string } | null
  summary_line: string
}

/** GET /health-center/health/credit/ */
export interface ICreditRow {
  order_uid: string
  order_number: string
  customer_name: string
  order_date: string
  age_days: number
  outstanding: string
  is_aged: boolean
}
export interface ICreditApiData {
  total_outstanding: string
  aged_subtotal: string
  customer_count: number
  rows: ICreditRow[]
}

/** A per-order row inside an aggregate task. */
export interface IApiTaskDetailRow {
  order_uid: string
  order_number: string
  customer_name: string
  age_days: number
  order_value: number
}

/** The popup object attached to a close_popup task. */
export interface IApiTaskPopup {
  uid: string
  name: string
  end_date: string
  days_overdue: number
  stranded_qty: number
  stranded_value: number
}

/** GET /health-center/tasks/{fulfillment,popups} — one task (aggregate or flat). */
export interface IApiTask {
  task_type: string
  family: string
  severity: string | null
  title_inputs: Record<string, string | number>
  condition_inputs: Record<string, string | number>
  resolving_action: string
  ranking_inputs: { age_days: number; money_at_risk: string | null }
  rank: number
  detail_rows: IApiTaskDetailRow[] | null
  batch: unknown
  popup: IApiTaskPopup | null
  item: unknown
}
export interface IApiTasksData {
  tasks: IApiTask[]
  task_count: number
}

/**
 * GET /health-center/tasks/restock — products + materials to replenish.
 * Shape unverified: this store returned empty arrays, so fields are best-effort
 * and read defensively in the mapper. Refine once a store with restock data exists.
 */
export interface IApiRestockItem {
  uid?: string
  name?: string
  available_stock?: number | string
  reorder_threshold?: number | string
  type?: string
}
export interface IApiRestockData {
  products: IApiRestockItem[]
  materials: IApiRestockItem[]
  task_count: number
}
