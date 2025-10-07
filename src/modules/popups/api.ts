import baseApi, { useApiQuery } from "@/composables/baseApi"
import { PopupEvent, PopupEventResponse } from "./types"
import { useMutation } from "@tanstack/vue-query"

/** Create popup api request */
export function useCreatePopup() {
  return useMutation({
    mutationFn: (body: FormData) =>
      baseApi.post("/popup-events/popup-events/", body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  })
}

/** Update popup api request */
export function useUpdatePopup() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: FormData }) =>
      baseApi.patch(`/popup-events/popup-events/${id}/`, body),
  })
}

export function useGetPopupEvents() {
  return useApiQuery<PopupEventResponse>({
    url: "/popup-events/popup-events",
    key: "popups",
    selectData: true,
  })
}

export function useGetPopupEventById(id: string) {
  return useApiQuery<PopupEvent>({
    url: `/popup-events/popup-events/${id}`,
    key: `popup-${id}`,
    selectData: true,
  })
}

export function useDeletePopupEvent() {
  return useMutation({
    mutationFn: (id: string) => baseApi.delete(`/popup-events/popup-events/${id}/`),
  })
}
