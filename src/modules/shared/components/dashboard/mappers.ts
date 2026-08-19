// ============================================================================
// Adapters: live /health-center/* API responses  →  UI view types.
//
// The API returns structured task data (task_type + inputs + detail_rows), not
// pre-rendered strings, so titles/tones/actions/urgency are composed here.
// See docs/figma/command-health-center/health-center-samples.json for shapes.
// ============================================================================
import { formatCurrency } from "@/utils/format-currency"
import { formatDate } from "@/utils/formatDate"
import { pluralize } from "@/utils/pluralize"
import type {
  IApiRestockData,
  IApiRestockItem,
  IApiTask,
  ICreditApiData,
  IHealthApiData,
  IHealthVital,
  IOrdersInFlight,
  IPopupStatus,
  ITaskTag,
  IReceivablesPanel,
  ISummaryApiData,
  ITask,
  TaskTone,
  TaskAction,
  UrgencyLevel,
  VitalStatus,
} from "./types"

/** Format a naira amount (string or number), guarding against NaN. */
function money(value: string | number | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : Number(value)
  return Number.isFinite(n) ? formatCurrency(n) : formatCurrency(0)
}

/** age_days → "Today" / "1 day" / "N days". */
function ageLabel(age: number): string {
  if (age <= 0) return "Today"
  return `${age} ${pluralize("day", age)}`
}

/** Urgency thresholds mirror the design bars: ≥7d high (red), ≥2d medium, else low. */
function urgencyFromAge(age: number): UrgencyLevel {
  if (age >= 7) return "high"
  if (age >= 2) return "medium"
  return "low"
}

/** Backend task/vital severity → the vital status colour. */
function severityToStatus(severity: string | null): VitalStatus {
  switch (severity) {
    case "high":
      return "critical"
    case "medium":
      return "warning"
    case "low":
      return "positive"
    default:
      return "neutral"
  }
}

// ---- Health vitals (GET /health-center/health/) — all 6 from live data ----
export function mapHealthToVitals(h: IHealthApiData): IHealthVital[] {
  const salesToday = parseFloat(h.sales.today)
  const avgRevenue = h.sales.avg_revenue_7d != null ? parseFloat(h.sales.avg_revenue_7d) : null
  const salesDelta =
    h.sales.baseline_available && avgRevenue && avgRevenue > 0
      ? Math.round(((salesToday - avgRevenue) / avgRevenue) * 100)
      : null

  const avgOrders = h.sales.avg_order_count_7d
  const ordersDelta =
    h.sales.baseline_available && avgOrders != null
      ? Math.round(h.sales.order_count_today - avgOrders)
      : null

  const totalCount = h.low_stock.total_count
  const owed = parseFloat(h.credit.total_outstanding)
  const aged = parseFloat(h.credit.aged_subtotal)

  return [
    {
      key: "sales_today",
      label: "Sales Today",
      value: money(h.sales.today),
      status: salesDelta != null && salesDelta >= 0 ? "positive" : "neutral",
      detail:
        salesDelta != null ? `${salesDelta >= 0 ? "+" : ""}${salesDelta}% on 7-day avg` : null,
      trendUp: salesDelta != null && salesDelta > 0,
    },
    {
      key: "orders_today",
      label: "Orders Today",
      value: String(h.sales.order_count_today),
      status: ordersDelta != null && ordersDelta >= 0 ? "positive" : "neutral",
      detail:
        ordersDelta != null ? `${ordersDelta >= 0 ? "+" : ""}${ordersDelta} on 7-day avg` : null,
      trendUp: ordersDelta != null && ordersDelta > 0,
    },
    {
      key: "deliveries_in_flight",
      label: "Deliveries in Flight",
      value: String(h.deliveries_in_flight.total),
      status:
        h.deliveries_in_flight.failed_count > 0
          ? "critical"
          : severityToStatus(h.deliveries_in_flight.severity),
      detail:
        h.deliveries_in_flight.failed_count > 0
          ? `${h.deliveries_in_flight.failed_count} failed, needs redelivery`
          : null,
    },
    {
      key: "low_stock",
      label: "Low Stock",
      value: `${totalCount} ${totalCount === 1 ? "Item" : "Items"}`,
      status: totalCount > 0 ? "warning" : "neutral",
      detail:
        totalCount > 0
          ? `${h.low_stock.product_count} ${pluralize("product", h.low_stock.product_count)} · ${h.low_stock.material_count} ${pluralize("input", h.low_stock.material_count)}`
          : null,
    },
    {
      key: "nearing_expiry",
      label: "Nearing Expiry",
      value: money(h.expiry.value_at_risk),
      status:
        h.expiry.batch_count > 0
          ? severityToStatus(h.expiry.severity) === "neutral"
            ? "warning"
            : severityToStatus(h.expiry.severity)
          : "neutral",
      detail:
        h.expiry.batch_count > 0
          ? `${h.expiry.batch_count} ${h.expiry.batch_count === 1 ? "batch" : "batches"}${
              h.expiry.soonest_days != null
                ? `, ${h.expiry.soonest_days} ${pluralize("day", h.expiry.soonest_days)} left`
                : ""
            }`
          : null,
    },
    {
      key: "owed_to_you",
      label: "Owed to You",
      value: money(h.credit.total_outstanding),
      status: owed > 0 ? "warning" : "neutral",
      detail: aged > 0 ? `${money(h.credit.aged_subtotal)} over 30 days` : null,
    },
  ]
}

