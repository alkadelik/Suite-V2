import { useMutation } from "@tanstack/vue-query"
import {
  IMemoPayload,
  IPaymentHistory,
  IPaymentPayload,
  OrderDashboardStats,
  OrderPayload,
  TOrder,
  TOrderMemo,
  TOrderResponse,
} from "./types"
import baseApi, { TPaginatedResponse, useApiQuery } from "@/composables/baseApi"
import { MaybeRefOrGetter, computed, toValue } from "vue"

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

/** Fetch order statistics */
export function useGetOrderDashboard() {
  return useApiQuery<OrderDashboardStats>({
    url: `/orders/dashboard/`,
    key: `orders-dashboard`,
    selectData: true,
  })
}

/** Fetch single order by ID */
export function useGetOrderById(id: string) {
  return useApiQuery<TOrderResponse>({
    url: `/orders/${id}/`,
    key: `orders/${id}`,
    selectData: true,
  })
}

/** Fetch single order by ID - public */
export function useGetPublicOrderById(id: string) {
  return useApiQuery<TOrder>({
    url: `/orders/public/${id}/`,
    key: `orders-public/${id}`,
    selectData: true,
  })
}

/** Delete order api request */
export function useDeleteOrder() {
  return useMutation({
    mutationFn: (id: string) => baseApi.delete(`/orders/${id}/`),
  })
}

/** Void order api request */
export function useVoidOrder() {
  return useMutation({
    mutationFn: ({ id, void_reason }: { id: string; void_reason: string }) =>
      baseApi.post(`/orders/${id}/void/`, { void_reason }),
  })
}

/** Create order memo api request */
export function useCreateOrderMemo() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: IMemoPayload }) =>
      baseApi.post(`/orders/${id}/memos/new/`, body),
  })
}

/** Fetch order memos */
export function useGetOrderMemos(id: string) {
  return useApiQuery<TPaginatedResponse<TOrderMemo>["data"]>({
    url: `/orders/${id}/memos/`,
    key: "orderMemos",
    selectData: true,
  })
}

export function useMarkAllFulfilled() {
  return useMutation({
    mutationFn: (orderId: string) => baseApi.post(`/orders/${orderId}/complete/`, {}),
  })
}

export function usePartiallyFulfill() {
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: { items: { variant: string; qty: number }[] }
    }) => baseApi.post(`/orders/${id}/fulfill/`, body),
  })
}

export function useShareOrderReceipt() {
  return useMutation({
    mutationFn: (id: string) => baseApi.post(`/orders/${id}/send-receipt/`, {}),
  })
}

export function useShareOrderInvoice() {
  return useMutation({
    mutationFn: (id: string) => baseApi.post(`/orders/${id}/send-invoice/`, {}),
  })
}

/** Create order memo api request */
export function useAddUpdateOrderPayment() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: IPaymentPayload }) =>
      baseApi.post(`/orders/${id}/record-payment/`, body),
  })
}

/** Fetch order memos */
export function useGetOrderPaymentHistory(id: MaybeRefOrGetter<string>) {
  return useApiQuery<IPaymentHistory>({
    url: computed(() => `/orders/${toValue(id)}/payments/`),
    key: computed(() => `orderPayments/${toValue(id)}`),
    selectData: true,
  })
}

/** Initialize order payment */
export function useInitializeOrderPayment() {
  return useMutation({
    mutationFn: (uid: string) =>
      baseApi.post<{ data: { payment_link: string } }>(`/billings/orders/${uid}/initialize/`),
  })
}

/** Generate order receipt - returns a URL for sharing */
export function useGenerateReceipt() {
  return useMutation({
    mutationFn: (id: string) =>
      baseApi.post<{ data: { url: string } }>(`/orders/${id}/generate-receipt/`),
  })
}
