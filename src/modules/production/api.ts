import type {
  IAdjustStockPayload,
  ICreateMaterialPayload,
  RawMaterialStats,
  TRawMaterial,
  RecipesQuery,
  ProdRunCreatePayload,
  ProdRunFinalizePayload,
  ProdRunIngredientUsed,
  TProdRunDetail,
  TProdRunListItem,
} from "./types"

import baseApi, { TPaginatedResponse, useApiQuery } from "@/composables/baseApi"
import { MaybeRefOrGetter, toValue } from "vue"
import { useMutation, useQuery } from "@tanstack/vue-query"

// ─── Internal utility types (not exported — implementation detail only) ────────

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

// ─── Internal utility functions ───────────────────────────────────────────────

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

function unwrapPaginated<T>(res: unknown): { count: number; results: T[] } {
  if (res && typeof res === "object" && "data" in res) {
    const data = (res as { data?: unknown }).data
    if (data && typeof data === "object") {
      const count = Number((data as { count?: unknown }).count ?? 0) || 0
      const results = (data as { results?: unknown }).results
      return { count, results: Array.isArray(results) ? (results as T[]) : [] }
    }
  }
  if (res && typeof res === "object") {
    const count = Number((res as { count?: unknown }).count ?? 0) || 0
    const results = (res as { results?: unknown }).results
    return { count, results: Array.isArray(results) ? (results as T[]) : [] }
  }
  return { count: 0, results: [] }
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

// ─── Raw Materials Types ───────────────────────────────────────────────────────

export type ItemType = "product" | "sub_assembly"

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
  output_variant?: string | null
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
  is_sub_assembly?: boolean
}

