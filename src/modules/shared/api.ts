import { useApiQuery } from "@/composables/baseApi"
import baseApi, { TApiPromise } from "@/composables/baseApi"
import { useMutation, useQuery } from "@tanstack/vue-query"
import {
  TCreateAccountPayload,
  TGetSupportedAccountsResponse,
  TSetupShippingPayload,
  TUpdateShippingPayload,
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
      baseApi.post("/accounts/auth/password/request-token/", body),
  })
}

/** Fetch merchant store info */
export function useGetUserStore() {
  return useApiQuery({ url: "/stores/" })
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
  return useApiQuery({ url: "/shipping/couriers/" })
}

/** Get merchant shipping profile */
export function useGetShippingProfile() {
  return useQuery({
    queryKey: ["getShippingProfile"],
    queryFn: async () => {
      const { data } = await baseApi.get("/shipping/accounts/me/")
      return data
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
