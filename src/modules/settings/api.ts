import baseApi, { TPaginatedResponse, useApiQuery } from "@/composables/baseApi"
import {
  IInvitePayload,
  TLocation,
  TLocationFormData,
  IUpdateMemberPayload,
  IUpdateStoreDetailsPayload,
  TIndustriesResponse,
  IStoreDetails,
  IPlansResponse,
  IStoreMembersResponse,
  IPopupSettings,
  IStoreTheme,
  IThemeSettings,
  ThemeSection,
  IVersionHistory,
} from "./types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import { IkycInfo, IUser } from "@modules/auth/types"
import type { Ref } from "vue"

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

export function useUpdateAccountKyc() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<IkycInfo> }) =>
      baseApi.patch(`/accounts/kyc/${id}/`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  })
}

/** get user profile */
export function useGetAccountKyc() {
  return useApiQuery<IkycInfo>({
    url: "/accounts/kyc/",
    key: "user-kyc",
    selectData: true,
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
      const { data } = await baseApi.get("/billings/payments/subscriptions/")
      return data
    },
  })
}

/** initialize subscription */
export function useInitializeSubscription() {
  return useMutation({
    mutationFn: (uid: string) => baseApi.post(`/billings/plan/${uid}/initialize/`),
  })
}

export function useUpdatePopupSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<IPopupSettings> }) =>
      baseApi.patch(`/storefront/popup/${id}/`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["version-history"] })
    },
  })
}

export function useGetPopupSettings() {
  return useApiQuery<{ results: IPopupSettings[] }>({
    url: `/storefront/popup/`,
    key: `popup-settings`,
    selectData: true,
  })
}

export function useGetStoreThemes() {
  return useApiQuery<{ results: IStoreTheme[] }>({
    url: `/storefront/themes`,
    key: `store-themes`,
    selectData: true,
  })
}

export function useUpdateActiveTheme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => baseApi.post(`/storefront/themes/${id}/apply/`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["version-history"] })
    },
  })
}

export function useGetStorefrontSections() {
  return useApiQuery<{ results: ThemeSection[] }>({
    url: `/storefront/sections/`,
    key: `storefront-sections`,
    selectData: true,
  })
}

export function useUpdateStorefrontSectionsOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { updates: { uid: string; position: number; is_hidden?: boolean }[] }) =>
      baseApi.patch(`/storefront/sections/update-section-positions/`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["version-history"] })
    },
  })
}

export function useUpdateStorefrontSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: FormData | Record<string, unknown> }) =>
      baseApi.patch(`/storefront/sections/${id}/`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["version-history"] })
    },
  })
}

export function useCreateTestimonial() {
  return useMutation({
    mutationFn: (body: FormData) =>
      baseApi.post(`/storefront/sections/testimonials/`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  })
}

export function useUpdateTestimonial() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: FormData }) =>
      baseApi.patch(`/storefront/sections/testimonials/${id}/`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  })
}

export function useDeleteTestimonial() {
  return useMutation({
    mutationFn: (id: string) => baseApi.delete(`/storefront/sections/testimonials/${id}/`),
  })
}

export function useGetThemeSettings() {
  return useApiQuery<IThemeSettings[]>({
    url: `/storefront/`,
    key: `storefront-settings`,
    selectData: true,
  })
}

export function useUpdateThemeSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<IThemeSettings> }) =>
      baseApi.patch(`/storefront/${id}/`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["version-history"] })
    },
  })
}

export function useGetVersionHistory(storefrontUid: Ref<string> | string) {
  return useQuery<IVersionHistory[]>({
    queryKey: ["version-history", storefrontUid],
    queryFn: async () => {
      const uid = typeof storefrontUid === "string" ? storefrontUid : storefrontUid.value
      const response = await baseApi.get(`/storefront/${uid}/version-history/`)
      return response.data.data
    },
    enabled: () => {
      const uid = typeof storefrontUid === "string" ? storefrontUid : storefrontUid.value
      return !!uid
    },
  })
}
