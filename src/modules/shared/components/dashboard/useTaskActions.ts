import { ref } from "vue"
import { toast } from "@/composables/useToast"
import { formatError } from "@/utils/error-handler"
import { useResolveTaskAction } from "./api"
import type { ITaskResolveEvent } from "./types"

/**
 * Wires worklist task/row/bulk actions to the resolve mutation (DASH-24).
 *
 * - Each action writes state on the server; the mutation's onSuccess invalidates
 *   the dashboard queries so resolved tasks fall out on re-fetch — we never
 *   remove cards on the client or track completion state locally.
 * - On failure the card stays actionable and a specific error toast is shown.
 * - Bulk actions resolve every row or report how many failed.
 */
export function useTaskActions() {
  const mutation = useResolveTaskAction()
  /** Target ids with an action in flight — drives per-row/card button loading. */
  const loadingIds = ref<string[]>([])

  async function resolve(event: ITaskResolveEvent) {
    const targets = event.rowIds?.length ? event.rowIds : [event.targetId]
    const inFlight = Array.from(new Set([event.targetId, ...targets]))
    loadingIds.value = [...loadingIds.value, ...inFlight]

    try {
      const results = await Promise.allSettled(
        targets.map((id) => mutation.mutateAsync({ action: event.action, targetId: id })),
      )
      const failed = results.filter((r) => r.status === "rejected").length

      if (failed === 0) {
        toast.success(targets.length > 1 ? "All tasks resolved" : "Task resolved")
      } else {
        // Surface the first specific error, and how many rows failed.
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
