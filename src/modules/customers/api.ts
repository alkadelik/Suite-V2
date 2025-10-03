import baseApi, { TApiPromise } from "@/composables/baseApi"
import { useMutation, useQuery } from "@tanstack/vue-query"
import type {
  ICustomerFormPayload,
  ICustomersApiResponse,
  IExportPayload,
  TCustomer,
} from "./types"

/** Create customer api request */
export function useCreateCustomer() {
  return useMutation({
    mutationFn: (body: ICustomerFormPayload): TApiPromise<TCustomer> =>
      baseApi.post("/customers/", body),
  })
}

/** Update customer api request */
export function useUpdateCustomer() {
  return useMutation({
    mutationFn: ({ uid, ...rest }: ICustomerFormPayload) =>
      baseApi.patch(`/customers/${uid}/`, rest),
  })
}

/** Delete customer api request */
export function useDeleteCustomer() {
  return useMutation({
    mutationFn: (uid: string) => baseApi.delete(`/customers/${uid}/`),
  })
}

/** Get customers api request */
export function useGetCustomers() {
  return useQuery<ICustomersApiResponse>({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data } = await baseApi.get<ICustomersApiResponse>("/customers/")
      return data
    },
  })
}

/** Export customers api request */
export function useExportCustomers() {
  return useMutation({
    mutationFn: (payload: IExportPayload) => baseApi.post("/customers/export/", payload),
  })
}
