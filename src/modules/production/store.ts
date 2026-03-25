import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { TRecipes, TRawMaterial } from "./types"
import type { RecipeDetail } from "./api"

type RecipesQuery = {
  search?: string
  ordering?: string
  limit?: number
  offset?: number
  is_active?: boolean
  item_type?: "product" | "sub_assembly"
}

export const useProductionStore = defineStore(
  "production",
  () => {
    // ─── Component / Recipe Selection ─────────────────────────────────────────

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

    // ─── Recipes State ─────────────────────────────────────────────────────────

    const recipes = ref<TRecipes[]>([])
    const recipesCount = ref(0)
    const recipesLoading = ref(false)
    const recipesQuery = ref<RecipesQuery>({ limit: 10, offset: 0 })

    const currentRecipe = ref<RecipeDetail | null>(null)
    const currentRecipeLoading = ref(false)

    const unitsByRecipeUid = ref<Record<string, string>>({})

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

    const setRecipes = (results: TRecipes[], count: number) => {
      recipes.value = results
      recipesCount.value = count
    }

    const setRecipesLoading = (val: boolean) => {
      recipesLoading.value = val
    }

    const setRecipesQuery = (query: RecipesQuery) => {
      recipesQuery.value = { ...recipesQuery.value, ...query }
    }

    const setCurrentRecipe = (recipe: RecipeDetail | null) => {
      currentRecipe.value = recipe
    }

    const setCurrentRecipeLoading = (val: boolean) => {
      currentRecipeLoading.value = val
    }

    const upsertRecipeInList = (updated: TRecipes) => {
      const idx = recipes.value.findIndex((r) => r.uid === updated.uid)
      if (idx !== -1) recipes.value[idx] = updated
    }

    const removeRecipeFromList = (uid: string) => {
      recipes.value = recipes.value.filter((r) => r.uid !== uid)
      recipesCount.value = Math.max(0, recipesCount.value - 1)
      if (currentRecipe.value?.uid && String(currentRecipe.value.uid) === uid) {
        currentRecipe.value = null
      }
    }

    const cacheUnitForRecipe = (recipeUid: string, unit: string) => {
      if (unit) unitsByRecipeUid.value = { ...unitsByRecipeUid.value, [recipeUid]: unit }
    }

    const setCachedOutputItems = (
      items: Array<{ label: string; value: string; type: string; unit?: string }>,
    ) => {
      cachedOutputItems.value = items
      inventoryCachedAt.value = Date.now()
    }

    const setCachedIngredients = (
      items: Array<{
        label: string
        value: string
        unit?: string
        cost_per_unit: number
        kind: "raw_material" | "sub_assembly"
      }>,
    ) => {
      cachedIngredients.value = items
    }

    const invalidateInventoryCache = () => {
      inventoryCachedAt.value = 0
    }

    // ─── Raw Material UI State ─────────────────────────────────────────────────

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
      // Component / Recipe selection
      selectedComponentOption,
      componentLabel,
      componentValue,
      setSelectedComponentOption,
      selectedRecipeOption,
      recipeLabel,
      recipeValue,
      setSelectedRecipeOption,

      // Recipes state
      recipes,
      recipesCount,
      recipesLoading,
      recipesQuery,
      currentRecipe,
      currentRecipeLoading,
      unitsByRecipeUid,
      cachedOutputItems,
      cachedIngredients,
      inventoryCachedAt,

      // State setters
      getRecipeById,
      setRecipes,
      setRecipesLoading,
      setRecipesQuery,
      setCurrentRecipe,
      setCurrentRecipeLoading,
      upsertRecipeInList,
      removeRecipeFromList,
      cacheUnitForRecipe,
      setCachedOutputItems,
      setCachedIngredients,
      invalidateInventoryCache,

      // Raw material UI state
      selectedMaterial,
      showEditDrawer,
      showAdjustStockModal,
      openEditMaterial,
      closeEditMaterial,
      openAdjustStock,
      closeAdjustStock,
    }
  },
  { persist: true },
)
