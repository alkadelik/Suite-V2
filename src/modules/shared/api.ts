import baseApi, { TApiPromise, useApiQuery } from "@/composables/baseApi"
import { useMutation, useQuery } from "@tanstack/vue-query"
import {
  IRolesApiResponse,
  TCreateAccountPayload,
  TGetSupportedAccountsResponse,
  TSetupShippingPayload,
  TUpdateShippingPayload,
  ILiveStatusResponse,
  INotificationsResponse,
  ICouriersResponse,
  IShippingProfileResponse,
  ISettlementBank,
  IDeliveryOption,
  IDeliveryOptionsResponse,
  TCreateDeliveryOptionPayload,
  TUpdateDeliveryOptionPayload,
} from "./types"
import { IIndustriesApiResponse } from "./types"

/** Create bank account  */
export function useCreateBankAccount() {
  return useMutation({
    mutationKey: ["createBankAccount"],
    mutationFn: (body: TCreateAccountPayload): TApiPromise<unknown> =>
      baseApi.post("/billings/settlements/", body),
  })
}

/** Get supported banks  */
export function useGetSupportedBanks() {
  return useQuery({
    queryKey: ["supportedBanks"],
    queryFn: (): TApiPromise<TGetSupportedAccountsResponse> => baseApi.get("/billings/banks/"),
  })
}

/** Resolve bank account details */
export function useResolveBankAccount() {
  return useMutation({
    mutationKey: ["resolveBankAccount"],
    mutationFn: (body: { account_number: string; bank_code: string }) =>
      baseApi.post("/billings/account-verification/verify/", body),
  })
}

/** Get settlement banks  */
export function useGetSettlementBank() {
  return useApiQuery<ISettlementBank[]>({
    key: "settlementBanks",
    url: "/billings/settlements/",
    selectData: true,
  })
}

/** Fetch merchant shipping info */
export function useSetupShippingProfile() {
  return useMutation({
    mutationKey: ["setupShippingProfile"],
    mutationFn: (body: TSetupShippingPayload) => baseApi.post("/shipping/accounts/setup/", body),
  })
}

/** Update merchant shipping info */
export function useUpdateShippingProfile() {
  return useMutation({
    mutationFn: (body: TUpdateShippingPayload) => baseApi.patch("/shipping/accounts/update/", body),
  })
}

/** Get merchant shipping couriers options */
export function useGetCouriers() {
  return useQuery({
    queryKey: ["couriers"],
    queryFn: async () => {
      const res = await baseApi.get<ICouriersResponse>("/shipping/couriers/")
      return res.data.data.results
    },
  })
}

/** Get merchant shipping profile */
export function useGetShippingProfile() {
  return useQuery({
    queryKey: ["getShippingProfile"],
    queryFn: async () => {
      const res = await baseApi.get<IShippingProfileResponse>("/shipping/accounts/me/")
      return res.data.data
    },
    staleTime: Infinity, // Never considered stale
    retry: false, // Do not retry on failure
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Don't refetch on mount
    refetchOnReconnect: false, // Don't refetch on reconnect
    enabled: true, // Still run once on initial mount
  })
}

/** Get store industries */
export function useGetStoreIndustries() {
  return useQuery<IIndustriesApiResponse>({
    queryKey: ["industries"],
    queryFn: async () => {
      const res = await baseApi.get<IIndustriesApiResponse>("/stores/industries/")
      return res.data
    },
  })
}

/** Get stores */
export function useGetStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const res = await baseApi.get("/stores/")
      return res.data
    },
  })
}

/** Get user roles */
export function useGetRoles() {
  return useQuery<IRolesApiResponse>({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await baseApi.get<IRolesApiResponse>("/accounts/auth/roles/")
      return res.data
    },
  })
}

