import baseApi from "@/composables/baseApi"
import type { TaskAction } from "./types"

/**
 * How a worklist task action resolves.
 *
 *  - "request": a single-call endpoint the app already exposes elsewhere. We
 *    reuse the exact same path the relevant page uses (e.g. closing a popup hits
 *    the same endpoint the Popups page uses).
 *  - "navigate": multi-step flows (booking a shipment, adding stock, starting a
 *    production run, recording a payment) can't be done in one call, so we send
 *    the merchant into the existing page/flow to complete them there — rather
 *    than inventing a new endpoint.
 */
export type TaskResolution =
  | { type: "request"; request: (targetId: string) => Promise<unknown>; successMessage: string }
  | { type: "navigate"; to: string; message: string }

export function resolveForAction(action: TaskAction): TaskResolution {
  switch (action) {
    // ---- Direct, single-call endpoints (identical to the app's own pages) ----
    case "close_popup":
      // Mirrors popups/api.ts → useClosePopupEvent: POST /popup-events/{id}/close/
      return {
        type: "request",
        request: (id) => baseApi.post(`/popup-events/${id}/close/`),
        successMessage: "Popup closed",
      }
    case "mark_sent":
      // Mirrors orders/api.ts → useMarkAllFulfilled: POST /orders/{id}/complete/
      return {
        type: "request",
        request: (id) => baseApi.post(`/orders/${id}/complete/`, {}),
        successMessage: "Order marked as sent",
      }

    // ---- Multi-step flows → open the existing page to finish there ----
    case "create_shipment":
      return { type: "navigate", to: "/orders", message: "Book the shipment from the order" }
    case "send_reminder":
      return { type: "navigate", to: "/orders", message: "Send the reminder from the order" }
    case "mark_paid":
      return { type: "navigate", to: "/orders", message: "Record the payment on the order" }
    case "reschedule":
      return { type: "navigate", to: "/orders", message: "Reschedule the delivery from the order" }
    case "add_stock":
      return { type: "navigate", to: "/inventory", message: "Add stock from inventory" }
    case "discount_or_use":
      return { type: "navigate", to: "/inventory", message: "Apply a discount from inventory" }
    case "start_run":
      return { type: "navigate", to: "/production/runs", message: "Start the run from production" }
    default:
      return { type: "navigate", to: "/orders", message: "Open the order to continue" }
  }
}
