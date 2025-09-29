import baseApi from "@/composables/baseApi"
import { useMutation, useQuery } from "@tanstack/vue-query"
import {
  IProductCategoryFormPayload,
  IProductFormPayload,
  IProductAttributeFormPayload,
  IProductAttributeValuePayload,
} from "./types"

/** Get categories api request */
export function useGetCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await baseApi.get("/inventory/categories/")
      return data
    },
  })
}

/** Create category api request */
export function useCreateCategory() {
  return useMutation({
    mutationFn: (body: IProductCategoryFormPayload) => baseApi.post("inventory/categories/", body),
  })
}

/** Create product api request */
export function useCreateProduct() {
  return useMutation({
    mutationFn: (body: IProductFormPayload) => baseApi.post("inventory/products/", body),
  })
}

/** get products api request */
export function useGetProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await baseApi.get("/inventory/products/")
      return data
    },
  })
}

/** delete product api request */
export function useDeleteProduct() {
  return useMutation({
    mutationFn: (uid: string) => baseApi.delete(`inventory/products/${uid}/`),
  })
}

/** get attributes api request */
export function useGetAttributes() {
  return useQuery({
    queryKey: ["attributes"],
    queryFn: async () => {
      const { data } = await baseApi.get("/inventory/attributes/")
      return data
    },
  })
}

/** create attributes api request */
export function useCreateAttribute() {
  return useMutation({
    mutationFn: (body: IProductAttributeFormPayload) => baseApi.post("inventory/attributes/", body),
  })
}

/** get values api request */
export function useGetAttributeValues(attributeUid: string) {
  return useQuery({
    queryKey: ["attributes", attributeUid, "values"],
    queryFn: async () => {
      const { data } = await baseApi.get(`/inventory/attributes/${attributeUid}/values/`)
      return data
    },
  })
}

/** create attribute values api request */
export function useCreateAttributeValues() {
  return useMutation({
    mutationFn: ({
      attributeUid,
      ...payload
    }: IProductAttributeValuePayload & { attributeUid: string }) =>
      baseApi.post(`inventory/attributes/${attributeUid}/add-value/`, payload),
  })
}
