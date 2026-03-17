import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { TRecipes } from "./types"
import {
  RecipesAPI,
  type TRecipes as RecipesListItem,
  type RecipeCreatePayload,
  type RecipePatchPayload,
  type RecipeDetail,
  type InventoryProduct,
  type RawMaterial,
} from "./recipes.api"
import { TRawMaterial } from "./types"

type RecipesQuery = {
  search?: string
  ordering?: string
  limit?: number
  offset?: number
  is_active?: boolean
  item_type?: "product" | "sub_assembly"
}

const unwrapPaginated = <T>(res: unknown): { count: number; results: T[] } => {
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

const mapListItem = (item: RecipesListItem): TRecipes => ({
  uid: String(item.uid),
  output_item_name: String(item.output_item_name ?? ""),
  item_type: item.item_type === "sub_assembly" ? "sub_assembly" : "product",
  output_quantity: item.output_quantity,
  producible_quantity: item.producible_quantity,
  ingredient_count: item.ingredient_count,
  process_cost_count: item.process_cost_count,
  is_active: Boolean(item.is_active),
  updated_at: String(item.updated_at ?? ""),
  // preserve output UIDs so unit hydration can look them up in inventory
  output_product: item.output_product ?? null,
  output_raw_material: item.output_raw_material ?? null,
})

export const useProductionStore = defineStore(
  "production",
  () => {
    const selectedComponentOption = ref<{ label: string; value: string } | null>(null)
    const componentLabel = computed(() => selectedComponentOption.value?.label || "")
    const componentValue = computed(() => selectedComponentOption.value?.value || "")

    const setSelectedComponentOption = (option: { label: string; value: string }) => {
      selectedComponentOption.value = option
    }
    const selectedRecipeOption = ref<{ label: string; value: string } | null>(null)
    const recipeLabel = computed(() => selectedRecipeOption.value?.label || "")
    const recipeValue = computed(() => selectedRecipeOption.value?.value || "")

    const setSelectedRecipeOption = (option: { label: string; value: string }) => {
      selectedRecipeOption.value = option
    }

    const recipes = ref<TRecipes[]>([])
    const recipesCount = ref(0)
    const recipesLoading = ref(false)
    const recipesQuery = ref<RecipesQuery>({ limit: 10, offset: 0 })

    const currentRecipe = ref<RecipeDetail | null>(null)
    const currentRecipeLoading = ref(false)

    // Persisted unit cache: recipeUid → unit string
    const unitsByRecipeUid = ref<Record<string, string>>({})

    // Persisted output item + ingredient caches for drawer
    const cachedOutputItems = ref<
      Array<{ label: string; value: string; type: string; unit?: string }>
    >([])
    const cachedIngredients = ref<
      Array<{
        label: string
        value: string
        unit?: string
        cost_per_unit: number
        kind: "raw_material" | "sub_assembly"
      }>
    >([])
    const inventoryCachedAt = ref<number>(0)

    const getRecipeById = (id: string) => recipes.value.find((r) => r.uid === id) || null

    const fetchRecipes = async (query?: RecipesQuery) => {
      recipesLoading.value = true
      try {
        const merged = { ...recipesQuery.value, ...(query || {}) }
        recipesQuery.value = merged
        const res = await RecipesAPI.list(merged)
        const { count, results } = unwrapPaginated<RecipesListItem>(res)
        recipes.value = results.map(mapListItem)
        recipesCount.value = count
      } finally {
        recipesLoading.value = false
      }
    }

    const createRecipe = async (payload: RecipeCreatePayload) => {
      const createdRes = await RecipesAPI.create(payload)
      await fetchRecipes(recipesQuery.value)
      return createdRes && typeof createdRes === "object" && "data" in createdRes
        ? (createdRes as { data: unknown }).data
        : createdRes
    }

    // Accepts full RecipePatchPayload so is_active toggling works alongside field updates
    const patchRecipe = async (uid: string, payload: RecipePatchPayload) => {
      const updatedRes = await RecipesAPI.partialUpdate(uid, payload)
      await fetchRecipes(recipesQuery.value)
      return updatedRes && typeof updatedRes === "object" && "data" in updatedRes
        ? (updatedRes as { data: unknown }).data
        : updatedRes
    }

    const fetchRecipeDetail = async (uid: string) => {
      currentRecipeLoading.value = true
      try {
        const res = await RecipesAPI.getByUid(uid)
        const detail =
          res && typeof res === "object" && "data" in res
            ? (res as { data: RecipeDetail }).data
            : (res as RecipeDetail)
        currentRecipe.value = detail
        return detail
      } finally {
        currentRecipeLoading.value = false
      }
    }

    const deleteRecipe = async (uid: string) => {
      await RecipesAPI.remove(uid)
      recipes.value = recipes.value.filter((r) => r.uid !== uid)
      recipesCount.value = Math.max(0, recipesCount.value - 1)
      if (currentRecipe.value?.uid && String(currentRecipe.value.uid) === uid)
        currentRecipe.value = null
    }

    const fetchInventoryProducts = async (
      params?: Record<string, string | number | boolean>,
    ): Promise<InventoryProduct[]> => {
      return RecipesAPI.listInventoryProducts(params)
    }

    const fetchRawMaterials = async (
      params?: Record<string, string | number | boolean>,
    ): Promise<RawMaterial[]> => {
      return RecipesAPI.listRawMaterials(params)
    }

    // Fetches all output items for the recipe drawer dropdown.
    // Products come from /inventory/products/, sub-assemblies from /raw-materials/.
    // We fetch all raw-materials (no filter) and use is_sub_assembly on each item to set type.
    // Sub-assembly UIDs are excluded from inventory products to prevent duplicates.
    const fetchOutputItemOptions = async (): Promise<
      Array<{ label: string; value: string; type: string; unit?: string }>
    > => {
      const [products, rawMaterials] = await Promise.all([
        RecipesAPI.listInventoryProducts({ limit: 500, offset: 0 }),
        RecipesAPI.listRawMaterials({ limit: 500, offset: 0 }),
      ])

      const subAssemblyUids = new Set(
        rawMaterials.filter((m) => m.is_sub_assembly).map((m) => m.uid),
      )

      const productOptions = products
        .filter((x) => x.uid && x.name && !subAssemblyUids.has(x.uid))
        .map((x) => ({
          label: x.name.trim(),
          value: x.uid,
          type: "product",
          unit: x.unit?.trim() || undefined,
        }))

      const subAssemblyOptions = rawMaterials
        .filter((m) => m.uid && m.name && m.is_sub_assembly)
        .map((m) => ({
          label: m.name.trim(),
          value: m.uid,
          type: "sub_assembly",
          unit: m.unit?.trim() || undefined,
        }))

      return [...productOptions, ...subAssemblyOptions]
    }

    const getEntityUnit = async (uid: string): Promise<string> => {
      return RecipesAPI.getEntityUnit(uid)
    }

    const cacheUnitForRecipe = (recipeUid: string, unit: string) => {
      if (unit) unitsByRecipeUid.value = { ...unitsByRecipeUid.value, [recipeUid]: unit }
    }

    const invalidateInventoryCache = () => {
      inventoryCachedAt.value = 0
    }

    const selectedMaterial = ref<TRawMaterial | null>(null)
    const showEditDrawer = ref(false)
    const showAdjustStockModal = ref(false)

    const openEditMaterial = (material: TRawMaterial) => {
      selectedMaterial.value = material
      showEditDrawer.value = true
    }

    const closeEditMaterial = () => {
      selectedMaterial.value = null
      showEditDrawer.value = false
    }

    const openAdjustStock = (material: TRawMaterial) => {
      selectedMaterial.value = material
      showAdjustStockModal.value = true
    }

    const closeAdjustStock = () => {
      selectedMaterial.value = null
      showAdjustStockModal.value = false
    }

    return {
      selectedComponentOption,
      componentLabel,
      componentValue,
      setSelectedComponentOption,
      selectedMaterial,
      showEditDrawer,
      showAdjustStockModal,
      openEditMaterial,
      closeEditMaterial,
      openAdjustStock,
      closeAdjustStock,
      selectedRecipeOption,
      recipeLabel,
      recipeValue,
      setSelectedRecipeOption,
      recipes,
      recipesCount,
      recipesLoading,
      recipesQuery,
      currentRecipe,
      currentRecipeLoading,
      fetchRecipes,
      createRecipe,
      patchRecipe,
      fetchRecipeDetail,
      deleteRecipe,
      getRecipeById,
      fetchInventoryProducts,
      fetchRawMaterials,
      fetchOutputItemOptions,
      getEntityUnit,

      unitsByRecipeUid,
      cacheUnitForRecipe,
      cachedOutputItems,
      cachedIngredients,
      inventoryCachedAt,
      invalidateInventoryCache,
    }
  },
  { persist: true },
)
