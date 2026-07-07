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
  TCustomDomain,
  IPickupSchedule,
  IUpdatePickupSchedulePayload,
} from "./types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import { IkycInfo, IUser } from "@modules/auth/types"
import { computed, toValue, type MaybeRefOrGetter, type Ref } from "vue"

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

/** get user kyc */
export function useGetAccountKyc() {
  return useApiQuery<IkycInfo>({
    url: "/accounts/kyc/",
    key: "user-kyc",
    selectData: true,
  })
}

/** Create a new store location */
export function useCreateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TLocationFormData) => baseApi.post("/stores/locations/", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-locations"] })
    },
  })
}

/** Fetch all store locations */
export function useGetLocations(enabled = true) {
  return useApiQuery<TPaginatedResponse<TLocation>["data"]>({
    url: "/stores/locations/",
    key: "store-locations",
    selectData: true,
    enabled,
  })
}

/** Fetch locations for login redirect flow (non-reactive, imperative call) */
export async function fetchLocationsForLogin(): Promise<TLocation[]> {
  const res = await baseApi.get<{ data: { results: TLocation[] } }>("/stores/locations/")
  return res.data.data.results
}

/** Delete a store location by ID */
export function useDeleteLocation() {
  return useMutation({
    mutationFn: (id: string) => baseApi.delete(`/stores/locations/${id}/`),
  })
}

/** Update a store location by ID */
export function useUpdateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<TLocation> }) =>
      baseApi.patch(`/stores/locations/${id}/`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-locations"] })
    },
  })
}

/** invite user to location */
export function useInviteUserToLocation() {
  return useMutation({
    mutationFn: (payload: IInvitePayload) => baseApi.post(`/stores/invites/`, payload),
  })
}

/** Fetch all store members */
export function useGetStoreMembers(search?: Ref<string>) {
  return useQuery({
    queryKey: ["store-members", search],
    queryFn: async () => {
      const params = search?.value ? { search: search.value } : {}
      const { data } = await baseApi.get<IStoreMembersResponse>("/stores/members/", { params })
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

/** List the store's pickup schedules — one record per day of the week (7 total). */
export function useGetPickupSchedules(enabled: MaybeRefOrGetter<boolean> = true) {
  return useApiQuery<TPaginatedResponse<IPickupSchedule>["data"]>({
    url: "/stores/pickup-schedules/",
    key: "pickup-schedules",
    selectData: true,
    enabled,
  })
}

/** Enable/disable a single day's pickup and/or update its start/end times. */
export function useUpdatePickupSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uid, body }: { uid: string; body: IUpdatePickupSchedulePayload }) =>
      baseApi.patch(`/stores/pickup-schedules/${uid}/`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pickup-schedules"] })
    },
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
    retry: false,
    refetchOnWindowFocus: false,
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

/** get current subscription */
export function useGetSubscription() {
  return useApiQuery<unknown>({
    url: "/billings/subscriptions/",
    key: "subscription",
    selectData: true,
  })
}

/** cancel subscription */
export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => baseApi.delete(`/billings/subscriptions/cancel/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-history"] })
      queryClient.invalidateQueries({ queryKey: ["user-profile"] })
      queryClient.invalidateQueries({ queryKey: ["liveStatus"] })
    },
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
      queryClient.invalidateQueries({ queryKey: ["storefront-sections"] })
    },
  })
}

export function useUpdateStorefrontSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: FormData | Record<string, unknown> }) =>
      baseApi.patch(`/storefront/sections/${id}/`, body, {
        headers: body instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
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

export function useCreateHeroCarousel() {
  return useMutation({
    mutationFn: (body: FormData) =>
      baseApi.post(`/storefront/sections/hero-carousel/`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  })
}

export function useUpdateHeroCarousel() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: FormData }) =>
      baseApi.patch(`/storefront/sections/hero-carousel/${id}/`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  })
}

export function useDeleteHeroCarousel() {
  return useMutation({
    mutationFn: (id: string) => baseApi.delete(`/storefront/sections/hero-carousel/${id}/`),
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

// --- Custom domains ---

type TCustomDomainList = {
  count: number
  next: string | null
  previous: string | null
  results: TCustomDomain[]
}

/**
 * Probe whether a storefront slug is already taken (LYW-2573). The public
 * storefront lookup returns 200 when a store owns the slug and 404 when it is
 * free — 404 is treated as a valid "available" response, not an error.
 */
export function useCheckSlugTaken(
  slug: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean>,
) {
  return useQuery({
    queryKey: computed(() => ["slug-availability", toValue(slug)]),
    queryFn: async () => {
      const { status } = await baseApi.get(`/storefront/public/slug/${toValue(slug)}/`, {
        validateStatus: (s) => s === 200 || s === 404,
      })
      return status === 200
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: computed(() => toValue(enabled)),
  })
}

/** List the store's custom domain(s) — expected to be 0 or 1. */
export function useGetCustomDomains(enabled = true) {
  return useApiQuery<TCustomDomainList>({
    url: "/storefront/custom-domain/",
    key: "custom-domains",
    selectData: true,
    enabled,
  })
}

/**
 * Retrieve / poll a single custom domain.
 * Pass `refetchInterval` (number ms, `false`, or a getter) to poll during verification.
 */
export function useGetCustomDomain(
  uid: MaybeRefOrGetter<string>,
  options?: {
    enabled?: MaybeRefOrGetter<boolean>
    refetchInterval?: number | false | (() => number | false)
  },
) {
  return useQuery<TCustomDomain>({
    queryKey: computed(() => ["custom-domain", toValue(uid)]),
    queryFn: async () => {
      const { data } = await baseApi.get(`/storefront/custom-domain/${toValue(uid)}/`)
      // API responses are wrapped in `{ data: ... }`.
      return (
        data && typeof data === "object" && "data" in data ? data.data : data
      ) as TCustomDomain
    },
    enabled:
      options?.enabled !== undefined
        ? computed(() => toValue(options.enabled))
        : computed(() => !!toValue(uid)),
    refetchInterval: options?.refetchInterval,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/** Register a custom domain. Response body: `{ data: TCustomDomain }`. */
export function useCreateCustomDomain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { domain: string }) => baseApi.post("/storefront/custom-domain/", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-domains"] })
    },
  })
}

/** Re-trigger DNS verification (also used for "Retry" / "Refresh records"). */
export function useVerifyCustomDomain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uid: string) => baseApi.post(`/storefront/custom-domain/${uid}/verify/`, {}),
    onSuccess: (_data, uid) => {
      queryClient.invalidateQueries({ queryKey: ["custom-domain", uid] })
      queryClient.invalidateQueries({ queryKey: ["custom-domains"] })
    },
  })
}

/** Disconnect (also removes the domain from Vercel). */
export function useDeleteCustomDomain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uid: string) => baseApi.delete(`/storefront/custom-domain/${uid}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-domains"] })
    },
  })
}
