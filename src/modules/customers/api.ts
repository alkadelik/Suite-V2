import baseApi from "@/composables/baseApi"
import { useMutation, useQuery } from "@tanstack/vue-query"
import type { ICustomerFormPayload } from "./types"

/** Create customer api request */
export function useCreateCustomer() {
  return useMutation({
    mutationFn: (body: ICustomerFormPayload) => baseApi.post("/customers/", body),
  })
}

/** Update customer api request */
export function useUpdateCustomer(customerUid: string | number) {
  return useMutation({
    mutationFn: (body: ICustomerFormPayload) => baseApi.patch(`/customers/${customerUid}/`, body),
  })
}

/** Delete customer api request */
export function useDeleteCustomer(customerUid: number) {
  return useMutation({
    mutationFn: () => baseApi.delete(`/customers/${customerUid}/`),
  })
}

/** Get customers api request */
export function useGetCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => baseApi.get("/customers/"),
  })
}
