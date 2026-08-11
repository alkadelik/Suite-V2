import { ref } from "vue"
import { useRouter } from "vue-router"
import { useQueryClient } from "@tanstack/vue-query"
import { toast } from "@/composables/useToast"
import { formatError } from "@/utils/error-handler"
import { resolveForAction } from "./taskActions"
import type { ITask, ITaskResolveEvent, IWorklistResponse } from "./types"

/**
 * Wires worklist task/row/bulk actions to their resolution (DASH-24), reusing
 * the app's existing endpoints (see taskActions.ts).
 *
 * - Single-call actions hit the endpoint, then optimistically remove the
 *   resolved item from the list immediately (before the re-fetch confirms it),
 *   and invalidate so the dashboard re-syncs with the server.
 * - Multi-step actions navigate to the existing page/flow.
 * - On failure the card stays actionable and a specific error toast is shown.
 * - Bulk actions resolve every row or report how many failed.
 */
export function useTaskActions() {
  const router = useRouter()
  const queryClient = useQueryClient()
  /** Target ids with an action in flight — drives per-row/card button loading. */
  const loadingIds = ref<string[]>([])

  /**
   * Remove resolved items from the cached worklist right away: a matching flat
   * card (id === popup/order uid) is dropped; matching aggregate rows are pulled
   * and, if a card has no rows left, the card is dropped too.
   */
  function removeResolved(ids: string[]) {
    const idSet = new Set(ids)
    queryClient.setQueryData<IWorklistResponse>(["dashboard", "worklist"], (old) => {
      if (!old) return old
      let removedCards = 0
      const tasks = old.tasks.reduce<ITask[]>((acc, task) => {
        if (idSet.has(task.id)) {
          removedCards++
          return acc
        }
        if (task.rows?.length) {
          const rows = task.rows.filter((row) => !idSet.has(row.id))
          if (rows.length === 0) {
            removedCards++
            return acc
          }
          acc.push({ ...task, rows })
          return acc
        }
        acc.push(task)
        return acc
      }, [])
      return { ...old, tasks, count: Math.max(0, old.count - removedCards) }
    })
  }

  async function resolve(event: ITaskResolveEvent) {
    const resolution = resolveForAction(event.action)

    // Multi-step actions: send the merchant to the existing flow to finish there.
    if (resolution.type === "navigate") {
      toast.info(resolution.message)
      await router.push(resolution.to)
      return
    }

    // Single-call actions: hit the endpoint(s).
    const targets = event.rowIds?.length ? event.rowIds : [event.targetId]
    const inFlight = Array.from(new Set([event.targetId, ...targets]))
    loadingIds.value = [...loadingIds.value, ...inFlight]

    try {
      const results = await Promise.allSettled(
        targets.map((id) => resolution.request(id).then(() => id)),
      )
      const succeededIds = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
        .map((r) => r.value)
      const failed = results.length - succeededIds.length

      // Remove resolved items immediately, then re-fetch to confirm.
      if (succeededIds.length) {
        removeResolved(succeededIds)
        void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      }

      if (failed === 0) {
        toast.success(targets.length > 1 ? "All tasks resolved" : resolution.successMessage)
      } else {
        const firstError = results.find((r): r is PromiseRejectedResult => r.status === "rejected")
        const detail = firstError ? formatError(firstError.reason) : "Some tasks failed"
        toast.error(
          targets.length > 1 ? `${failed} of ${targets.length} couldn't be completed` : detail,
        )
      }
    } catch (error) {
      toast.error(formatError(error))
    } finally {
      loadingIds.value = loadingIds.value.filter((id) => !inFlight.includes(id))
    }
  }

  return { loadingIds, resolve }
}