/** Get live status for store */
export function useGetLiveStatus(slug: string) {
  return useQuery<ILiveStatusResponse>({
    queryKey: ["liveStatus", slug],
    queryFn: async () => {
      const res = await baseApi.get<ILiveStatusResponse>(`/stores/public/live-status/${slug}/`)
      return res.data
    },
    enabled: !!slug,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/** Fetch live status for login redirect flow (non-reactive, imperative call) */
export async function fetchLiveStatusForLogin(slug: string): Promise<ILiveStatusResponse> {
  const res = await baseApi.get<ILiveStatusResponse>(`/stores/public/live-status/${slug}/`)
  return res.data
}

/** Submit KYC verification */
export function useSubmitKYC() {
  return useMutation({
    mutationFn: (body: FormData) =>
      baseApi.post("/accounts/kyc/", body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  })
}

/** Get notifications */
export function useGetNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await baseApi.get<INotificationsResponse>("/notifications/")
      return res.data.data
    },
    refetchOnWindowFocus: false,
  })
}

/** Mark all notifications as read */
export function useMarkAllNotificationsRead() {
  return useMutation({
    mutationFn: () => baseApi.post("/notifications/mark-all-read/"),
  })
}

/** Mark a specific notification as read */
export function useMarkNotificationAsRead() {
  return useMutation({
    mutationFn: (uid: string) => baseApi.post(`/notifications/${uid}/mark-read/`),
  })
}

/** Clear all notifications */
export function useClearNotifications() {
  return useMutation({
    mutationFn: () => baseApi.post("/notifications/clear/"),
  })
}

/** Get shipping rates */
export function useGetShippingRates() {
  return useMutation({
    mutationFn: (body: {
      delivery_address: string
      customer_name: string
      customer_email: string
      customer_phone: string
      items: Array<{
        variant: string
        quantity: number
      }>
    }) => baseApi.post("/shipping/rates/", body),
  })
}

/** Get manual delivery options */
export function useGetManualDeliveryOptions() {
  return useQuery({
    queryKey: ["manualDeliveryOptions"],
    queryFn: async () => {
      const res = await baseApi.get<IDeliveryOptionsResponse>("/shipping/options/manual/")
      return res.data.data
    },
    refetchOnWindowFocus: false,
  })
}

/** Create manual delivery option */
export function useCreateManualDeliveryOption() {
  return useMutation({
    mutationKey: ["createManualDeliveryOption"],
    mutationFn: (body: TCreateDeliveryOptionPayload) =>
      baseApi.post<{ data: IDeliveryOption }>("/shipping/options/manual/", body),
  })
}

/** Update manual delivery option */
export function useUpdateManualDeliveryOption() {
  return useMutation({
    mutationKey: ["updateManualDeliveryOption"],
    mutationFn: ({ uid, body }: { uid: string; body: TUpdateDeliveryOptionPayload }) =>
      baseApi.patch<{ data: IDeliveryOption }>(`/shipping/options/manual/${uid}/`, body),
  })
}

/** Delete manual delivery option */
export function useDeleteManualDeliveryOption() {
  return useMutation({
    mutationKey: ["deleteManualDeliveryOption"],
    mutationFn: (uid: string) => baseApi.delete<void>(`/shipping/options/manual/${uid}/`),
  })
}

/** Get express delivery options */
export function useGetExpressDeliveryOptions() {
  return useQuery({
    queryKey: ["expressDeliveryOptions"],
    queryFn: async () => {
      const res = await baseApi.get<IDeliveryOptionsResponse>("/shipping/options/express/")
      return res.data.data
    },
    refetchOnWindowFocus: false,
  })
}

/** Create express delivery option */
export function useCreateExpressDeliveryOption() {
  return useMutation({
    mutationKey: ["createExpressDeliveryOption"],
    mutationFn: (body: TCreateDeliveryOptionPayload) =>
      baseApi.post<{ data: IDeliveryOption }>("/shipping/options/express/", body),
  })
}

/** Update express delivery option */
export function useUpdateExpressDeliveryOption() {
  return useMutation({
    mutationKey: ["updateExpressDeliveryOption"],
    mutationFn: ({ uid, body }: { uid: string; body: TUpdateDeliveryOptionPayload }) =>
      baseApi.patch<{ data: IDeliveryOption }>(`/shipping/options/express/${uid}/`, body),
  })
}

/** Delete express delivery option */
export function useDeleteExpressDeliveryOption() {
  return useMutation({
    mutationKey: ["deleteExpressDeliveryOption"],
    mutationFn: (uid: string) => baseApi.delete<void>(`/shipping/options/express/${uid}/`),
  })
}
