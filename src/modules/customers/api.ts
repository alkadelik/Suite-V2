import baseApi, { TApiPromise, TPaginatedResponse, useApiQuery } from "@/composables/baseApi"
import { useMutation, useQuery } from "@tanstack/vue-query"
import type { MaybeRefOrGetter, Ref } from "vue"
import { computed } from "vue"
import type {
  ICustomerFormPayload,
  ICustomersApiResponse,
  IExportPayload,
  TCustomer,
  ICustomerDetail,
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

// export function useGetCustomers() {
//   return useQuery<ICustomersApiResponse>({
//     queryKey: ["customers"],
//     queryFn: async () => {
//       const { data } = await baseApi.get<ICustomersApiResponse>("/customers/")
//       return data
//     },
//     retry: false,
//     refetchOnWindowFocus: false,
//   })
// }

/** Get customers api request */
export function useGetCustomers(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useApiQuery<ICustomersApiResponse>({
    url: "/customers/",
    params,
    key: "customers",
    // selectData: true,
  })
}

export function useGetCustomer(uid: Ref<string> | string, enabled = true) {
  return useQuery<{ data: ICustomerDetail }>({
    queryKey: ["customer", uid],
    queryFn: async () => {
      const uidValue = typeof uid === "string" ? uid : uid.value
      const { data } = await baseApi.get<{ data: ICustomerDetail }>(`/customers/${uidValue}/`)
      return data
    },
    enabled: () => {
      const uidValue = typeof uid === "string" ? uid : uid.value
      return !!uidValue && enabled
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export function useGetSingleCustomer(uid: Ref<string> | string) {
  const uidValue = computed(() => (typeof uid === "string" ? uid : uid.value))
  return useApiQuery<ICustomerDetail>({
    url: computed(() => `/customers/${uidValue.value}/`),
    key: computed(() => `customer-${uidValue.value}`),
    enabled: computed(() => !!uidValue.value && uidValue.value.trim() !== ""),
    selectData: true,
  })
}

/** Export customers api request */
export function useExportCustomers() {
  return useMutation({
    mutationFn: (payload: IExportPayload) => baseApi.post("/customers/export/", payload),
  })
}

/** Create customer address api request */
export function useCreateCustomerAddress() {
  return useMutation({
    mutationFn: ({ customer, ...others }: { customer: string; address: string }) =>
      baseApi.post(`/customers/${customer}/addresses/`, { ...others }),
  })
}

/** get customer address api request */
export function useGetCustomerAddresses(customerUid: Ref<string> | string) {
  const customerUidValue = computed(() =>
    typeof customerUid === "string" ? customerUid : customerUid.value,
  )
  return useApiQuery<TPaginatedResponse<{ uid: string; address: string }>["data"]>({
    url: computed(() => `/customers/${customerUidValue.value}/addresses/`),
    key: computed(() => `customer-${customerUidValue.value}-addresses`),
    enabled: computed(() => !!customerUidValue.value && customerUidValue.value.trim() !== ""),
    selectData: true,
  })
}
