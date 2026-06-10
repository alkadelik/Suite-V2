import baseApi, { TPaginatedResponse } from "@/composables/baseApi"
import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/vue-query"
import { computed, toValue, type MaybeRefOrGetter, type Ref } from "vue"
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
  IProductCategory,
  IProductVariantDetails,
} from "./types"
import { inventoryKeys } from "./queryKeys"

/** Get categories api request */
export function useGetCategories() {
  return useQuery<TPaginatedResponse<IProductCategory>>({
    queryKey: inventoryKeys.categories.list(),
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
    queryKey: computed(() => inventoryKeys.products.list(toValue(params))),
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

/** search inventory products */
export function useSearchProducts(query: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => inventoryKeys.products.search(toValue(query))),
    queryFn: async () => {
      const search = toValue(query)
      const { data } = await baseApi.get<TPaginatedResponse<IProductCatalogue>>(
        `/inventory/products/`,
        { params: { ...(search ? { search } : {}), limit: 20 } },
      )
      return data.data
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export function useGetProductDashboard() {
  return useQuery({
    queryKey: inventoryKeys.products.dashboard(),
    queryFn: async () => {
      const { data } = await baseApi.get<{ data: IProductStats }>("/inventory/products/dashboard/")
      return data.data
    },
    retry: false,
    refetchOnWindowFocus: false,
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
    queryKey: inventoryKeys.attributes.list(),
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
    queryKey: inventoryKeys.attributes.values(attributeUid),
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
    queryKey: computed(() => inventoryKeys.products.detail(toValue(uid))),
    // Derive the uid from the (immutable) query key rather than the live ref.
    // A forced refetch (e.g. an inventoryCache invalidation) can run after the
    // ref has been reset to "" by a closing drawer; reading the key keeps the
    // request URL consistent with the cache entry and avoids `/products//` 404s.
    queryFn: async ({ queryKey }) => {
      const uidValue = String(queryKey[queryKey.length - 1] ?? "")
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
    queryKey: computed(() => inventoryKeys.movements.list(toValue(params))),
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
export function useGetProductMovements(
  productUid: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<Record<string, string | number> | undefined>,
) {
  return useQuery({
    queryKey: computed(() =>
      inventoryKeys.movements.byProduct(toValue(productUid), toValue(params)),
    ),
    queryFn: async () => {
      const uid = toValue(productUid)
      const { data } = await baseApi.get<IInventoryMovementsApiResponse>(
        `/inventory/products/${uid}/movements/`,
        params ? { params: toValue(params) } : {},
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
  return useQuery({
    queryKey: inventoryKeys.catalog.list(),
    queryFn: async () => {
      const { data } = await baseApi.get(`/inventory/catalog/`)
      return data?.data ?? data
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/** Get product catalogs with infinite scroll */
export function useGetProductCatalogsInfinite(limit = 20, search?: Ref<string>) {
  return useInfiniteQuery({
    queryKey: computed(() => inventoryKeys.catalog.infinite(limit, search?.value ?? "")),
    queryFn: async ({ pageParam = 0 }) => {
      const params: Record<string, string | number> = {
        limit,
        offset: pageParam,
      }
      if (search?.value) params.search = search.value
      const { data } = await baseApi.get<TPaginatedResponse<IProductCatalogue>>(
        `/inventory/catalog/`,
        { params },
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

/** search product catalogs by product name */
export function useSearchProductCatalogs(search: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => inventoryKeys.catalog.search(toValue(search))),
    queryFn: async () => {
      const { data } = await baseApi.get<TPaginatedResponse<IProductCatalogue>>(
        `/inventory/catalog/`,
        {
          params: {
            ...(toValue(search) ? { search: toValue(search) } : {}),
            limit: 20,
          },
        },
      )
      return data.data
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export function useGetProductVariants() {
  return useQuery({
    queryKey: inventoryKeys.variants.list(),
    queryFn: async () => {
      const { data } = await baseApi.get(`/inventory/variants/`)
      return data?.data ?? data
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/** get variants by product with optional filters (search, stock_status) */
export function useGetVariantsByProduct(
  params?: MaybeRefOrGetter<Record<string, string | number> | undefined>,
) {
  return useQuery<{
    data: { count: number; results: IProductVariantDetails[] }
  }>({
    queryKey: computed(() => {
      const resolvedParams = toValue(params)
      return inventoryKeys.variants.byProduct(String(resolvedParams?.product ?? ""), resolvedParams)
    }),
    queryFn: async () => {
      const { data } = await baseApi.get(
        `/inventory/variants/`,
        params ? { params: toValue(params) } : {},
      )
      return data
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: () => {
      const p = toValue(params)
      return !!p?.product
    },
  })
}

/** search product variants by name */
export function useSearchProductVariants(search: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => inventoryKeys.variants.search(toValue(search))),
    queryFn: async () => {
      const { data } = await baseApi.get<TPaginatedResponse<IProductVariant>>(
        `/inventory/variants/`,
        {
          params: {
            ...(toValue(search) ? { search: toValue(search) } : {}),
            limit: 20,
          },
        },
      )
      return data.data
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/** get inventory transfer requests (for HQ to view pending requests) */
export function useGetTransferRequests(params?: MaybeRefOrGetter<Record<string, string | number>>) {
  return useQuery({
    queryKey: computed(() => inventoryKeys.transfers.list(toValue(params))),
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
