import baseApi, { useApiQuery } from "@/composables/baseApi"
import { IInvitePayload, TLocation, TLocationFormData, IUpdateMemberPayload } from "./types"
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

/** invite user to location */
export function useInviteUserToLocation() {
  return useMutation({
    mutationFn: (payload: IInvitePayload) => baseApi.post(`/stores/invites/`, payload),
  })
}

/** Fetch all store members */
export function useGetStoreMembers() {
  return useApiQuery({ url: "/stores/members/" })
}

/** Update member roles and locations */
export function useUpdateMember() {
  return useMutation({
    mutationFn: ({ uid, ...payload }: IUpdateMemberPayload) =>
      baseApi.patch(`/stores/members/${uid}/`, payload),
  })
}

/** suspend member */
export function useSuspendMember() {
  return useMutation({
    mutationFn: ({ uid }: { uid: string }) =>
      baseApi.patch(`/stores/members/${uid}/toggle_suspension/`),
  })
}
