import baseApi, { useApiQuery } from "@/composables/baseApi"
import { TLocation, TLocationFormData } from "./types"
import { useMutation } from "@tanstack/vue-query"

/** Create a new store location */
export function useCreateLocation() {
  return useMutation({
    mutationFn: (payload: TLocationFormData) => baseApi.post("/stores/locations/", payload),
  })
}

/** Fetch all store locations */
export function useGetLocations() {
  return useApiQuery({ url: "/stores/locations/" })
}

/** Delete a store location by ID */
export function useDeleteLocation() {
  return useMutation({
    mutationFn: (id: string) => baseApi.delete(`/stores/locations/${id}/`),
  })
}

/** Update a store location by ID */
export function useUpdateLocation() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<TLocation> }) =>
      baseApi.patch(`/stores/locations/${id}/`, body),
  })
}
