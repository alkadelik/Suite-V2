import baseApi, { TPaginatedResponse, useApiQuery } from "@/composables/baseApi"
import {
  IInvitePayload,
  TLocation,
  TLocationFormData,
  IUpdateMemberPayload,
  IStoreMembersResponse,
  IPlansResponse,
} from "./types"
import { useMutation, useQuery } from "@tanstack/vue-query"

/** Create a new store location */
export function useCreateLocation() {
  return useMutation({
    mutationFn: (payload: TLocationFormData) => baseApi.post("/stores/locations/", payload),
  })
}

/** Fetch all store locations */
export function useGetLocations() {
  return useApiQuery<TPaginatedResponse<TLocation>>({ url: "/stores/locations/" })
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
  return useQuery({
    queryKey: ["store-members"],
    queryFn: async () => {
      const { data } = await baseApi.get<IStoreMembersResponse>("/stores/members/")
      return data
    },
  })
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

/** Update authenticated user's password */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: (body: { password: string; old_password: string }) =>
      baseApi.post(`/accounts/auth/change-password/`, body),
  })
}

/** get all available plans */
export function useGetPlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data } = await baseApi.get<IPlansResponse>("/billings/plans/")
      return data
    },
  })
}

/** get subscription history */
export function useGetSubscriptionHistory() {
  return useQuery({
    queryKey: ["subscription-history"],
    queryFn: async () => {
      const { data } = await baseApi.get("/billings/subscriptions/")
      return data
    },
  })
}