// ---- Rail: orders in flight + active popups (both on GET /health-center/health/) ----
export function mapOrdersInFlight(h: IHealthApiData): IOrdersInFlight {
  return {
    outForDelivery: h.orders_in_flight.out_for_delivery,
    waitingToBeCollected: h.orders_in_flight.waiting_to_be_collected,
    deliveredToday: h.orders_in_flight.delivered_today,
  }
}

export function mapActivePopups(h: IHealthApiData): IPopupStatus[] {
  return h.active_popups.map((p) => {
    const active = p.status === "active"
    return {
      id: p.uid,
      name: p.name,
      statusLabel: `${active ? "ends" : "ended"} ${formatDate(p.end_date)}`,
      active,
    }
  })
}

// ---- Summary line (GET /health-center/summary/) ----
export function mapSummary(s: ISummaryApiData): {
  count: number
  summaryLine: string
  secondary: string | null
} {
  // summary_line bundles "N things need you today. <exposure sentence>". The
  // greeting already renders the count, so strip that leading sentence here.
  const stripped = s.summary_line.replace(/^\s*\d+\s+things?\s+need\s+you\s+today\.\s*/i, "").trim()
  return { count: s.task_count, summaryLine: stripped || s.summary_line, secondary: null }
}

// ---- Receivables (GET /health-center/health/credit/) ----
export function mapCreditToReceivables(c: ICreditApiData): IReceivablesPanel {
  return {
    totalLabel: money(c.total_outstanding),
    customerCount: c.customer_count,
    items: c.rows.map((r) => ({
      customerId: r.order_uid,
      name: r.customer_name,
      ageLabel: ageLabel(r.age_days),
      amountLabel: money(r.outstanding),
      aged: r.is_aged,
    })),
  }
}

// ---- Tasks (GET /health-center/tasks/{fulfillment,popups}) ----

/** resolving_action → the client action + button label. */
const ACTION_MAP: Record<string, { action: TaskAction; label: string }> = {
  mark_fulfilled: { action: "mark_sent", label: "Resolve" },
  remind_customer: { action: "send_reminder", label: "Send Reminder" },
  create_shipment: { action: "create_shipment", label: "Create" },
  close_popup: { action: "close_popup", label: "Close Popup" },
  redeliver: { action: "reschedule", label: "Redeliver" },
  restock: { action: "add_stock", label: "Add Stock" },
  produce: { action: "start_run", label: "Start Run" },
}

/** task_type → title template + card tone. */
const TASK_TYPE_META: Record<
  string,
  { tone: TaskTone; title: (i: Record<string, string | number>) => string }
> = {
  send_out: {
    tone: "danger",
    title: (i) => `Send out ${i.count} ${pluralize("order", Number(i.count))}`,
  },
  create_shipment: {
    tone: "warning",
    title: (i) => `Create ${i.count} ${pluralize("shipment", Number(i.count))}`,
  },
  pickup_reminder: {
    tone: "plain",
    title: (i) => `Remind ${i.count} ${pluralize("customer", Number(i.count))} to collect`,
  },
  redeliver: { tone: "danger", title: () => `Redeliver order` },
  close_popup: { tone: "danger", title: (i) => `Close the ${i.popup_name} popup` },
}

/** Ordering across the (separate) task endpoints, to approximate the design flow. */
export const TASK_TYPE_ORDER: Record<string, number> = {
  send_out: 10,
  create_shipment: 20,
  close_popup: 30,
  redeliver: 40,
  pickup_reminder: 80,
}

