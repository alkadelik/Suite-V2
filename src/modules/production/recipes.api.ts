import baseApi, { TPaginatedResponse, useApiQuery } from "@/composables/baseApi"
import { MaybeRefOrGetter, toValue } from "vue"
import { useMutation, useQuery } from "@tanstack/vue-query"

export type ItemType = "product" | "sub_assembly" | "item"

export type OutputItemOption = {
  label: string
  value: string
  type: ItemType
  unit?: string
}

export type IngredientKind = "raw_material" | "sub_assembly"

export type IngredientOption = {
  label: string
  value: string
  unit?: string
  cost_per_unit: number
  kind: IngredientKind
}

export type TRecipes = {
  uid: string
  output_product?: string | null
  output_raw_material?: string | null
  output_item_name: string
  output_unit?: string
  item_type: ItemType
  output_quantity: string | number
  ingredient_count: string | number
  process_cost_count: string | number
  producible_quantity: string | number
  last_cost?: string | number
  average_cost?: string | number
  is_active: boolean
  updated_at: string
}

export type RecipeIngredient = {
  material_uid: string
  quantity: number
}

export type RecipeProcessCost = {
  name: string
  cost_per_batch: number
  notes?: string
}

export type RecipeDetail = {
  uid: string
  output_product?: string
  output_raw_material?: string
  output_item?: string
  output_item_name?: string
  output_unit?: string
  unit?: string
  output_quantity: string | number
  item_type: ItemType
  notes?: string
  is_active: boolean
  estimated_cost_per_batch?: string | number
  last_cost?: string | number
  average_cost?: string | number
  total_cost?: string | number
  ingredients: RecipeIngredient[]
  process_costs: RecipeProcessCost[]
  created_at: string
  updated_at: string
}

export type RecipeCreatePayload = {
  output_item_type: ItemType
  output_item_uid: string
  output_quantity: number
  notes?: string
  ingredients: RecipeIngredient[]
  process_costs: RecipeProcessCost[]
}

export type RecipePatchPayload = Partial<RecipeCreatePayload> & {
  is_active?: boolean
}

export type InventoryProduct = {
  uid: string
  name: string
  price: string
  unit: string
  total_stock: string
  sellable_stock: string
  needs_reorder: boolean
  variants_count: string
  is_active: boolean
  amount_sold: string
  quantity_sold: string
  memo_count: string
  return_count: string
  popup_quantity_taken: number
  is_hidden_from_storefront: boolean
  category: string
  has_variants: boolean
  is_sub_assembly?: boolean
}

export type InventorySubAssembly = {
  uid: string
  name: string
  unit?: string
  is_active?: boolean
}

export type RawMaterial = {
  uid: string
  name: string
  unit?: string
  last_cost?: string | number
  average_cost?: string | number
  is_sub_assembly?: boolean // raw-materials API returns this flag
}

export type IngredientEntityDetail = {
  name: string
  unit: string
}

type WrappedPayload<T> = T | { data: T }

type PaginatedLike<T> =
  | TPaginatedResponse<T>
  | { results?: T[]; data?: T[] | { results?: T[] } }
  | T[]

type EntityPayload = {
  name?: string
  unit?: string
  measurement_unit?: string
  uom?: string
}

type EntityResponse = {
  data?: EntityPayload
} & EntityPayload

function unwrapApiPayload<T>(payload: WrappedPayload<T>): T {
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return payload.data
  }
  return payload
}

function getPaginatedResults<T>(payload: PaginatedLike<T>): T[] {
  if (Array.isArray(payload)) return payload
  if (typeof payload !== "object" || payload === null) return []
  if ("results" in payload && Array.isArray(payload.results)) return payload.results
  if ("data" in payload) {
    const data = payload.data
    if (Array.isArray(data)) return data
    if (
      typeof data === "object" &&
      data !== null &&
      "results" in data &&
      Array.isArray(data.results)
    ) {
      return data.results
    }
  }
  return []
}

function getEntityPayload(payload: EntityResponse): EntityPayload {
  if (payload.data && typeof payload.data === "object") return payload.data
  return {
    name: payload.name,
    unit: payload.unit,
    measurement_unit: payload.measurement_unit,
    uom: payload.uom,
  }
}

export function productToOutputOption(product: InventoryProduct): OutputItemOption {
  return {
    label: String(product.name ?? ""),
    value: String(product.uid ?? ""),
    type: product.is_sub_assembly ? "sub_assembly" : "product",
    unit: String(product.unit ?? "").trim() || undefined,
  }
}

export function subAssemblyToOutputOption(subAssembly: InventorySubAssembly): OutputItemOption {
  return {
    label: String(subAssembly.name ?? ""),
    value: String(subAssembly.uid ?? ""),
    type: "sub_assembly",
    unit: String(subAssembly.unit ?? "").trim() || undefined,
  }
}

export function rawMaterialToIngredientOption(material: RawMaterial): IngredientOption {
  const cost =
    material.last_cost != null && Number.isFinite(Number(material.last_cost))
      ? Number(material.last_cost)
      : material.average_cost != null && Number.isFinite(Number(material.average_cost))
        ? Number(material.average_cost)
        : 0

  return {
    label: String(material.name ?? ""),
    value: String(material.uid ?? ""),
    unit: String(material.unit ?? "").trim() || undefined,
    cost_per_unit: cost,
    kind: (material.is_sub_assembly ? "sub_assembly" : "raw_material") as IngredientKind,
  }
}

export function rawMaterialToOutputOption(material: RawMaterial): OutputItemOption {
  return {
    label: String(material.name ?? ""),
    value: String(material.uid ?? ""),
    type: "sub_assembly",
    unit: String(material.unit ?? "").trim() || undefined,
  }
}

