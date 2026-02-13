import baseApi, { TPaginatedResponse, useApiQuery } from "@/composables/baseApi"
import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/vue-query"
import { toValue, type MaybeRefOrGetter } from "vue"
import {
  IProductCategoryFormPayload,
  IProductFormPayload,
  IProductAttributeFormPayload,
  IAttributeValueItem,
  IProductImageUploadPayload,
  IProductImageUpdatePayload,
  IGetProductResponse,
  IAddStockPayload,
  IReduceStockPayload,
  IInventoryMovementsApiResponse,
  IStockTransferPayload,
  IProductCatalogue,
  IProductVariant,
  IInventoryTransferRequestsApiResponse,
  IApproveRejectRequestPayload,
  IBulkVariantPayload,
  IProductStats,
} from "./types"

/** Get categories api request */
export function useGetCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await baseApi.get("/inventory/categories/")
      return data
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/** Create category api request */
export function useCreateCategory() {
  return useMutation({
    mutationFn: (body: IProductCategoryFormPayload) => baseApi.post("inventory/categories/", body),
  })
}

/** Update category images - bulk api request */
export function useUpdateBulkCategoryImages() {
  return useMutation({
    mutationFn: (body: FormData) =>
      baseApi.post("inventory/categories/update-images/", body, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  })
}

/** Create product api request */
export function useCreateProduct() {
  return useMutation({
    mutationFn: (body: IProductFormPayload) => baseApi.post("inventory/products/", body),
  })
}

/** Update product api request */
export function useUpdateProduct() {
  return useMutation({
    mutationFn: ({ uid, ...body }: Partial<IProductFormPayload> & { uid: string }) =>
      baseApi.patch(`inventory/products/${uid}/`, body),
  })
}

/** Update variant api request */
export function useUpdateVariant() {
  return useMutation({
    mutationFn: ({ uid, ...body }: Partial<IProductVariant> & { uid: string }) =>
      baseApi.patch(`inventory/variants/${uid}/`, body),
  })
}

/** Bulk update variants */
export function useBulkUpdateVariants() {
  return useMutation({
    mutationFn: (payload: { variants: Array<Partial<IProductVariant> & { uid: string }> }) =>
      baseApi.post(`inventory/variants/bulk-update/`, payload),
  })
}

/** Bulk variant operations (add and delete variants) */
export function useBulkVariantOperations() {
  return useMutation({
    mutationFn: ({ productUid, ...payload }: IBulkVariantPayload & { productUid: string }) =>
      baseApi.post(`inventory/products/${productUid}/bulk-variants/`, payload),
  })
}

/** Update variant image */
export function useUpdateVariantImage() {
  return useMutation({
    mutationFn: ({ variantUid, image }: { variantUid: string; image: File }) => {
      const formData = new FormData()
      formData.append("image", image)

      return baseApi.post(`inventory/variants/${variantUid}/update-image/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    },
  })
}

/** get products api request */
export function useGetProducts(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const { data } = await baseApi.get(
        "/inventory/products/",
        params ? { params: toValue(params) } : {},
      )
      return data
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/** Fetch order statistics */
export function useGetProductDashboard() {
  return useApiQuery<IProductStats>({
    url: `/inventory/products/dashboard/`,
    key: `products-dashboard`,
    selectData: true,
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
    retry: false,
    refetchOnWindowFocus: false,
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
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export function useCreateAttributeValues() {
  return useMutation({
    mutationFn: (payload: { attributeUid: string; values: IAttributeValueItem[] }) => {
      return baseApi.post(`inventory/attributes/${payload.attributeUid}/add-value/`, payload.values)
    },
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

/** update product image api request */
export function useUpdateProductImage() {
  return useMutation({
    mutationFn: ({ uid, ...payload }: IProductImageUpdatePayload & { uid: string }) =>
      baseApi.patch(`inventory/images/${uid}/`, payload),
  })
}

/** delete product image api request */
export function useDeleteProductImage() {
  return useMutation({
    mutationFn: (uid: string) => baseApi.delete(`inventory/images/${uid}/`),
  })
}

/** get product by uid */
export function useGetProduct(
  uid: MaybeRefOrGetter<string>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) {
  return useQuery({
    queryKey: ["products", uid],
    queryFn: async () => {
      const uidValue = toValue(uid)
      const { data } = await baseApi.get<IGetProductResponse>(`/inventory/products/${uidValue}/`)
      return data
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: () => {
      const uidValue = toValue(uid)
      const enabledValue = options?.enabled ? toValue(options.enabled) : true
      return !!uidValue && enabledValue
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

/** get inventory movements */
export function useGetInventoryMovements(
  params?: MaybeRefOrGetter<Record<string, string | number> | undefined>,
) {
  return useQuery({
    queryKey: ["inventory-movements", params],
    queryFn: async () => {
      const { data } = await baseApi.get<IInventoryMovementsApiResponse>("/inventory/movements/", {
        params: toValue(params),
      })
      return data
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/** get product movements */
export function useGetProductMovements(productUid: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ["product-movements", productUid],
    queryFn: async () => {
      const uid = toValue(productUid)
      const { data } = await baseApi.get<IInventoryMovementsApiResponse>(
        `/inventory/products/${uid}/movements/`,
      )
      return data
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/** direct stock transfer */
export function useDirectStockTransfer() {
  return useMutation({
    mutationFn: (payload: IStockTransferPayload) =>
      baseApi.post("/inventory/transfers/direct-transfer/", payload),
  })
}

/** request stock transfer */
export function useRequestStockTransfer() {
  return useMutation({
    mutationFn: (payload: IStockTransferPayload) => baseApi.post("/inventory/transfers/", payload),
  })
}

export function useGetProductCatalogs() {
  return useApiQuery<TPaginatedResponse<IProductCatalogue>["data"]>({
    url: `/inventory/catalog/`,
    key: "productCatalogs",
    selectData: true,
  })
}

/** Get product catalogs with infinite scroll */
export function useGetProductCatalogsInfinite(limit = 20) {
  return useInfiniteQuery({
    queryKey: ["productCatalogsInfinite", limit],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await baseApi.get<TPaginatedResponse<IProductCatalogue>>(
        `/inventory/catalog/`,
        {
          params: {
            limit,
            offset: pageParam,
          },
        },
      )
      return data.data
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, page) => sum + page.results.length, 0)
      if (lastPage.next && totalFetched < lastPage.count) {
        return totalFetched
      }
      return undefined
    },
    initialPageParam: 0,
  })
}

export function useGetProductVariants() {
  return useApiQuery<TPaginatedResponse<IProductVariant>["data"]>({
    url: `/inventory/variants/`,
    key: "productVariants",
    selectData: true,
  })
}

/** get inventory transfer requests (for HQ to view pending requests) */
export function useGetTransferRequests(params?: MaybeRefOrGetter<Record<string, string | number>>) {
  return useQuery({
    queryKey: ["transfer-requests", params],
    queryFn: async () => {
      const paramsValue = toValue(params)
      const { data } = await baseApi.get<IInventoryTransferRequestsApiResponse>(
        "/inventory/transfers/",
        {
          params: paramsValue,
        },
      )
      return data
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/** approve or reject transfer requests */
export function useApproveRejectRequest() {
  return useMutation({
    mutationFn: (payload: IApproveRejectRequestPayload) =>
      baseApi.post("/inventory/transfers/approve/", payload),
  })
}
