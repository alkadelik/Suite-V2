import { useApiMutation, useApiQuery } from "@/composables/baseApi"

/** Create a new store location */
export function useCreateLocation() {
  return useApiMutation({ url: "/stores/locations/" })
}

/** Fetch all store locations */
export function useGetLocations() {
  return useApiQuery({ url: "/stores/locations/" })
}

/** Delete a store location by ID */
export function useDeleteLocation() {
  return (id: string) => useApiMutation({ url: `/stores/locations/${id}/`, method: "delete" })
}

/** Update a store location by ID */
export function useUpdateLocation() {
  return (id: string) => useApiMutation({ url: `/stores/locations/${id}/`, method: "patch" })
}
