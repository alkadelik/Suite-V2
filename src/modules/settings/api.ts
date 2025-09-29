import baseApi, { TPaginatedResponse, useApiQuery } from "@/composables/baseApi"
import {
  IInvitePayload,
  TLocation,
  TLocationFormData,
  IUpdateMemberPayload,
  IUpdateStoreDetailsPayload,
  TIndustriesResponse,
  IStoreDetails,
} from "./types"
import { useMutation } from "@tanstack/vue-query"
import { IUser } from "@modules/auth/types"

/** get user profile */
export function useGetProfile() {
  return useApiQuery<IUser>({
    url: "/accounts/profile/",
    key: "user-profile",
    selectData: true,
  })
}

/** Create a new store location */
export function useUpdateProfile() {
  return useMutation({
    mutationFn: (payload: Partial<IUser>) =>
      baseApi.patch("/accounts/profile/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  })
}

/** Create a new store location */
export function useCreateLocation() {
  return useMutation({
    mutationFn: (payload: TLocationFormData) => baseApi.post("/stores/locations/", payload),
  })
}

/** Fetch all store locations */
export function useGetLocations() {
  return useApiQuery<TPaginatedResponse<TLocation>["data"]>({
    url: "/stores/locations/",
    key: "store-locations",
    selectData: true,
  })
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
  return useApiQuery({ url: "/stores/members/", key: "store-members" })
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

export function useGetStoreDetails(uid: string) {
  return useApiQuery<IStoreDetails>({
    url: `/stores/${uid}/`,
    key: `get-store-details_${uid}`,
    selectData: true,
  })
}

export function useUpdateStoreDetails() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: IUpdateStoreDetailsPayload }) =>
      baseApi.patch(`/stores/${id}/`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  })
}

export function useGetStoreIndustries() {
  return useApiQuery<TIndustriesResponse>({
    url: "/stores/industries/",
    key: "get-store-industries",
    selectData: true,
  })
}
