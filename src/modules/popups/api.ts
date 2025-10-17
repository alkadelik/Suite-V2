import baseApi, { useApiQuery } from "@/composables/baseApi"
import {
  AddProductsPayload,
  EventfulPopup,
  EventfulResponse,
  PopupEvent,
  PopupEventResponse,
  PopupInventory,
  PopupOrderPayload,
} from "./types"
import { useMutation } from "@tanstack/vue-query"
import { TOrderResponse } from "@modules/orders/types"
import { ComputedRef } from "vue"

/** Create popup api request */
export function useCreatePopup() {
  return useMutation({
    mutationFn: (body: FormData) =>
      baseApi.post("/popup-events/", body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  })
}

/** Update popup api request */
export function useUpdatePopup() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: FormData }) =>
      baseApi.patch(`/popup-events/${id}/`, body),
  })
}

export function useGetPopupEvents(params?: ComputedRef<Record<string, string>>) {
  return useApiQuery<PopupEventResponse>({
    url: "/popup-events/",
    params,
    key: "popups",
    selectData: true,
  })
}

export function useGetPopupEventById(id: string) {
  return useApiQuery<PopupEvent>({
    url: `/popup-events/${id}`,
    key: `popup-${id}`,
    selectData: true,
  })
}

export function useDeletePopupEvent() {
  return useMutation({
    mutationFn: (id: string) => baseApi.delete(`/popup-events/${id}/`),
  })
}

export function useGetEventfulPopups() {
  return useApiQuery<EventfulResponse>({
    url: "/eventful/events",
    key: "eventful-popups",
    selectData: true,
  })
}

export function useGetEventfulPopupById(id: string) {
  return useApiQuery<EventfulPopup>({
    url: `/eventful/events/${id}`,
    key: `eventful-popup-${id}`,
    selectData: true,
  })
}

export function useGetPopupInventory(popupId: string) {
  return useApiQuery<PopupInventory[]>({
    url: `/popup-events/inventory/${popupId}`,
    key: `popup-inventory-${popupId}`,
    selectData: true,
  })
}

export function useAddProductsToPopup() {
  return useMutation({
    mutationFn: (payload: { popup_event: string; items: AddProductsPayload[] }) =>
      baseApi.post(`/popup-events/inventory/`, payload),
  })
}

export function useUpdatePopupProduct() {
  return useMutation({
    mutationFn: (payload: { popup_event: string; items: Partial<AddProductsPayload>[] }) =>
      baseApi.patch(`/popup-events/inventory/bulk_update/`, payload),
  })
}

export function useGetPopupOrders(popupId: string) {
  return useApiQuery<TOrderResponse>({
    url: `/orders/?source=popup_internal&popup_event=${popupId}`,
    key: `popup-orders-${popupId}`,
    selectData: true,
  })
}

export function useCreatePopupOrder() {
  return useMutation({
    mutationFn: (body: PopupOrderPayload) => baseApi.post(`/orders/popup/`, body),
  })
}
