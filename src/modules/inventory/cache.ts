import type { InfiniteData, QueryClient, QueryKey } from "@tanstack/vue-query"
import type { IProductCatalogue, IProductsApiResponse } from "./types"
import { productDetailsToCatalogue, productDetailsToListItem } from "./normalizers"
import { inventoryKeys, type InventoryQueryParams } from "./queryKeys"
import type { IProductDetails } from "./types"

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

export const inventoryCache = {
  productCreated(queryClient: QueryClient, product?: IProductDetails) {
    if (product) cacheCreatedProduct(queryClient, product)
    void invalidate(queryClient, inventoryKeys.products.lists())
    void invalidate(queryClient, inventoryKeys.products.searches())
    void invalidate(queryClient, inventoryKeys.products.dashboard())
    void invalidate(queryClient, inventoryKeys.catalog.all)
    void invalidate(queryClient, inventoryKeys.variants.all)
  },
  productUpdated(queryClient: QueryClient, productUid: string) {
    void invalidate(queryClient, inventoryKeys.products.detail(productUid))
    void invalidate(queryClient, inventoryKeys.products.lists())
    void invalidate(queryClient, inventoryKeys.products.searches())
    void invalidate(queryClient, inventoryKeys.catalog.all)
    void invalidate(queryClient, inventoryKeys.variants.all)
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
