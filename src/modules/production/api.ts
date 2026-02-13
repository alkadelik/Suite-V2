import { ICreateMaterialPayload, RawMaterialStats, TRawMaterial } from "./types"
import baseApi, { TPaginatedResponse, useApiQuery } from "@/composables/baseApi"
import { MaybeRefOrGetter } from "vue"
import { useMutation } from "@tanstack/vue-query"

/** Fetch suppliers */
export function useGetSuppliers() {
  return useApiQuery<TPaginatedResponse<{ uid: string; name: string }>>({
    url: `/raw-materials/suppliers/`,
    key: `raw-materials-suppliers`,
  })
}

/** Create supplier api request */
export function useCreateSupplier() {
  return useMutation({
    mutationFn: (payload: { name: string }) => baseApi.post(`/raw-materials/suppliers/`, payload),
  })
}

/** Create raw material api request */
export function useCreateRawMaterial() {
  return useMutation({
    mutationFn: (body: ICreateMaterialPayload) => baseApi.post("/raw-materials/", body),
  })
}

/** Edit raw material api request */
export function useEditRawMaterial() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ICreateMaterialPayload> }) =>
      baseApi.patch(`/raw-materials/${id}/`, payload),
  })
}

/** Adjust material stock */
export function useAdjustMaterialStock() {
  return useMutation({
    mutationFn: (payload: {
      material_id: string
      adjustment_type: string
      quantity: number
      reason: string
      notes?: string
    }) => baseApi.post(`/raw-materials/${payload.material_id}/adjust-stock/`, payload),
  })
}

/** Fetch raw materials */
export function useGetRawMaterials(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useApiQuery<TPaginatedResponse<TRawMaterial>["data"]>({
    url: "/raw-materials/",
    params,
    key: "raw-materials",
    selectData: true,
  })
}

/** Fetch raw materials statistics */
export function useGetRawMaterialsStats() {
  return useApiQuery<RawMaterialStats>({
    url: `/raw-materials/dashboard/`,
    key: `raw-materials-stats`,
    selectData: true,
  })
}

/** Fetch single raw material by ID */
export function useGetSingleRawMaterial(id: string) {
  return useApiQuery<TRawMaterial>({
    url: `/raw-materials/${id}/`,
    key: `raw-materials/${id}`,
    selectData: true,
  })
}
