import { useApiQuery } from "@/composables/baseApi"

/** Fetch merchant store info */
export function useGetUserStore() {
  return useApiQuery({ url: "/stores/" })
}
