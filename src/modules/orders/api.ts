import { useMutation } from "@tanstack/vue-query"
import { OrderPayload, TOrderResponse } from "./types"
import baseApi, { useApiQuery } from "@/composables/baseApi"
import { MaybeRefOrGetter } from "vue"

/** Create order api request */
export function useCreateOrder() {
  return useMutation({
    mutationFn: (body: OrderPayload) => baseApi.post("/orders/", body),
  })
}

/** Fetch orders */
export function useGetOrders(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useApiQuery<TOrderResponse>({ url: "/orders/", params, key: "orders", selectData: true })
}

/** Delete order api request */
export function useDeleteOrder() {
  return useMutation({
    mutationFn: (id: number) => baseApi.delete(`/orders/${id}/`),
  })
}

/** Void order api request */
export function useVoidOrder() {
  return useMutation({
    mutationFn: ({ id, void_reason }: { id: number; void_reason: string }) =>
      baseApi.post(`/orders/${id}/void/`, { void_reason }),
  })
}

/** Create order memo api request */
export function useCreateOrderMemo() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { content: string } }) =>
      baseApi.post(`/orders/${id}/memos/`, body),
  })
}

/** Fetch order memos */
export function useGetOrderMemos(id: string) {
  return useApiQuery({
    url: `/orders/${id}/memos/`,
    key: "orderMemos",
    selectData: true,
  })
}
