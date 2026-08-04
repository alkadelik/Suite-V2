import type { InfiniteData, QueryClient, QueryKey } from "@tanstack/vue-query"
import type { IGetProductResponse, IProductCatalogue, IProductsApiResponse } from "./types"
import { productDetailsToCatalogue, productDetailsToListItem } from "./normalizers"
import { inventoryKeys, type InventoryQueryParams } from "./queryKeys"
import type { IProductDetails, IProductVariantDetails } from "./types"

type CataloguePage = {
  count: number
  next: string | null
  previous: string | null
  results: IProductCatalogue[]
}

const invalidate = (queryClient: QueryClient, queryKey: QueryKey) =>
  queryClient.invalidateQueries({ queryKey, refetchType: "active" })

const getParams = (queryKey: QueryKey): InventoryQueryParams => {
  const candidate = queryKey[queryKey.length - 1]
  return candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? (candidate as InventoryQueryParams)
    : {}
}

const isUnfilteredFirstPage = (params: InventoryQueryParams) => {
  const offset = Number(params.offset ?? 0)
  const hasFilter = ["name", "search", "category", "stock_status", "variant_type"].some(
    (key) => params[key] !== undefined && params[key] !== "",
  )
  return offset === 0 && !hasFilter
}

const prependUnique = <T extends { uid: string }>(items: T[], item: T) => [
  item,
  ...items.filter((existing) => existing.uid !== item.uid),
]

