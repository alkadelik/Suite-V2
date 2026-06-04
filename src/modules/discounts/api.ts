import baseApi from "@/composables/baseApi"
import { useMutation, useQuery } from "@tanstack/vue-query"
import { toValue, type MaybeRefOrGetter } from "vue"
import type { ICouponPayload, TCouponUsageStats } from "./types"

/** List coupons (search, ordering, limit, offset). Returns the raw response body. */
export function useGetCoupons(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useQuery({
    queryKey: ["coupons", params],
    queryFn: async () => {
      const { data } = await baseApi.get("/coupons/", params ? { params: toValue(params) } : {})
      return data
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/** Retrieve one coupon. */
export function useGetCoupon(
  uid: MaybeRefOrGetter<string>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) {
  return useQuery({
    queryKey: ["coupons", uid],
    queryFn: async () => {
      const { data } = await baseApi.get(`/coupons/${toValue(uid)}/`)
      return data
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: () => {
      const u = toValue(uid)
      const e = options?.enabled ? toValue(options.enabled) : true
      return !!u && e
    },
  })
}

/** Usage statistics for the details gauge (shape ASSUMED). */
export function useGetCouponUsage(uid: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ["coupon-usage", uid],
    queryFn: async () => {
      const { data } = await baseApi.get<TCouponUsageStats>(`/coupons/${toValue(uid)}/usage/`)
      return data
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: () => !!toValue(uid),
  })
}

export function useCreateCoupon() {
  return useMutation({
    mutationFn: (body: ICouponPayload) => baseApi.post("/coupons/", body),
  })
}

/** ASSUMED: PATCH /coupons/{uid}/ */
export function useUpdateCoupon() {
  return useMutation({
    mutationFn: ({ uid, ...body }: Partial<ICouponPayload> & { uid: string }) =>
      baseApi.patch(`/coupons/${uid}/`, body),
  })
}

/** ASSUMED: toggle is_active */
export function useToggleCoupon() {
  return useMutation({
    mutationFn: ({ uid, is_active }: { uid: string; is_active: boolean }) =>
      baseApi.patch(`/coupons/${uid}/`, { is_active }),
  })
}

export function useDeleteCoupon() {
  return useMutation({
    mutationFn: (uid: string) => baseApi.delete(`/coupons/${uid}/`),
  })
}
