import { RawMaterialStats, TRawMaterial } from "./types"
import baseApi, { TApiPromise, TPaginatedResponse, useApiQuery } from "@/composables/baseApi"
import { MaybeRefOrGetter } from "vue"
import { useMutation } from "@tanstack/vue-query"

/** Fetch suppliers */
export function useGetSuppliers() {
  return useApiQuery<TPaginatedResponse<{ uid: string; name: string }>>({
    url: `/production/suppliers/`,
    key: `production-suppliers`,
  })
}

/** Create supplier api request */
export function useCreateSupplier() {
  return useMutation({
    mutationFn: (payload: { name: string }) => baseApi.post(`/production/suppliers/`, payload),
  })
}

/** Create raw material api request */
export function useCreateRawMaterial() {
  return useMutation({
    mutationFn: (body: FormData) =>
      baseApi.post("/production/raw-materials/", body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  })
}

/** Edit raw material api request */
export function useEditRawMaterial() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) =>
      baseApi.patch(`/production/raw-materials/${id}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  })
}

/** Fetch raw materials */
export function useGetRawMaterials(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useApiQuery<TPaginatedResponse<TRawMaterial>["data"]>({
    url: "/production/raw-materials/",
    params,
    key: "raw-materials",
    selectData: true,
  })
}

/** Fetch raw materials statistics */
export function useGetRawMaterialsStats() {
  return useApiQuery<RawMaterialStats>({
    url: `/production/raw-materials/stats/`,
    key: `raw-materials-stats`,
    selectData: true,
  })
}

/** Fetch single raw material by ID */
export function useGetSingleRawMaterial(id: string) {
  return useApiQuery<TApiPromise<TRawMaterial>>({
    url: `/production/raw-materials/${id}/`,
    key: `raw-materials/${id}`,
    selectData: true,
  })
}