// Case-insensitive name comparison matching the catalog's alphabetical ordering.
const compareByName = (a: { name: string }, b: { name: string }): number =>
  (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" })

// Insert into the loaded alphabetical range while preserving every loaded page
// size. When more server pages exist, the former last loaded item is displaced
// into that unloaded range; keeping the loaded count stable also keeps the next
// offset correct.
const insertCatalogueItemSorted = (
  pages: CataloguePage[],
  item: IProductCatalogue,
): CataloguePage[] | null => {
  const pageSizes = pages.map((page) => page.results.length)
  const loadedItems = pages.flatMap((page) => page.results)
  const lastPage = pages[pages.length - 1]
  const insertionIndex = loadedItems.findIndex((existing) => compareByName(item, existing) <= 0)

  if (insertionIndex === -1 && lastPage.next !== null) return null

  const sortedItems = [...loadedItems, item].sort(compareByName)
  const visibleItems =
    lastPage.next === null ? sortedItems : sortedItems.slice(0, loadedItems.length)
  let cursor = 0

  return pages.map((page, index) => {
    const pageSize =
      index === pages.length - 1 && lastPage.next === null
        ? visibleItems.length - cursor
        : pageSizes[index]
    const results = visibleItems.slice(cursor, cursor + pageSize)
    cursor += pageSize
    return { ...page, results }
  })
}

export const cacheCreatedProduct = (queryClient: QueryClient, product: IProductDetails): void => {
  const listItem = productDetailsToListItem(product)
  const catalogueItem = productDetailsToCatalogue(product)

  queryClient.setQueryData(inventoryKeys.products.detail(product.uid), {
    success: true,
    data: product,
  })

  queryClient
    .getQueriesData<IProductsApiResponse>({ queryKey: inventoryKeys.products.lists() })
    .forEach(([queryKey, data]) => {
      if (!data?.data || !isUnfilteredFirstPage(getParams(queryKey))) return
      const alreadyExists = data.data.results.some((item) => item.uid === product.uid)
      queryClient.setQueryData<IProductsApiResponse>(queryKey, {
        ...data,
        data: {
          ...data.data,
          count: data.data.count + (alreadyExists ? 0 : 1),
          results: prependUnique(data.data.results, listItem),
        },
      })
    })

  queryClient
    .getQueriesData<InfiniteData<CataloguePage>>({
      queryKey: inventoryKeys.catalog.infiniteLists(),
    })
    .forEach(([queryKey, data]) => {
      if (!data?.pages.length || !isUnfilteredFirstPage(getParams(queryKey))) return
      const alreadyExists = data.pages.some((page) =>
        page.results.some((item) => item.uid === product.uid),
      )
      if (alreadyExists) return
      // The catalog list is alphabetical, so insert at the right sorted position
      // rather than prepending. Skip when it belongs in a not-yet-loaded page.
      const pagesWithItem = insertCatalogueItemSorted(data.pages, catalogueItem)
      if (!pagesWithItem) return
      queryClient.setQueryData<InfiniteData<CataloguePage>>(queryKey, {
        ...data,
        pages: pagesWithItem.map((page) => ({ ...page, count: page.count + 1 })),
      })
    })
}

// Shape stored by useGetVariantsByProduct (the variants tab table).
type TVariantsByProductResponse = {
  data?: { count: number; results: IProductVariantDetails[] }
}

// Whether a variants by-product query is the plain, unfiltered one (only the
// `product` param). Filtered queries (search, stock_status) can't be patched
// with the full variant list, so they refetch instead.
const isPlainByProductQuery = (queryKey: QueryKey, productUid: string): boolean => {
  if (queryKey[2] !== "by-product" || queryKey[3] !== productUid) return false
  const params = queryKey[queryKey.length - 1]
  if (!params || typeof params !== "object" || Array.isArray(params)) return true
  return Object.entries(params).every(
    ([key, value]) => key === "product" || value === undefined || value === "",
  )
}

// Whether a cached list/catalog query's data contains the product, regardless of
// shape (paginated products list vs infinite catalog pages).
const queryDataContainsProduct = (data: unknown, productUid: string): boolean => {
  if (!data || typeof data !== "object") return false
  const asList = data as Partial<IProductsApiResponse>
  if (asList.data?.results) {
    return asList.data.results.some((item) => item.uid === productUid)
  }
  const asInfinite = data as Partial<InfiniteData<CataloguePage>>
  if (Array.isArray(asInfinite.pages)) {
    return asInfinite.pages.some((page) => page.results.some((item) => item.uid === productUid))
  }
  return false
}

// Write an updated product into the detail cache and patch its row in place in
// every cached list/catalog page, so edits render instantly without a refetch
// dimming the tables (same idea as cacheCreatedProduct, but replacing rows).
export const cacheUpdatedProduct = (queryClient: QueryClient, product: IProductDetails): void => {
  const listItem = productDetailsToListItem(product)
  const catalogueItem = productDetailsToCatalogue(product)

  queryClient.setQueryData(inventoryKeys.products.detail(product.uid), {
    success: true,
    data: product,
  })

  queryClient
    .getQueriesData<IProductsApiResponse>({ queryKey: inventoryKeys.products.lists() })
    .forEach(([queryKey, data]) => {
      if (!data?.data || !queryDataContainsProduct(data, product.uid)) return
      queryClient.setQueryData<IProductsApiResponse>(queryKey, {
        ...data,
        data: {
          ...data.data,
          results: data.data.results.map((item) => (item.uid === product.uid ? listItem : item)),
        },
      })
    })

  queryClient
    .getQueriesData<InfiniteData<CataloguePage>>({
      queryKey: inventoryKeys.catalog.infiniteLists(),
    })
    .forEach(([queryKey, data]) => {
      if (!data?.pages.length || !queryDataContainsProduct(data, product.uid)) return
      queryClient.setQueryData<InfiniteData<CataloguePage>>(queryKey, {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          results: page.results.map((item) => (item.uid === product.uid ? catalogueItem : item)),
        })),
      })
    })

  // The variants tab table reads from its own by-product query — replace its
  // rows with the product's (already reconciled) variants so the table updates
  // instantly instead of waiting on a refetch that can race the backend write.
  queryClient
    .getQueriesData<TVariantsByProductResponse>({
      queryKey: inventoryKeys.variants.byProduct(product.uid),
    })
    .forEach(([queryKey, data]) => {
      if (!data?.data || !isPlainByProductQuery(queryKey, product.uid)) return
      queryClient.setQueryData<TVariantsByProductResponse>(queryKey, {
        ...data,
        data: { ...data.data, count: product.variants.length, results: product.variants },
      })
    })
}

/** Fields the variant edit flows can patch optimistically into the cached detail. */
export type TVariantFieldPatch = { uid: string } & Partial<
  Pick<
    IProductVariantDetails,
    "name" | "price" | "cost_price" | "weight" | "length" | "width" | "height" | "reorder_point"
  >
