import { useMutation } from "@tanstack/vue-query"
import baseApi, { useApiQuery } from "@/composables/baseApi"
import { MaybeRefOrGetter, computed, toValue } from "vue"

export type TShipment = Record<string, unknown>

export type TShipmentResponse = {
  count: number
  next?: string | null
  previous?: string | null
  results: TShipment[]
}

export type UrlResponse = {
  data?: {
    data?: { url?: string }
    url?: string
  }
}

/** Fetch shipments */
export function useGetShipments(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useApiQuery<TShipmentResponse>({
    url: "/shipping/orders/",
    params,
    key: "shipments",
    selectData: true,
  })
}

/** Fetch single shipment */
export function useGetShipmentById(id: MaybeRefOrGetter<string>) {
  return useApiQuery<TShipment>({
    url: computed(() => `/shipping/orders/${toValue(id)}/`),
    key: computed(() => `shipping/orders/${toValue(id)}`),
    selectData: true,
  })
}

/** Track shipment */
export function useTrackShipment() {
  return useMutation<UrlResponse, unknown, string>({
    mutationFn: async (id: string) => {
      const res = await baseApi.get(`/shipping/orders/${id}/track/`)
      return res as UrlResponse
    },
  })
}

/** Get waybill */
export function useGetWaybill() {
  return useMutation<UrlResponse, unknown, string>({
    mutationFn: async (id: string) => {
      const res = await baseApi.get(`/shipping/orders/${id}/waybill/`)
      return res as UrlResponse
    },
  })
}
