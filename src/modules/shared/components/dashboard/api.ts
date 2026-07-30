import baseApi from "@/composables/baseApi"
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import type { IAwarenessRail, IDashboardHealth, IWorklistResponse, TaskAction } from "./types"
import { AWARENESS_RAIL_FIXTURE, HEALTH_FIXTURE, WORKLIST_FIXTURE } from "./fixtures"

/**
 * Backend endpoints for the Command/Health Center are not yet deployed.
 * With VITE_DASHBOARD_MOCK === "true" the hooks resolve the fixtures; otherwise
 * they hit the intended endpoints. See docs/superpowers/plans for the contract.
 */
const USE_MOCK = import.meta.env.VITE_DASHBOARD_MOCK === "true"

/** Simulate network latency so loading states are exercised in mock mode. */
function mockResolve<T>(payload: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(payload), ms))
}

/** Health vitals strip (DASH-21). Fetched independently of the worklist. */
export function useGetDashboardHealth() {
  return useQuery<IDashboardHealth>({
    queryKey: ["dashboard", "health"],
    queryFn: async () => {
      if (USE_MOCK) return mockResolve(HEALTH_FIXTURE)
      const { data } = await baseApi.get<IDashboardHealth>("/dashboard/health/")
      return data
    },
    refetchOnWindowFocus: false,
  })
}

/** Greeting, summary line and ranked task worklist (DASH-20/22). */
export function useGetWorklist() {
  return useQuery<IWorklistResponse>({
    queryKey: ["dashboard", "worklist"],
    queryFn: async () => {
      if (USE_MOCK) return mockResolve(WORKLIST_FIXTURE, 550)
      const { data } = await baseApi.get<IWorklistResponse>("/dashboard/worklist/")
      return data
    },
    refetchOnWindowFocus: false,
  })
}

/** Awareness rail: receivables, orders in flight, popups (DASH-25). */
export function useGetAwarenessRail() {
  return useQuery<IAwarenessRail>({
    queryKey: ["dashboard", "rail"],
    queryFn: async () => {
      if (USE_MOCK) return mockResolve(AWARENESS_RAIL_FIXTURE, 450)
      const { data } = await baseApi.get<IAwarenessRail>("/dashboard/rail/")
      return data
    },
    refetchOnWindowFocus: false,
  })
}

export interface ITaskActionPayload {
  action: TaskAction
  /** Task or row id the action resolves. */
  targetId: string
}

/**
 * Resolve a worklist task/row action (DASH-24). Each action writes state on the
 * server; on success we invalidate the dashboard queries so resolved tasks fall
 * out of the re-fetched set (no optimistic/client-side removal).
 */
export function useResolveTaskAction() {
  const queryClient = useQueryClient()

  // Maps an action to its live domain endpoint. In mock mode we no-op-resolve.
  const endpointFor = (p: ITaskActionPayload): Promise<unknown> => {
    switch (p.action) {
      case "mark_sent":
        return baseApi.post(`/orders/${p.targetId}/mark-sent/`)
      case "create_shipment":
        return baseApi.post(`/orders/${p.targetId}/shipments/`)
      case "reschedule":
        return baseApi.post(`/orders/${p.targetId}/reschedule/`)
      case "send_reminder":
        return baseApi.post(`/orders/${p.targetId}/reminder/`)
      case "mark_paid":
        return baseApi.post(`/orders/${p.targetId}/mark-paid/`)
      case "add_stock":
        return baseApi.post(`/inventory/${p.targetId}/stock/`)
      case "start_run":
        return baseApi.post(`/production/runs/`, { item: p.targetId })
      case "discount_or_use":
        return baseApi.post(`/inventory/${p.targetId}/discount/`)
      case "close_popup":
        return baseApi.post(`/popups/${p.targetId}/close/`)
      default:
        return Promise.reject(new Error("Unknown task action"))
    }
  }

  return useMutation({
    mutationFn: (payload: ITaskActionPayload): Promise<unknown> => {
      if (USE_MOCK) return mockResolve({ ok: true }, 600)
      return endpointFor(payload)
    },
    onSuccess: () => {
      // Re-evaluate the whole dashboard: resolved tasks disappear, vitals/rail refresh.
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}
