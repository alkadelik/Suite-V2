import baseApi from "@/composables/baseApi"
import { useQuery } from "@tanstack/vue-query"
import { useAuthStore } from "@modules/auth/store"
import type {
  IApiEnvelope,
  IApiRestockData,
  IApiTasksData,
  IAwarenessRail,
  ICreditApiData,
  IDashboardHealth,
  IHealthApiData,
  ISummaryApiData,
  ITask,
  IWorklistResponse,
} from "./types"
import {
  mapCreditToReceivables,
  mapHealthToVitals,
  mapPopupsToStatus,
  mapRestock,
  mapSummary,
  mapTask,
  TASK_TYPE_ORDER,
} from "./mappers"
import { AWARENESS_RAIL_FIXTURE, HEALTH_FIXTURE, WORKLIST_FIXTURE } from "./fixtures"

/**
 * Live Command/Health Center endpoints (GET /api/v2/health-center/*), mapped to
 * the UI view types in mappers.ts. Set VITE_DASHBOARD_MOCK=true to render the
 * fixtures instead (offline / design work).
 */
const USE_MOCK = import.meta.env.VITE_DASHBOARD_MOCK === "true"

/** Unwrap the { error, message, data } envelope every endpoint returns. */
async function getData<T>(path: string): Promise<T> {
  const { data } = await baseApi.get<IApiEnvelope<T>>(path)
  return data.data
}

function mockResolve<T>(payload: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(payload), ms))
}

/** Health vitals strip (DASH-21). Fetched independently of the worklist. */
export function useGetDashboardHealth() {
  return useQuery<IDashboardHealth>({
    queryKey: ["dashboard", "health"],
    queryFn: async () => {
      if (USE_MOCK) return mockResolve(HEALTH_FIXTURE)
      const health = await getData<IHealthApiData>("/health-center/health/")
      return { vitals: mapHealthToVitals(health) }
    },
    refetchOnWindowFocus: false,
  })
}

/**
 * Greeting, summary line and ranked worklist (DASH-20/22). The worklist is
 * assembled from three task endpoints (fulfillment, popups, restock) plus the
 * summary; tasks are ordered by task-type priority then per-endpoint rank.
 */
export function useGetWorklist() {
  return useQuery<IWorklistResponse>({
    queryKey: ["dashboard", "worklist"],
    queryFn: async () => {
      if (USE_MOCK) return mockResolve(WORKLIST_FIXTURE, 550)

      const [summary, fulfillment, popups, restock] = await Promise.all([
        getData<ISummaryApiData>("/health-center/summary/"),
        getData<IApiTasksData>("/health-center/tasks/fulfillment/"),
        getData<IApiTasksData>("/health-center/tasks/popups/"),
        getData<IApiRestockData>("/health-center/tasks/restock/"),
      ])

      // Order fulfillment + popup tasks by type priority, then rank.
      const ranked = [...fulfillment.tasks, ...popups.tasks]
        .map((t) => ({ order: TASK_TYPE_ORDER[t.task_type] ?? 50, rank: t.rank, task: mapTask(t) }))
        .sort((a, b) => a.order - b.order || a.rank - b.rank)

      const restockTasks = mapRestock(restock).map((task, i) => ({ order: 60, rank: i, task }))

      const tasks: ITask[] = [...ranked, ...restockTasks]
        .sort((a, b) => a.order - b.order || a.rank - b.rank)
        .map((x) => x.task)

      const { count, summaryLine, secondary } = mapSummary(summary)
      const { user } = useAuthStore()

      return {
        firstName: user?.first_name || "there",
        count,
        summaryLine,
        summaryLineSecondary: secondary,
        tasks,
      }
    },
    refetchOnWindowFocus: false,
  })
}

/** Awareness rail: receivables + popups (orders-in-flight has no endpoint yet). */
export function useGetAwarenessRail() {
  return useQuery<IAwarenessRail>({
    queryKey: ["dashboard", "rail"],
    queryFn: async () => {
      if (USE_MOCK) return mockResolve(AWARENESS_RAIL_FIXTURE, 450)
      const [credit, popups] = await Promise.all([
        getData<ICreditApiData>("/health-center/health/credit/"),
        getData<IApiTasksData>("/health-center/tasks/popups/"),
      ])
      return {
        receivables: mapCreditToReceivables(credit),
        ordersInFlight: null, // no orders-in-flight endpoint yet
        popups: mapPopupsToStatus(popups.tasks),
      }
    },
    refetchOnWindowFocus: false,
  })
}

// Task actions (resolve/navigate) live in taskActions.ts + useTaskActions.ts,
// reusing the app's existing endpoints rather than health-center writes.