function fallbackAction(resolving: string): { action: TaskAction; label: string } {
  return ACTION_MAP[resolving] ?? { action: "mark_sent", label: "Resolve" }
}

/** delivery_method → the leading "Manual Delivery" / "Shipbubble" chip. */
function deliveryTags(task: IApiTask): ITaskTag[] {
  switch (task.delivery_method) {
    case "manual":
      return [{ label: "Manual Delivery", color: "error", dot: true }]
    case "shipbubble":
      return [{ label: "Shipbubble", color: "warning", dot: true }]
    default:
      return []
  }
}

export function mapTask(task: IApiTask): ITask {
  const meta = TASK_TYPE_META[task.task_type]
  const act = fallbackAction(task.resolving_action)
  const tone: TaskTone = meta?.tone ?? "plain"
  const title = meta ? meta.title(task.title_inputs) : task.task_type.replace(/_/g, " ")

  // Flat close-popup card, driven by the attached popup object.
  if (task.task_type === "close_popup" && task.popup) {
    const p = task.popup
    const heldNote =
      p.stranded_qty > 0
        ? `${p.stranded_qty} ${pluralize("unit", p.stranded_qty)} still held out of main stock`
        : `${p.days_overdue} ${pluralize("day", p.days_overdue)} overdue`
    return {
      id: p.uid,
      variant: "flat",
      title,
      subtitle: `Ended ${formatDate(p.end_date)}  •  ${heldNote}`,
      tags: [],
      tone,
      action: act.action,
      actionLabel: act.label,
      amountLabel: p.stranded_value > 0 ? money(p.stranded_value) : null,
    }
  }

  const rows = task.detail_rows ?? []

  // Aggregate card with expandable per-order rows.
  if (rows.length > 0) {
    const total = rows.reduce((sum, r) => sum + (Number(r.order_value) || 0), 0)
    return {
      id: `${task.task_type}-${task.rank}`,
      variant: "aggregate",
      title,
      subtitle: `${rows.length} ${pluralize("order", rows.length)}  •  ${money(total)} across them`,
      tags: deliveryTags(task),
      tone,
      bulkActionLabel: null,
      rows: rows.map((r) => ({
        id: r.order_uid,
        title: r.customer_name,
        reference: `#${r.order_number}`,
        urgency: urgencyFromAge(r.age_days),
        ageLabel: ageLabel(r.age_days),
        amountLabel: money(r.order_value),
        action: act.action,
        actionLabel: act.label,
      })),
    }
  }

  // Flat fallback (no rows, not a popup).
  const atRisk = task.ranking_inputs.money_at_risk
  return {
    id: `${task.task_type}-${task.rank}`,
    variant: "flat",
    title,
    subtitle: null,
    tags: [],
    tone,
    action: act.action,
    actionLabel: act.label,
    amountLabel: atRisk && parseFloat(atRisk) > 0 ? money(atRisk) : null,
  }
}

// ---- Restock tasks (GET /health-center/tasks/restock/) ----
// UNVERIFIED shape (empty in the sample store) — read defensively.
function restockCard(item: IApiRestockItem, kind: "product" | "material", index: number): ITask {
  const name = item.name ?? (kind === "product" ? "product" : "material")
  const left = item.available_stock
  return {
    id: item.uid ?? `restock-${kind}-${index}`,
    variant: "flat",
    title: `Buy ${name}`,
    subtitle: left != null ? `Only ${left} left` : null,
    tags: [{ label: kind === "product" ? "Product" : "Raw material", color: "alt" }],
    tone: "plain",
    action: "add_stock",
    actionLabel: "Add Stock",
    amountLabel: null,
  }
}

export function mapRestock(data: IApiRestockData): ITask[] {
  return [
    ...data.products.map((p, i) => restockCard(p, "product", i)),
    ...data.materials.map((m, i) => restockCard(m, "material", i)),
  ]
}

// ---- Popups status panel (reuses the popup task objects) ----
// The design's rail shows active/ending popups; the only popup data available is
// the overdue close_popup tasks, so the panel lists those as "ended …".
export function mapPopupsToStatus(popupTasks: IApiTask[]): IPopupStatus[] {
  return popupTasks
    .filter((t) => t.popup)
    .map((t) => ({
      id: t.popup!.uid,
      name: t.popup!.name,
      statusLabel: `ended ${formatDate(t.popup!.end_date)}`,
      active: false,
    }))
}