>

export const inventoryCache = {
  productCreated(queryClient: QueryClient, product?: IProductDetails) {
    if (product) {
      cacheCreatedProduct(queryClient, product)
      // The unfiltered first pages were just reconciled with the created product
      // (server response data), so don't refetch them actively — that dims the
      // table right after the optimistic insert. Mark them stale for the next
      // interaction and only actively refetch the filtered/paged lists the
      // optimistic insert skipped.
      void queryClient.invalidateQueries({
        queryKey: inventoryKeys.products.lists(),
        refetchType: "none",
        predicate: (query) => isUnfilteredFirstPage(getParams(query.queryKey)),
      })
      void queryClient.invalidateQueries({
        queryKey: inventoryKeys.products.lists(),
        refetchType: "active",
        predicate: (query) => !isUnfilteredFirstPage(getParams(query.queryKey)),
      })
    } else {
      void invalidate(queryClient, inventoryKeys.products.lists())
    }
    void invalidate(queryClient, inventoryKeys.products.searches())
    void invalidate(queryClient, inventoryKeys.products.dashboard())
    void invalidate(queryClient, inventoryKeys.catalog.all)
    void invalidate(queryClient, inventoryKeys.variants.all)
  },
  productUpdated(queryClient: QueryClient, productUid: string, product?: IProductDetails | null) {
    if (product && product.uid === productUid) {
      cacheUpdatedProduct(queryClient, product)
      // The detail cache and every list/catalog row containing the product were
      // just reconciled with server response data, so mark those stale without
      // an active refetch (which would dim the tables right after the optimistic
      // write). Queries the patch skipped still refetch actively.
      void queryClient.invalidateQueries({
        queryKey: inventoryKeys.products.detail(productUid),
        refetchType: "none",
      })
      for (const queryKey of [inventoryKeys.products.lists(), inventoryKeys.catalog.all]) {
        void queryClient.invalidateQueries({
          queryKey,
          refetchType: "none",
          predicate: (query) => queryDataContainsProduct(query.state.data, productUid),
        })
        void queryClient.invalidateQueries({
          queryKey,
          refetchType: "active",
          predicate: (query) => !queryDataContainsProduct(query.state.data, productUid),
        })
      }
      // The plain by-product variants query was patched from the reconciled
      // product — an immediate refetch could race the backend write and clobber
      // it with stale rows, so mark it stale only. Everything else refetches.
      void queryClient.invalidateQueries({
        queryKey: inventoryKeys.variants.all,
        refetchType: "none",
        predicate: (query) => isPlainByProductQuery(query.queryKey, productUid),
      })
      void queryClient.invalidateQueries({
        queryKey: inventoryKeys.variants.all,
        refetchType: "active",
        predicate: (query) => !isPlainByProductQuery(query.queryKey, productUid),
      })
    } else {
      void invalidate(queryClient, inventoryKeys.products.detail(productUid))
      void invalidate(queryClient, inventoryKeys.products.lists())
      void invalidate(queryClient, inventoryKeys.catalog.all)
      void invalidate(queryClient, inventoryKeys.variants.all)
    }
    void invalidate(queryClient, inventoryKeys.products.searches())
  },
  /**
   * Reconcile the caches after a bulk variants operation (add/delete) using the
   * server response: deleted variants are removed from the cached product
   * detail and the created variants (with their server-assigned uids) are
   * appended, then every list/catalog row is rebuilt from the merged product.
   * Falls back to plain invalidation when the detail isn't cached.
   */
  variantsBulkChanged(
    queryClient: QueryClient,
    productUid: string,
    changes: { deletedUids: string[]; createdVariants: IProductVariantDetails[] },
  ) {
    const detail = queryClient.getQueryData<IGetProductResponse>(
      inventoryKeys.products.detail(productUid),
    )
    if (!detail?.data) {
      inventoryCache.variantsChanged(queryClient, productUid)
      return
    }

    const deleted = new Set(changes.deletedUids)
    // Newly created variants go first so they're immediately visible at the
    // top of the variants table.
    const variants = [
      ...changes.createdVariants,
      ...detail.data.variants.filter((variant) => !deleted.has(variant.uid)),
    ]
    const merged: IProductDetails = {
      ...detail.data,
      variants,
      is_variable: variants.length > 1,
      total_stock: variants.reduce(
        (total, variant) => total + Number(variant.available_stock || 0),
        0,
      ),
      needs_reorder: variants.some((variant) => variant.needs_reorder),
    }

    inventoryCache.productUpdated(queryClient, productUid, merged)
    void invalidate(queryClient, inventoryKeys.products.dashboard())
  },
  /**
   * Merge field-level variant patches (price, cost price, dimensions, ...) into
   * the cached product detail and reconcile every list/catalog row from it, so
   * price edits render instantly. Falls back to plain invalidation when the
   * product detail isn't cached.
   */
  variantsUpdated(queryClient: QueryClient, productUid: string, patches: TVariantFieldPatch[]) {
    const detail = queryClient.getQueryData<IGetProductResponse>(
      inventoryKeys.products.detail(productUid),
    )
    if (!detail?.data) {
      inventoryCache.variantsChanged(queryClient, productUid)
      return
    }

    const patchByUid = new Map(patches.map(({ uid, ...fields }) => [uid, fields]))
    const merged: IProductDetails = {
      ...detail.data,
      variants: detail.data.variants.map((variant) => {
        const fields = patchByUid.get(variant.uid)
        return fields ? { ...variant, ...fields } : variant
      }),
    }

    inventoryCache.productUpdated(queryClient, productUid, merged)
    void invalidate(queryClient, inventoryKeys.products.dashboard())
  },
  variantsChanged(queryClient: QueryClient, productUid: string) {
    void invalidate(queryClient, inventoryKeys.products.detail(productUid))
    void invalidate(queryClient, inventoryKeys.products.lists())
    void invalidate(queryClient, inventoryKeys.products.dashboard())
    void invalidate(queryClient, inventoryKeys.catalog.all)
    void invalidate(queryClient, inventoryKeys.variants.all)
  },
  productDeleted(queryClient: QueryClient, productUid: string) {
    queryClient.removeQueries({ queryKey: inventoryKeys.products.detail(productUid), exact: true })
    void invalidate(queryClient, inventoryKeys.products.lists())
    void invalidate(queryClient, inventoryKeys.products.dashboard())
    void invalidate(queryClient, inventoryKeys.catalog.all)
    void invalidate(queryClient, inventoryKeys.variants.all)
  },
  stockChanged(queryClient: QueryClient, productUid?: string) {
    // Refetch the product detail with refetchType "all" (not just "active") so the
    // Manage Stock modal's detail query is refreshed even if it has just gone
    // inactive on close, preventing stale stock on reopen (LYW-2647).
    if (productUid)
      void queryClient.invalidateQueries({
        queryKey: inventoryKeys.products.detail(productUid),
        refetchType: "all",
      })
    void invalidate(queryClient, inventoryKeys.products.lists())
    void invalidate(queryClient, inventoryKeys.products.dashboard())
    void invalidate(queryClient, inventoryKeys.catalog.all)
    void invalidate(queryClient, inventoryKeys.variants.all)
    void invalidate(queryClient, inventoryKeys.movements.all)
  },
  popupAllocationChanged(queryClient: QueryClient, productUid?: string) {
    if (productUid) void invalidate(queryClient, inventoryKeys.products.detail(productUid))
    void invalidate(queryClient, inventoryKeys.products.lists())
    void invalidate(queryClient, inventoryKeys.products.dashboard())
    void invalidate(queryClient, inventoryKeys.catalog.all)
    void invalidate(queryClient, inventoryKeys.variants.all)
  },
  transferChanged(queryClient: QueryClient, stockChanged = false, productUid?: string) {
    void invalidate(queryClient, inventoryKeys.transfers.all)
    if (stockChanged) inventoryCache.stockChanged(queryClient, productUid)
  },
  categoryChanged(queryClient: QueryClient) {
    void invalidate(queryClient, inventoryKeys.categories.all)
  },
  attributeChanged(queryClient: QueryClient, attributeUid?: string) {
    void invalidate(queryClient, inventoryKeys.attributes.list())
    if (attributeUid) void invalidate(queryClient, inventoryKeys.attributes.values(attributeUid))
  },
}
