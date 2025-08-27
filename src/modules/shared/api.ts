import { useApiQuery } from "@/composables/baseApi"
import baseApi, { TApiPromise } from "@/composables/baseApi"
import { useMutation, useQuery } from "@tanstack/vue-query"
import { TCreateAccountPayload, TGetSupportedAccountsResponse } from "./types"

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
