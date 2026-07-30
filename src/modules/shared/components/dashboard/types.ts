// ============================================================================
// Command/Health Center dashboard — API contract (DASH-19…25)
//
// These types mirror the (not-yet-deployed) backend contract. The client only
// RENDERS server-provided, preformatted strings — it never computes exposure,
// ranking, or summary text (DASH-20/22). See fixtures.ts for the mock payloads.
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
  ordersInFlight: IOrdersInFlight
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