export function getTotalCostFromDetail(d: RecipeDetail): number {
  const toNum = (v: string | number | null | undefined): number => {
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN
    return Number.isFinite(n) ? n : 0
  }
  if (d.total_cost != null && toNum(d.total_cost) > 0) return toNum(d.total_cost)
  if (d.estimated_cost_per_batch != null && toNum(d.estimated_cost_per_batch) > 0) {
    return toNum(d.estimated_cost_per_batch)
  }
  return 0
}

export function useGetRecipes(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useApiQuery<TPaginatedResponse<TRecipes>["data"]>({
    url: "/recipes/",
    params,
    key: "recipes",
    selectData: true,
  })
}

export function useGetInventoryProducts(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useApiQuery<TPaginatedResponse<InventoryProduct>["data"]>({
    url: "/inventory/products/",
    params,
    key: "inventory-products",
    selectData: true,
  })
}

export function useGetRawMaterialsForRecipes(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useApiQuery<TPaginatedResponse<RawMaterial>["data"]>({
    url: "/raw-materials/",
    params,
    key: "recipe-raw-materials",
    selectData: true,
  })
}

export function useGetRecipeDetail(uid: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ["recipe", uid],
    queryFn: async () => {
      const uidValue = toValue(uid)
      const res = await baseApi.get<WrappedPayload<RecipeDetail>>(`/recipes/${uidValue}/`)
      return unwrapApiPayload(res.data)
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: () => !!toValue(uid),
  })
}

export function useCreateRecipe() {
  return useMutation({
    mutationFn: async (payload: RecipeCreatePayload) => {
      const res = await baseApi.post<WrappedPayload<RecipeDetail>>("/recipes/", payload)
      return unwrapApiPayload(res.data)
    },
  })
}

export function useEditRecipe() {
  return useMutation({
    mutationFn: async ({ uid, payload }: { uid: string; payload: RecipePatchPayload }) => {
      const res = await baseApi.patch<WrappedPayload<RecipeDetail>>(`/recipes/${uid}/`, payload)
      return unwrapApiPayload(res.data)
    },
  })
}

export function useDeleteRecipe() {
  return useMutation({
    mutationFn: (uid: string) => baseApi.delete(`/recipes/${uid}/`),
  })
}

export const RecipesAPI = {
  async list(
    params?: Record<string, string | number | boolean>,
  ): Promise<TPaginatedResponse<TRecipes>> {
    const res = await baseApi.get<TPaginatedResponse<TRecipes>>("/recipes/", { params })
    return res.data
  },

  async listInventoryProducts(
    params?: Record<string, string | number | boolean>,
  ): Promise<InventoryProduct[]> {
    const res = await baseApi.get<PaginatedLike<InventoryProduct>>("/inventory/products/", {
      params,
    })
    return getPaginatedResults(res.data)
  },

  async listRawMaterials(
    params?: Record<string, string | number | boolean>,
  ): Promise<RawMaterial[]> {
    const res = await baseApi.get<PaginatedLike<RawMaterial>>("/raw-materials/", { params })
    return getPaginatedResults(res.data)
  },

  async create(payload: RecipeCreatePayload): Promise<RecipeDetail> {
    const res = await baseApi.post<WrappedPayload<RecipeDetail>>("/recipes/", payload)
    return unwrapApiPayload(res.data)
  },

  async getByUid(uid: string): Promise<RecipeDetail | null> {
    try {
      const res = await baseApi.get<WrappedPayload<RecipeDetail>>(`/recipes/${uid}/`)
      const data = unwrapApiPayload(res.data)
      return data.uid ? data : null
    } catch {
      return null
    }
  },

  async partialUpdate(uid: string, payload: RecipePatchPayload): Promise<RecipeDetail> {
    const res = await baseApi.patch<WrappedPayload<RecipeDetail>>(`/recipes/${uid}/`, payload)
    return unwrapApiPayload(res.data)
  },

  async setActive(uid: string, is_active: boolean): Promise<RecipeDetail> {
    const res = await baseApi.patch<WrappedPayload<RecipeDetail>>(`/recipes/${uid}/`, { is_active })
    return unwrapApiPayload(res.data)
  },

  async remove(uid: string): Promise<void> {
    await baseApi.delete(`/recipes/${uid}/`)
  },

  async getEntityDetail(uid: string): Promise<IngredientEntityDetail> {
    for (const endpoint of [
      `/raw-materials/${uid}/`,
      `/inventory/products/${uid}/`,
      `/inventory/items/${uid}/`,
    ]) {
      try {
        const res = await baseApi.get<EntityResponse>(endpoint)
        const payload = getEntityPayload(res.data)
        const name = String(payload.name ?? "").trim()
        const unit = String(payload.unit ?? payload.measurement_unit ?? payload.uom ?? "").trim()
        if (name) return { name, unit }
      } catch {
        continue
      }
    }
    return { name: uid, unit: "" }
  },

  async getEntityUnit(uid: string): Promise<string> {
    if (!uid) return ""
    for (const endpoint of [
      `/inventory/products/${uid}/`,
      `/raw-materials/${uid}/`,
      `/inventory/items/${uid}/`,
    ]) {
      try {
        const res = await baseApi.get<EntityResponse>(endpoint)
        const payload = getEntityPayload(res.data)
        const unit = String(payload.unit ?? payload.measurement_unit ?? payload.uom ?? "").trim()
        if (unit) return unit
      } catch {
        continue
      }
    }
    return ""
  },
}
