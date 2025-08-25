import { useApiQuery } from "@/composables/baseApi"

/** Fetch merchant store infor */
export function useGetUserStore() {
  return useApiQuery({ url: "/stores/" })
}
