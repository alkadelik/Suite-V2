import { useMutation } from "@tanstack/vue-query"
import baseApi, { useApiQuery } from "@/composables/baseApi"
import type { ISubscriberExportPayload, ISubscriberResponse } from "./types"
import type { MaybeRefOrGetter } from "vue"

/** Fetch subscribers list */
export function useGetSubscribers(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useApiQuery<ISubscriberResponse>({
    url: "/stores/emails/",
    params,
    key: "subscribers",
    selectData: true,
  })
}

/** Export subscribers api request */
export function useExportSubscribers() {
  return useMutation({
    mutationFn: (payload: ISubscriberExportPayload) =>
      baseApi.post("/stores/email/export/", payload),
  })
}
