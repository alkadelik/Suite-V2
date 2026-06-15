export type InventoryQueryParams = Record<string, string | number | boolean>

export const inventoryKeys = {
  all: ["inventory"] as const,
  categories: {
    all: ["inventory", "categories"] as const,
    list: () => ["inventory", "categories", "list"] as const,
  },
  attributes: {
    all: ["inventory", "attributes"] as const,
    list: () => ["inventory", "attributes", "list"] as const,
    values: (attributeUid: string) => ["inventory", "attributes", "values", attributeUid] as const,
  },
  products: {
    all: ["inventory", "products"] as const,
    lists: () => ["inventory", "products", "list"] as const,
    list: (params?: InventoryQueryParams) =>
      ["inventory", "products", "list", params ?? {}] as const,
    searches: () => ["inventory", "products", "search"] as const,
    search: (query: string) => ["inventory", "products", "search", query] as const,
    details: () => ["inventory", "products", "detail"] as const,
    detail: (uid: string) => ["inventory", "products", "detail", uid] as const,
    dashboard: () => ["inventory", "products", "dashboard"] as const,
  },
  catalog: {
    all: ["inventory", "catalog"] as const,
    lists: () => ["inventory", "catalog", "list"] as const,
    list: (params?: InventoryQueryParams) =>
      ["inventory", "catalog", "list", params ?? {}] as const,
    searches: () => ["inventory", "catalog", "search"] as const,
    search: (query: string) => ["inventory", "catalog", "search", query] as const,
    infiniteLists: () => ["inventory", "catalog", "infinite"] as const,
    infinite: (limit: number, search: string) =>
      ["inventory", "catalog", "infinite", { limit, search }] as const,
  },
  variants: {
    all: ["inventory", "variants"] as const,
    lists: () => ["inventory", "variants", "list"] as const,
    list: (params?: InventoryQueryParams) =>
      ["inventory", "variants", "list", params ?? {}] as const,
    byProduct: (productUid: string, params?: InventoryQueryParams) =>
      ["inventory", "variants", "by-product", productUid, params ?? {}] as const,
    searches: () => ["inventory", "variants", "search"] as const,
    search: (query: string) => ["inventory", "variants", "search", query] as const,
  },
  movements: {
    all: ["inventory", "movements"] as const,
    lists: () => ["inventory", "movements", "list"] as const,
    list: (params?: InventoryQueryParams) =>
      ["inventory", "movements", "list", params ?? {}] as const,
    byProduct: (productUid: string, params?: InventoryQueryParams) =>
      ["inventory", "movements", "by-product", productUid, params ?? {}] as const,
  },
  transfers: {
    all: ["inventory", "transfers"] as const,
    lists: () => ["inventory", "transfers", "list"] as const,
    list: (params?: InventoryQueryParams) =>
      ["inventory", "transfers", "list", params ?? {}] as const,
  },
}
