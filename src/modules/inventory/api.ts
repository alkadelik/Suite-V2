import baseApi from "@/composables/baseApi"
import { useMutation, useQuery } from "@tanstack/vue-query"
import {
  IProductCategoryFormPayload,
  IProductFormPayload,
  IProductAttributeFormPayload,
  IProductAttributeValuePayload,
  IProductImageUploadPayload,
  IGetProductResponse,
  IAddStockPayload,
  IReduceStockPayload,
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

/** add product image api request */
export function useAddProductImage() {
  return useMutation({
    mutationFn: (payload: IProductImageUploadPayload) => {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("product", payload.product)
      formData.append("image", payload.image)

      if (payload.alt_text) {
        formData.append("alt_text", payload.alt_text)
      }

      if (payload.is_primary !== undefined) {
        formData.append("is_primary", payload.is_primary.toString())
      }

      if (payload.sort_order !== undefined) {
        formData.append("sort_order", payload.sort_order.toString())
      }

      // Override content type for file upload
      return baseApi.post("inventory/images/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    },
  })
}

/** get product by uid */
export function useGetProduct(uid: string) {
  return useQuery({
    queryKey: ["products", uid],
    queryFn: async () => {
      const { data } = await baseApi.get<IGetProductResponse>(`/inventory/products/${uid}/`)
      return data
    },
  })
}

/** add stock to variant */
export function useAddStock() {
  return useMutation({
    mutationFn: ({ uid, ...payload }: IAddStockPayload & { uid: string }) =>
      baseApi.post(`/inventory/variants/${uid}/add-stock/`, payload),
  })
}

/** reduce stock from variant */
export function useReduceStock() {
  return useMutation({
    mutationFn: ({ uid, ...payload }: IReduceStockPayload & { uid: string }) =>
      baseApi.post(`/inventory/variants/${uid}/record-loss/`, payload),
  })
}
