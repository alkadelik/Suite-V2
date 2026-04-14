// ─── Raw Materials ─────────────────────────────────────────────────────────────

import baseApi, { TPaginatedResponse, useApiQuery } from "@/composables/baseApi"
import {
  IAdjustStockPayload,
  ICreateMaterialPayload,
  IRecipePayload,
  RawMaterialStats,
  TRawMaterial,
} from "@modules/production/types"
import { useMutation, useQuery } from "@tanstack/vue-query"
import { MaybeRefOrGetter, toValue } from "vue"
import { IRecipeStats, TRecipe } from "./types"

/** Fetch suppliers */
export function useGetSuppliers() {
  return useApiQuery<TPaginatedResponse<{ uid: string; name: string }>>({
    url: `/raw-materials/suppliers/`,
    key: `raw-materials-suppliers`,
  })
}

/** Create supplier */
export function useCreateSupplier() {
  return useMutation({
    mutationFn: (payload: { name: string }) => baseApi.post(`/raw-materials/suppliers/`, payload),
  })
}

/** Create raw material */
export function useCreateRawMaterial() {
  return useMutation({
    mutationFn: (body: ICreateMaterialPayload) => baseApi.post("/raw-materials/", body),
  })
}

/** Edit raw material */
export function useEditRawMaterial() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ICreateMaterialPayload> }) =>
      baseApi.patch(`/raw-materials/${id}/`, payload),
  })
}

/** Adjust material stock */
export function useAdjustMaterialStock() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IAdjustStockPayload }) =>
      baseApi.post(`/raw-materials/${id}/adjust-stock/`, payload),
  })
}

/** Fetch raw materials list */
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

/** search raw-material by name */
export function useSearchRawMaterial(search: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ["rawMaterials", "search", search],
    queryFn: async () => {
      const { data } = await baseApi.get<TPaginatedResponse<TRawMaterial>>(`/raw-materials/`, {
        params: {
          ...(toValue(search) ? { search: toValue(search) } : {}),
          limit: 10,
        },
      })
      return data.data
    },
    retry: false,
    refetchOnWindowFocus: false,
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

// =================================================
// ========= RECIPES API ============================

/** Fetch recipes list */
export function useGetRecipes(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useApiQuery<TPaginatedResponse<TRecipe>["data"]>({
    url: "/recipes/",
    params,
    key: "recipes",
    selectData: true,
  })
}

/** Fetch recipes statistics */
export function useGetRecipesStats() {
  return useApiQuery<IRecipeStats>({
    url: `/recipes/stats/`,
    key: `recipes-stats`,
    selectData: true,
  })
}

/** Fetch single recipe by uid */
export function useGetSingleRecipe(uid: string) {
  return useApiQuery<TRecipe>({
    url: `/recipes/${uid}/`,
    key: `recipes/${uid}`,
    selectData: true,
  })
}

/** Delete recipe */
export function useDeleteRecipe() {
  return useMutation({
    mutationFn: (uid: string) => baseApi.delete(`/recipes/${uid}/`),
  })
}

/** Update recipe partially */
export function useUpdateRecipe() {
  return useMutation({
    mutationFn: ({ uid, body }: { uid: string; body: Partial<IRecipePayload> }) =>
      baseApi.patch(`/recipes/${uid}/`, body),
  })
}

export function useCreateRecipe() {
  return useMutation({
    mutationFn: (body: IRecipePayload) => baseApi.post(`/recipes/`, body),
  })
}