export type IngredientEntityDetail = {
  name: string
  unit: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function productToOutputOption(product: InventoryProduct): OutputItemOption {
  return {
    label: String(product.name ?? ""),
    value: String(product.uid ?? ""),
    type: "product",
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

// ─── Raw Materials ─────────────────────────────────────────────────────────────

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

// ─── Recipes ──────────────────────────────────────────────────────────────────

/** Fetch paginated recipes list */
export async function fetchRecipes(
  query?: RecipesQuery,
): Promise<{ count: number; results: TRecipes[] }> {
  const res = await baseApi.get<TPaginatedResponse<TRecipes>>("/recipes/", { params: query })
  return unwrapPaginated<TRecipes>(res.data)
}

/** Fetch all inventory products */
export async function fetchInventoryProducts(
  params?: Record<string, string | number | boolean>,
): Promise<InventoryProduct[]> {
  const res = await baseApi.get<PaginatedLike<InventoryProduct>>("/inventory/products/", { params })
  return getPaginatedResults(res.data)
}

/** Fetch all raw materials */
export async function fetchRawMaterials(
  params?: Record<string, string | number | boolean>,
): Promise<RawMaterial[]> {
  const res = await baseApi.get<PaginatedLike<RawMaterial>>("/raw-materials/", { params })
  return getPaginatedResults(res.data)
}

/** Fetch recipe detail by UID */
export async function fetchRecipeDetail(uid: string): Promise<RecipeDetail | null> {
  try {
    const res = await baseApi.get<WrappedPayload<RecipeDetail>>(`/recipes/${uid}/`)
    const data = unwrapApiPayload(res.data)
    return data.uid ? data : null
  } catch {
    return null
  }
}

/** Create a new recipe */
export async function createRecipe(payload: RecipeCreatePayload): Promise<RecipeDetail> {
  const res = await baseApi.post<WrappedPayload<RecipeDetail>>("/recipes/", payload)
  return unwrapApiPayload(res.data)
}

/** Partially update a recipe */
export async function patchRecipe(uid: string, payload: RecipePatchPayload): Promise<RecipeDetail> {
  const res = await baseApi.patch<WrappedPayload<RecipeDetail>>(`/recipes/${uid}/`, payload)
  return unwrapApiPayload(res.data)
}

/** Toggle recipe active state */
export async function setRecipeActive(uid: string, is_active: boolean): Promise<RecipeDetail> {
  const res = await baseApi.patch<WrappedPayload<RecipeDetail>>(`/recipes/${uid}/`, { is_active })
  return unwrapApiPayload(res.data)
}

/** Delete a recipe */
export async function deleteRecipe(uid: string): Promise<void> {
  await baseApi.delete(`/recipes/${uid}/`)
}

/** Fetch combined output item options (products + sub-assemblies) for dropdowns */
export async function fetchOutputItemOptions(): Promise<
  Array<{ label: string; value: string; type: string; unit?: string }>
> {
  const [products, rawMaterials] = await Promise.all([
    fetchInventoryProducts({ limit: 500 }),
    fetchRawMaterials({ limit: 500 }),
  ])

  const subAssemblyUids = new Set(rawMaterials.filter((m) => m.is_sub_assembly).map((m) => m.uid))

  const productOptions = products
    .filter((x) => x.uid && x.name && !subAssemblyUids.has(x.uid))
    .map((x) => ({
      label: x.name.trim(),
      value: x.uid,
      type: "product" as const,
      unit: x.unit?.trim() || undefined,
    }))

  const subAssemblyOptions = rawMaterials
    .filter((m) => m.uid && m.name && m.is_sub_assembly === true)
    .map((m) => ({
      label: m.name.trim(),
      value: m.uid,
      type: "sub_assembly" as const,
      unit: m.unit?.trim() || undefined,
    }))

  return [...productOptions, ...subAssemblyOptions]
}

/** Resolve the unit string for any entity UID */
export async function getEntityUnit(uid: string): Promise<string> {
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
}

/** Resolve both name and unit for any entity UID */
export async function getEntityDetail(uid: string): Promise<IngredientEntityDetail> {
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
}

/** Vue Query hook — recipes list */
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

/** Vue Query hook — inventory products */
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

/** Vue Query hook — raw materials for recipes */
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

/** Vue Query hook — recipe detail */
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

/** Vue Query hook — create recipe mutation */
export function useCreateRecipe() {
  return useMutation({
    mutationFn: async (payload: RecipeCreatePayload) => {
      const res = await baseApi.post<WrappedPayload<RecipeDetail>>("/recipes/", payload)
      return unwrapApiPayload(res.data)
    },
  })
}

/** Vue Query hook — edit recipe mutation */
export function useEditRecipe() {
  return useMutation({
    mutationFn: async ({ uid, payload }: { uid: string; payload: RecipePatchPayload }) => {
      const res = await baseApi.patch<WrappedPayload<RecipeDetail>>(`/recipes/${uid}/`, payload)
      return unwrapApiPayload(res.data)
    },
  })
}

/** Vue Query hook — delete recipe mutation */
export function useDeleteRecipe() {
  return useMutation({
    mutationFn: (uid: string) => baseApi.delete(`/recipes/${uid}/`),
  })
}

/** Imperative API object — alias for store/composable use */
export const RecipesAPI = {
  list: fetchRecipes,
  listInventoryProducts: fetchInventoryProducts,
  listRawMaterials: fetchRawMaterials,
  getByUid: fetchRecipeDetail,
  create: createRecipe,
  partialUpdate: patchRecipe,
  setActive: setRecipeActive,
  remove: deleteRecipe,
  getEntityUnit,
  getEntityDetail,
}

// ─── Production Runs ──────────────────────────────────────────────────────────

/** Create a draft production run */
export async function createProductionRun(payload: ProdRunCreatePayload): Promise<TProdRunDetail> {
  const res = await baseApi.post<WrappedPayload<TProdRunDetail>>("/production-runs/", payload)
  return unwrapApiPayload(res.data)
}

/** List all production runs */
export async function fetchProductionRuns(params?: {
  limit?: number
  offset?: number
}): Promise<{ count: number; results: TProdRunListItem[] }> {
  const res = await baseApi.get<TPaginatedResponse<TProdRunListItem>>("/production-runs/", {
    params,
  })
  return unwrapPaginated<TProdRunListItem>(res.data)
}

/** Get full production run detail by UID */
export async function fetchProductionRunDetail(uid: string): Promise<TProdRunDetail | null> {
  try {
    const res = await baseApi.get<WrappedPayload<TProdRunDetail>>(`/production-runs/${uid}/`)
    return unwrapApiPayload(res.data)
  } catch {
    return null
  }
}

/** Finalize a production run — posts inventory */
export async function finalizeProductionRun(
  uid: string,
  payload: ProdRunFinalizePayload,
): Promise<TProdRunDetail> {
  const res = await baseApi.post<WrappedPayload<TProdRunDetail>>(
    `/production-runs/${uid}/finalize/`,
    payload,
  )
  return unwrapApiPayload(res.data)
}

/** Vue Query hook — production runs list */
export function useGetProductionRuns(
  params?: MaybeRefOrGetter<{ limit?: number; offset?: number } | undefined>,
) {
  return useApiQuery<TPaginatedResponse<TProdRunListItem>["data"]>({
    url: "/production-runs/",
    params,
    key: "production-runs",
    selectData: true,
  })
}

/** Vue Query hook — production run detail */
export function useGetProductionRunDetail(uid: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ["production-run", uid],
    queryFn: async () => {
      const uidValue = toValue(uid)
      const res = await baseApi.get<WrappedPayload<TProdRunDetail>>(`/production-runs/${uidValue}/`)
      return unwrapApiPayload(res.data)
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: () => !!toValue(uid),
  })
}

/** Vue Query hook — create production run mutation */
export function useCreateProductionRun() {
  return useMutation({
    mutationFn: (payload: ProdRunCreatePayload) => createProductionRun(payload),
  })
}

/** Vue Query hook — finalize production run mutation */
export function useFinalizeProductionRun() {
  return useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: ProdRunFinalizePayload }) =>
      finalizeProductionRun(uid, payload),
  })
}

// ─── Production Run Drawer Composable ────────────────────────────────────────
// All API logic for ProdRunDrawer lives here — the component calls only this.

