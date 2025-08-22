import baseApi, { useApiMutation, useApiQuery } from "@/composables/baseApi"
import { TLocation } from "./types"
import { useMutation } from "@tanstack/vue-query"

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
  const mutation = useApiMutation({ url: "/stores/locations/", method: "patch" })

  return {
    ...mutation,
    mutate: ({ id, body }: { id: string; body: Partial<TLocation> }) => {
      return mutation.mutate({ url: `/stores/locations/${id}/`, body })
    },
    mutateAsync: async ({ id, body }: { id: string; body: Partial<TLocation> }) => {
      return mutation.mutateAsync({ url: `/stores/locations/${id}/`, body })
    },
  }
}

export function useResetPassword() {
  return useMutation({
    mutationKey: ["resetPassword"],
    mutationFn: (payload) => baseApi.post("/auth/reset-password/", payload),
  })
}
