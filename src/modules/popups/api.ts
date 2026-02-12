import baseApi, { useApiQuery } from "@/composables/baseApi"
import {
  AddProductsPayload,
  EventDiscountCode,
  EventfulPopup,
  EventfulResponse,
  PopupEvent,
  PopupEventResponse,
  PopupInventory,
  PopupOrderPayload,
} from "./types"
import { useMutation } from "@tanstack/vue-query"
import { TOrderResponse } from "@modules/orders/types"
import { ComputedRef, MaybeRefOrGetter, computed, toValue } from "vue"

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

export function useGetPopupEventById(
  id: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean> = true,
) {
  return useApiQuery<PopupEvent>({
    url: computed(() => `/popup-events/${toValue(id)}`),
    key: computed(() => `popup-${toValue(id)}`),
    selectData: true,
    enabled,
  })
}

export function useDeletePopupEvent() {
  return useMutation({
    mutationFn: (id: string) => baseApi.delete(`/popup-events/${id}/`),
  })
}

export function useClosePopupEvent() {
  return useMutation({
    mutationFn: (id: string) => baseApi.post(`/popup-events/${id}/close/`),
  })
}

/** Fetch organizer events - public */
export function useGetEventfulPopups(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useApiQuery<EventfulResponse>({
    url: "/eventful/events/",
    params,
    key: "eventful-popups",
    selectData: true,
  })
}

export function useGetEventfulPopupById(id: string) {
  return useApiQuery<EventfulPopup>({
    url: `/eventful/events/${id}`,
    key: `eventful-popup-${id}`,
    selectData: true,
    refetchOnWindowFocus: true,
  })
}

export function useGetPopupInventory(popupId: string, search?: string) {
  return useApiQuery<PopupInventory[]>({
    url: `/popup-events/inventory/event/${popupId}`,
    params: search ? { search } : undefined,
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

export function useDeletePopupProducts() {
  return useMutation({
    mutationFn: (payload: { popup_event: string; uids: string[] }) =>
      baseApi.delete(`/popup-events/inventory/bulk_delete/`, { data: payload }),
  })
}

export function useGetPopupOrders(popupId: string) {
  return useApiQuery<TOrderResponse>({
    url: `/orders/?popup_event=${popupId}`,
    key: `popup-orders-${popupId}`,
    selectData: true,
  })
}

export function useCreatePopupOrder() {
  return useMutation({
    mutationFn: (body: PopupOrderPayload) => baseApi.post(`/orders/popup/`, body),
  })
}

export function useMarkPopupOrderAsPaid() {
  return useMutation({
    mutationFn: (orderId: string) => baseApi.post(`/orders/${orderId}/mark-paid/`),
  })
}

export function useRegisterForEventful() {
  return useMutation({
    mutationFn: (payload: { event: string; discount_code?: string }) =>
      baseApi.post(`/eventful/registrations/`, payload),
  })
}

export function useValidateEventfulDiscountCode() {
  return useMutation({
    mutationFn: (payload: {
      code: string
      event_uid: string
    }): Promise<{ data: { data: EventDiscountCode } }> =>
      baseApi.post(`/eventful/merchant/discounts/validate_code/`, payload),
  })
}
