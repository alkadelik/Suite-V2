import baseApi from "@/composables/baseApi"
import { useMutation, useQuery } from "@tanstack/vue-query"
import { toValue, type MaybeRefOrGetter } from "vue"
import type {
  ICouponPayload,
  TCouponUsageStats,
  IDiscountPayload,
  IDiscountUpdatePayload,
} from "./types"

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

/** PATCH /coupons/{uid}/ — partial update (PatchedCouponCreate; every field optional). */
export function useUpdateCoupon() {
  return useMutation({
    mutationFn: ({ uid, ...body }: Partial<ICouponPayload> & { uid: string }) =>
      baseApi.patch(`/coupons/${uid}/`, body),
  })
}

/** Enable/disable a coupon via PATCH is_active. */
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

// ============================================================================
// DISCOUNTS — `/api/v2/discounts/` endpoints.
// List supports server-side filters (status, target_type, discount_type,
// is_enabled, is_applied) plus search/ordering/limit/offset. Create accepts
// variants[] (products), categories[] (categories), or neither (storefront).
// PATCH is limited to name/end_at/is_enabled; POST {id}/toggle/ flips enabled.
// ============================================================================
export function useGetDiscounts(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useQuery({
    queryKey: ["discounts", params],
    queryFn: async () => {
      const { data } = await baseApi.get("/discounts/", params ? { params: toValue(params) } : {})
      return data
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export function useGetDiscount(
  uid: MaybeRefOrGetter<string>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) {
  return useQuery({
    queryKey: ["discounts", uid],
    queryFn: async () => {
      const { data } = await baseApi.get(`/discounts/${toValue(uid)}/`)
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

export function useCreateDiscount() {
  return useMutation({
    mutationFn: (body: IDiscountPayload) => baseApi.post("/discounts/", body),
  })
}

// PATCH only accepts name / end_at / is_enabled (type/value/targeting are immutable).
export function useUpdateDiscount() {
  return useMutation({
    mutationFn: ({ uid, ...body }: IDiscountUpdatePayload & { uid: string }) =>
      baseApi.patch(`/discounts/${uid}/`, body),
  })
}

// Toggle enabled/disabled — POST {id}/toggle/ flips the current state (no body).
export function useToggleDiscount() {
  return useMutation({
    mutationFn: ({ uid }: { uid: string }) => baseApi.post(`/discounts/${uid}/toggle/`, {}),
  })
}

export function useDeleteDiscount() {
  return useMutation({
    mutationFn: (uid: string) => baseApi.delete(`/discounts/${uid}/`),
  })
}