export type DrawerOutputItem = {
  uid: string
  name: string
  type: "product" | "sub_assembly"
}

export type DrawerRecipe = {
  uid: string
  code: string
  output_quantity: number
  output_unit: string
  output_variant_uid?: string | null
}

export type DrawerIngredientRow = {
  uid: string
  material_uid: string
  name: string
  cost: number
  required: number
  available: number
  used: number
  unit: string
  adjusted: boolean
  editValue: string
  editing: boolean
  is_sufficient: boolean
  estimated_cost: string
}

export type DrawerExpenseRow = {
  id: string
  name: string
  cost: string
}

export type DrawerDraftResult = {
  draftUid: string
  ingredients: DrawerIngredientRow[]
  processCosts: DrawerExpenseRow[]
}

/** Fetch all output items (products + sub-assemblies) for the drawer dropdown */
export async function fetchDrawerOutputItems(): Promise<DrawerOutputItem[]> {
  const items = await fetchOutputItemOptions()
  return items.map((i) => ({
    uid: i.value,
    name: i.label,
    type: i.type as "product" | "sub_assembly",
  }))
}

/** Fetch recipes for a specific output item UID */
export async function fetchDrawerRecipesForItem(itemUid: string): Promise<DrawerRecipe[]> {
  const { results } = await fetchRecipes({ limit: 200, offset: 0 })
  return results
    .filter((r) => r.output_product === itemUid || r.output_raw_material === itemUid)
    .map((r) => ({
      uid: r.uid,
      code: `#RCP-${String(r.uid).slice(0, 7).toUpperCase()}`,
      output_quantity: Number(r.output_quantity),
      output_unit: String(r.output_unit ?? ""),
      output_variant_uid: r.output_variant ?? null,
    }))
}

/** Create a draft production run and hydrate ingredients + process costs from detail */
export async function createDraftAndHydrate(
  payload: ProdRunCreatePayload,
): Promise<DrawerDraftResult> {
  const created = await createProductionRun(payload)

  // Always fetch detail — create response may return empty ingredients_used
  // even when the recipe has ingredients (API populates them async)
  let detail = await fetchProductionRunDetail(created.uid)

  // If detail came back empty, retry once after a short delay
  if (!detail?.ingredients_used?.length && created.uid) {
    await new Promise((r) => setTimeout(r, 800))
    detail = await fetchProductionRunDetail(created.uid)
  }

  const toNum = (v: string | number | null | undefined) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const ingredientSource = detail?.ingredients_used?.length
    ? detail.ingredients_used
    : created.ingredients_used?.length
      ? created.ingredients_used
      : []

  let ingredients: DrawerIngredientRow[] = ingredientSource.map((i: ProdRunIngredientUsed) => ({
    uid: i.uid,
    material_uid: i.material_uid,
    name: i.material_name,
    cost: toNum(i.actual_total_cost),
    required: toNum(i.quantity_required),
    available: toNum(i.available_inventory),
    used: toNum(i.quantity_required),
    unit: String(i.unit ?? ""),
    adjusted: i.is_adjusted ?? false,
    editValue: String(i.quantity_required ?? "0"),
    editing: false,
    is_sufficient: String(i.is_sufficient_inventory).toLowerCase() === "true",
    estimated_cost: String(i.estimated_cost ?? ""),
  }))

  // process_costs_used and ingredients_used may be empty on a fresh draft —
  // fall back to the recipe detail for both
  let processCosts: DrawerExpenseRow[] = (detail?.process_costs_used ?? [])
    .filter((p) => p.name?.trim())
    .map((p) => ({
      id: p.uid,
      name: p.name,
      cost: String(p.cost_per_batch),
    }))

  if (!ingredients.length || !processCosts.length) {
    const recipe = await fetchRecipeDetail(payload.recipe_uid)

    if (!ingredients.length && recipe?.ingredients?.length) {
      // Resolve material names in parallel
      const details = await Promise.all(
        recipe.ingredients.map((i) => getEntityDetail(i.material_uid)),
      )
      ingredients = recipe.ingredients.map((i, idx) => ({
        uid: `rcp-ing-${idx}`,
        material_uid: i.material_uid,
        name: details[idx]?.name || i.material_uid,
        cost: 0,
        required: toNum(i.quantity),
        available: 0,
        used: toNum(i.quantity),
        unit: details[idx]?.unit || "",
        adjusted: false,
        editValue: String(i.quantity ?? "0"),
        editing: false,
        is_sufficient: true,
        estimated_cost: "",
      }))
    }

    if (!processCosts.length && recipe?.process_costs?.length) {
      processCosts = recipe.process_costs.map((p, idx) => ({
        id: `rcp-pc-${idx}`,
        name: p.name,
        cost: String(p.cost_per_batch),
      }))
    }
  }

  return { draftUid: created.uid, ingredients, processCosts }
}

/** Finalize a draft production run */
export async function finalizeDraft(
  uid: string,
  payload: ProdRunFinalizePayload,
): Promise<TProdRunDetail> {
  return finalizeProductionRun(uid, payload)
}
