<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useProductionStore } from "../../store"
import {
  RecipesAPI,
  useDeleteRecipe,
  type RawMaterial,
  type RecipeDetail,
  type RecipeIngredient,
  type RecipeProcessCost,
} from "../../api"
import { formatCurrency } from "@/utils/format-currency"
import { toast } from "@/composables/useToast"
import { useMediaQuery } from "@vueuse/core"

import Icon from "@components/Icon.vue"
import Modal from "@components/Modal.vue"
import PageHeader from "@components/PageHeader.vue"
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import DisableConfirmationModal from "./components/DisableConfirmationModal.vue"
import RecipeTableCard from "./components/RecipeTableCard.vue"
import RecipeIngredientsCard from "./components/RecipeIngredientsCard.vue"
import RecipeProcessCostCard from "./components/RecipeProcessCostsCard.vue"
import RecipesDrawer from "../recipes/components/RecipesDrawer.vue"

type UID = string | number

type RecipeRow = {
  uid: UID
  output_item_name?: string
  output_item?: string
  is_active?: boolean
  updated_at?: string
  subassembly?: boolean
  low_stock?: boolean
  unit?: string | null
  output_unit?: string | null
  item_type?: "product" | "sub_assembly"
  output_product?: string | null
  output_raw_material?: string | null
}

type EntityDetail = {
  name: string
  unit: string
}

type IngredientCardRow = {
  name: string
  qty: string
  cost: number
}

type ProcessCostCardRow = {
  name: string
  cost: number
  note: string
  has_note: boolean
}

type DrawerRecipePayload = {
  uid?: string
  output_item: string
  output_qty: number
  unit: string
  notes: string
  ingredients: { material_uid: string; quantity: number | string }[]
  process_costs: { name?: string; cost_per_batch?: number | string; notes?: string }[]
}

type ApiErrorShape = {
  message?: string
  response?: {
    data?: {
      detail?: string
      message?: string
    }
  }
}

const isMobile = useMediaQuery("(max-width: 1024px)")
const route = useRoute()
const router = useRouter()
const productionStore = useProductionStore()
const { mutateAsync: deleteRecipeMutate } = useDeleteRecipe()

const recipeId = computed(() => String(route.params.id ?? ""))

const rawMaterialsList = ref<RawMaterial[]>([])
const recipeDetailState = ref<RecipeDetail | null>(null)
const rawDetailUnit = ref("")
const ingredientDetailsCache = ref<Record<string, EntityDetail>>({})

const showRecipeNoteModal = ref(false)
const recipeNoteText = ref("")
const showProcessNoteModal = ref(false)
const manageOpen = ref(false)
const manageRoot = ref<HTMLElement | null>(null)
const showDrawer = ref(false)
const drawerMode = ref<"create" | "edit">("create")
const drawerRecipe = ref<DrawerRecipePayload | null>(null)
const showDisableModal = ref(false)
const showDeleteModal = ref(false)
const deleting = ref(false)

const getErrorMessage = (err: ApiErrorShape | Error | null | undefined): string => {
  if (!err) return "Something went wrong"

  if ("message" in err && typeof err.message === "string" && err.message.trim()) {
    return err.message
  }

  const responseData = "response" in err ? err.response?.data : undefined
  if (responseData?.detail) return responseData.detail
  if (responseData?.message) return responseData.message

  return "Something went wrong"
}

const toStringSafe = (v: string | number | null | undefined, fallback = ""): string => {
  if (typeof v === "string") return v
  if (typeof v === "number") return String(v)
  return fallback
}

const toNumberSafe = (v: string | number | null | undefined, fallback = 0): number => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN
  return Number.isFinite(n) ? n : fallback
}

const formatQty = (value: string | number | null | undefined): string => {
  if (value == null || value === "") return ""
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return String(value)
  return n.toString()
}

const formatDateOnly = (value?: string | null): string => {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10)
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)
}

const formatDateTime = (value?: string | null): string => {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

const formatMoney = (value?: number | string | null): string => {
  if (value == null || value === "") return "—"
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return "—"
  return formatCurrency(n)
}

const rawMaterialsById = computed<Record<string, RawMaterial>>(() => {
  return rawMaterialsList.value.reduce<Record<string, RawMaterial>>((acc, m) => {
    acc[String(m.uid)] = m
    return acc
  }, {})
})

const recipeFromList = computed<RecipeRow | null>(() => {
  const recipe = productionStore.getRecipeById(recipeId.value) as RecipeRow | undefined
  return recipe ?? null
})

const recipeDetail = computed<RecipeDetail | null>(() => recipeDetailState.value)
const headerRecipe = computed<RecipeDetail | null>(() => recipeDetail.value)

const fetchIngredientDetail = async (uid: string): Promise<EntityDetail> => {
  const cached = ingredientDetailsCache.value[uid]
  if (cached) return cached

  const result = await RecipesAPI.getEntityDetail(uid)
  ingredientDetailsCache.value = {
    ...ingredientDetailsCache.value,
    [uid]: result,
  }
  return result
}

const hydrateIngredients = async () => {
  const ingredients = recipeDetailState.value?.ingredients ?? []
  const missingIds = ingredients
    .map((ingredient: RecipeIngredient) => String(ingredient.material_uid ?? ""))
    .filter((uid) => uid && !rawMaterialsById.value[uid] && !ingredientDetailsCache.value[uid])

  await Promise.all(missingIds.map((uid) => fetchIngredientDetail(uid)))
}

const fetchUnitFromProduct = async (productUid: string): Promise<string> => {
  return RecipesAPI.getEntityUnit(productUid)
}

const fetchRecipeDetail = async (uid: string) => {
  if (!uid) return

  try {
    const detail = await RecipesAPI.getByUid(uid)
    recipeDetailState.value = detail

    if (!detail) return

    const productUid = String(
      detail.output_product ?? detail.output_raw_material ?? detail.output_item ?? "",
    ).trim()

    let unit =
      String(recipeFromList.value?.output_unit ?? "").trim() ||
      String(detail.output_unit ?? detail.unit ?? "").trim()

    if (!unit && productUid) {
      unit = await fetchUnitFromProduct(productUid)
    }

    rawDetailUnit.value = unit
    await hydrateIngredients()
  } catch (err) {
    toast.error(getErrorMessage(err as ApiErrorShape | Error))
  }
}

const fetchRawMaterials = async () => {
  try {
    const response = await RecipesAPI.listRawMaterials({ limit: 500, offset: 0 })
    rawMaterialsList.value = response
  } catch (err) {
    toast.error(getErrorMessage(err as ApiErrorShape | Error))
  }
}

watch(recipeId, (uid) => void fetchRecipeDetail(uid), { immediate: true })

onMounted(async () => {
  await fetchRawMaterials()
  document.addEventListener("click", onDocClick, true)
  document.addEventListener("keydown", onKeyDown, true)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick, true)
  document.removeEventListener("keydown", onKeyDown, true)
})

const goBack = () => router.push("/recipes")

const statusText = computed(() => (headerRecipe.value?.is_active ? "Active" : "Disabled"))
const statusPillClass = computed(() =>
  headerRecipe.value?.is_active
    ? "bg-green-50 text-green-700 border border-green-200"
    : "bg-red-50 text-red-700 border border-red-200",
)

const isSubAssemblyRecipe = computed(() => {
  const detail = recipeDetail.value
  const row = recipeFromList.value

  return (
    row?.item_type === "sub_assembly" ||
    detail?.item_type === "sub_assembly" ||
    (!!detail?.output_raw_material && !detail?.output_product) ||
    (!!row?.output_raw_material && !row?.output_product)
  )
})

const subassemblyPillClass = computed(() =>
  isSubAssemblyRecipe.value
    ? "bg-purple-50 text-purple-700 border border-purple-200"
    : "bg-core-50 text-core-600 border border-core-200",
)

const lowStockPillClass = computed(() =>
  recipeFromList.value?.low_stock
    ? "bg-warning-50 text-warning-700 border border-warning-200"
    : "bg-core-50 text-core-600 border border-core-200",
)

const outputQuantityText = computed(() => {
  const qty = headerRecipe.value?.output_quantity
  if (qty == null || qty === "") return "—"

  const unit =
    String(recipeFromList.value?.output_unit ?? "").trim() ||
    rawDetailUnit.value ||
    String(headerRecipe.value?.output_unit ?? "").trim() ||
    String(headerRecipe.value?.unit ?? "").trim() ||
    String(recipeFromList.value?.unit ?? "").trim()

  return unit ? `${formatQty(qty)} ${unit}` : formatQty(qty)
})

const quantityPillClass = "bg-blue-50 text-blue-700 border border-blue-200"
const estimatedCostPerBatch = computed(() => headerRecipe.value?.estimated_cost_per_batch ?? null)

const ingredientRows = computed<IngredientCardRow[]>(() => {
  const detail = headerRecipe.value
  if (!detail?.ingredients?.length) return []

  return detail.ingredients.map((ingredient: RecipeIngredient) => {
    const uid = String(ingredient.material_uid)
    const rawMaterial = rawMaterialsById.value[uid]
    const cached = ingredientDetailsCache.value[uid]

    const name = rawMaterial?.name ?? cached?.name ?? uid
    const unit = rawMaterial?.unit ?? cached?.unit ?? ""
    const qty = unit ? `${ingredient.quantity} ${unit}` : String(ingredient.quantity)
    const cost = toNumberSafe(rawMaterial?.last_cost ?? rawMaterial?.average_cost ?? 0, 0)

    return {
      name: String(name),
      qty,
      cost,
    }
  })
})

const processCostRows = computed<ProcessCostCardRow[]>(() => {
  const detail = headerRecipe.value
  if (!detail?.process_costs?.length) return []

  return detail.process_costs.map((process: RecipeProcessCost) => {
    const note = toStringSafe(process.notes ?? "", "")
    return {
      name: toStringSafe(process.name ?? "", "Process cost"),
      cost: toNumberSafe(process.cost_per_batch, 0),
      note,
      has_note: !!note.trim(),
    }
  })
})

const noteLines = computed(() => {
  const raw = recipeNoteText.value.trim()
  if (!raw) return []
  return raw
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
})

const hasNote = computed(() => recipeNoteText.value.trim().length > 0)

const openRecipeNote = (note?: string | null) => {
  recipeNoteText.value = String(note ?? "").trim()
  showRecipeNoteModal.value = true
}

const closeRecipeNote = () => {
  showRecipeNoteModal.value = false
  recipeNoteText.value = ""
}

const processNoteRows = computed(() => processCostRows.value.filter((row) => row.has_note))

const openProcessNote = () => {
  showProcessNoteModal.value = true
}

const closeProcessNote = () => {
  showProcessNoteModal.value = false
}

const closeManage = () => {
  manageOpen.value = false
}

const toggleManage = () => {
  manageOpen.value = !manageOpen.value
}

const onDocClick = (e: MouseEvent) => {
  if (!manageOpen.value) return
  if (showDeleteModal.value || showDisableModal.value || showDrawer.value) return

  const root = manageRoot.value
  if (!root) return

  const target = e.target as Node
  if (root.contains(target)) return
  closeManage()
}

const onKeyDown = (e: KeyboardEvent) => {
  if (!manageOpen.value) return
  if (e.key === "Escape") closeManage()
}

const openEditDrawer = () => {
  const detail = headerRecipe.value
  if (!detail) return

  drawerMode.value = "edit"
  drawerRecipe.value = {
    uid: detail.uid,
    output_item: String(detail.output_product ?? detail.output_raw_material ?? ""),
    output_qty: Number(detail.output_quantity ?? 0),
    unit:
      String(detail.output_unit ?? "") ||
      String(detail.unit ?? "") ||
      String(recipeFromList.value?.output_unit ?? "") ||
      rawDetailUnit.value ||
      String(recipeFromList.value?.unit ?? ""),
    notes: String(detail.notes ?? ""),
    ingredients: Array.isArray(detail.ingredients)
      ? detail.ingredients.map((item: RecipeIngredient) => ({
          material_uid: item.material_uid,
          quantity: item.quantity,
        }))
      : [],
    process_costs: Array.isArray(detail.process_costs)
      ? detail.process_costs.map((item: RecipeProcessCost) => ({
          name: item.name,
          cost_per_batch: item.cost_per_batch,
          notes: item.notes,
        }))
      : [],
  }

  showDrawer.value = true
}

const openDuplicateDrawer = () => {
  const detail = headerRecipe.value
  if (!detail) return

  drawerMode.value = "create"
  drawerRecipe.value = {
    output_item: String(detail.output_product ?? detail.output_raw_material ?? ""),
    output_qty: Number(detail.output_quantity ?? 0),
    unit:
      String(detail.output_unit ?? "") ||
      String(detail.unit ?? "") ||
      String(recipeFromList.value?.output_unit ?? "") ||
      rawDetailUnit.value ||
      String(recipeFromList.value?.unit ?? ""),
    notes: String(detail.notes ?? ""),
    ingredients: Array.isArray(detail.ingredients)
      ? detail.ingredients.map((item: RecipeIngredient) => ({
          material_uid: item.material_uid,
          quantity: item.quantity,
        }))
      : [],
    process_costs: Array.isArray(detail.process_costs)
      ? detail.process_costs.map((item: RecipeProcessCost) => ({
          name: item.name,
          cost_per_batch: item.cost_per_batch,
          notes: item.notes,
        }))
      : [],
  }

  showDrawer.value = true
}

const onDrawerClosed = () => {
  showDrawer.value = false
  drawerRecipe.value = null
}

const onDisableRecipeClick = () => {
  manageOpen.value = false
  nextTick(() => {
    showDisableModal.value = true
  })
}

const patchLocalStoreIsActive = (uid: string, isActive: boolean) => {
  const recipes = productionStore.recipes as RecipeRow[]
  const recipeIndex = recipes.findIndex((recipe) => String(recipe.uid) === uid)

  if (recipeIndex >= 0) {
    recipes[recipeIndex] = {
      ...recipes[recipeIndex],
      is_active: isActive,
    }
  }

  if (recipeDetailState.value && String(recipeDetailState.value.uid) === uid) {
    recipeDetailState.value = {
      ...recipeDetailState.value,
      is_active: isActive,
    }
  }
}

const confirmDisable = async () => {
  const detail = headerRecipe.value
  if (!detail?.uid) return

  deleting.value = true
  try {
    await RecipesAPI.setActive(String(detail.uid), false)
    patchLocalStoreIsActive(String(detail.uid), false)
    toast.success("Recipe disabled")
    showDisableModal.value = false
    await fetchRecipeDetail(String(detail.uid))
  } catch (err) {
    toast.error(getErrorMessage(err as ApiErrorShape | Error))
  } finally {
    deleting.value = false
  }
}

const onDeleteRecipe = () => {
  manageOpen.value = false
  nextTick(() => {
    showDeleteModal.value = true
  })
}

const confirmDelete = async () => {
  const uid = String(recipeId.value ?? "")
  if (!uid) return

  deleting.value = true
  try {
    await deleteRecipeMutate(uid)
    toast.success("Recipe deleted")
    showDeleteModal.value = false
    router.push("/recipes")
  } catch (err) {
    toast.error(getErrorMessage(err as ApiErrorShape | Error))
  } finally {
    deleting.value = false
  }
}

const onEditRecipe = () => {
  manageOpen.value = false
  nextTick(() => openEditDrawer())
}

const onDuplicateRecipe = () => {
  manageOpen.value = false
  nextTick(() => openDuplicateDrawer())
}

const onDisableRecipe = () => onDisableRecipeClick()

const confirmEnable = async () => {
  const detail = headerRecipe.value
  if (!detail?.uid) return

  deleting.value = true
  try {
    await RecipesAPI.setActive(String(detail.uid), true)
    patchLocalStoreIsActive(String(detail.uid), true)
    toast.success("Recipe enabled")
    showDisableModal.value = false
    await fetchRecipeDetail(String(detail.uid))
  } catch (err) {
    toast.error(getErrorMessage(err as ApiErrorShape | Error))
  } finally {
    deleting.value = false
  }
}

const onEnableRecipe = () => {
  manageOpen.value = false
  nextTick(() => confirmEnable())
}

const onUpdated = () => {
  toast.success("Recipe updated")
  onDrawerClosed()
  void fetchRecipeDetail(recipeId.value)
}

const selectedComponent = computed(() => productionStore.selectedRecipeOption)

const onCreated = (created: { uid?: string }) => {
  const uid = String(created.uid ?? "")
  toast.success("Recipe created")
  onDrawerClosed()
  if (uid) router.push(`/recipes/${uid}`)
}
</script>

<template>
  <div class="px-3 pb-10 md:px-6 md:py-6">
    <div v-if="isMobile" class="pt-1 pb-1">
      <PageHeader title="Recipe Details" :show-tutorial="true" :inner="true" />

      <div class="mb-6 px-1 pt-4">
        <div class="flex items-start justify-between gap-3">
          <h1 class="text-xl font-semibold text-gray-900">
            {{ headerRecipe?.output_item_name || recipeFromList?.output_item_name || "Recipe" }}
          </h1>

          <div ref="manageRoot" class="relative" data-no-row-click @click.stop @mousedown.stop>
            <button
              type="button"
              class="inline-flex size-10 items-center justify-center rounded-xl bg-[#F5EDE4] text-gray-700"
              @click="toggleManage"
              aria-label="Manage recipe"
            >
              <span class="text-xl leading-none">⋮</span>
            </button>

            <div
              v-if="manageOpen"
              class="absolute right-0 z-50 mt-2 w-[280px] overflow-hidden rounded-2xl bg-white shadow-xl"
            >
              <template v-if="headerRecipe?.is_active">
                <button
                  type="button"
                  class="flex w-full items-center gap-4 px-5 py-5 text-left text-sm font-semibold text-gray-800"
                  @click="onEditRecipe"
                >
                  <Icon name="edit" size="18" class="text-gray-600" />
                  <span>Edit recipe</span>
                </button>

                <button
                  type="button"
                  class="flex w-full items-center gap-4 px-5 py-5 text-left text-sm font-semibold text-gray-800"
                  @click="onDuplicateRecipe"
                >
                  <Icon name="copy" size="18" class="text-gray-600" />
                  <span>Duplicate recipe</span>
                </button>

                <button
                  type="button"
                  class="flex w-full items-center gap-4 px-5 py-5 text-left text-sm font-semibold text-gray-800"
                  @click="onDisableRecipe"
                >
                  <Icon name="disable" size="18" class="text-gray-600" />
                  <span>Disable recipe</span>
                </button>
              </template>

              <template v-else>
                <button
                  type="button"
                  class="flex w-full items-center gap-4 px-5 py-5 text-left text-sm font-semibold text-gray-800"
                  @click="onEnableRecipe"
                >
                  <Icon name="check-circle" size="18" class="text-gray-600" />
                  <span>Enable recipe</span>
                </button>
              </template>

              <div class="h-px w-full bg-gray-200" />

              <button
                type="button"
                class="flex w-full items-center gap-4 px-5 py-5 text-left text-sm font-semibold text-red-600"
                @click="onDeleteRecipe"
              >
                <Icon name="trash" size="18" class="text-red-500" />
                <span>Delete recipe</span>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <span
            v-if="outputQuantityText !== '—'"
            class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
          >
            {{ outputQuantityText }}
          </span>

          <span
            v-if="isSubAssemblyRecipe"
            class="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
          >
            Sub-assembly
          </span>
        </div>

        <p class="mt-3 text-sm text-gray-500">
          Last edited:
          <span class="font-semibold text-gray-800">
            {{ formatDateOnly(headerRecipe?.updated_at ?? recipeFromList?.updated_at ?? null) }}
          </span>
        </p>
      </div>

      <div class="my-6 h-px bg-gray-100" />

      <RecipeIngredientsCard :rows="ingredientRows" />

      <RecipeProcessCostCard
        class="mt-5"
        :process-costs="processCostRows"
        :note="headerRecipe?.notes"
        @view-note="openProcessNote"
      />
    </div>

    <div v-else>
      <div class="mb-6 flex items-center justify-between">
        <button
          type="button"
          class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          @click="goBack"
        >
          <span class="text-lg"><Icon name="arrow-left" size="18" /></span>
        </button>

        <div ref="manageRoot" class="relative">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-[#FDBA74] bg-white px-4 py-2 text-sm font-semibold text-[#9A3412] hover:bg-[#FFF7ED]"
            @click="toggleManage"
          >
            <span>Manage {{ selectedComponent?.value }}</span>
            <span class="text-lg">⋮</span>
          </button>

          <div
            v-if="manageOpen"
            class="absolute right-0 z-50 mt-1 w-[300px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
          >
            <template v-if="headerRecipe?.is_active">
              <button
                type="button"
                class="flex w-full items-center gap-4 px-5 py-4 text-left text-base font-semibold text-[#6B5B57] hover:bg-gray-50"
                @click="onEditRecipe"
              >
                <Icon name="edit" size="18" class="text-[#6B5B57]" />
                <span>Edit recipe</span>
              </button>

              <button
                type="button"
                class="flex w-full items-center gap-4 px-5 py-5 text-left text-base font-semibold text-[#6B5B57] hover:bg-gray-50"
                @click="onDuplicateRecipe"
              >
                <Icon name="copy" size="18" class="text-[#6B5B57]" />
                <span>Duplicate recipe</span>
              </button>

              <button
                type="button"
                class="flex w-full items-center gap-4 px-5 py-4 text-left text-base font-semibold text-[#6B5B57] hover:bg-gray-50"
                @click="onDisableRecipe"
              >
                <Icon name="disable" size="18" class="text-[#6B5B57]" />
                <span>Disable recipe</span>
              </button>
            </template>

            <template v-else>
              <button
                type="button"
                class="flex w-full items-center gap-4 px-5 py-4 text-left text-base font-semibold text-[#6B5B57] hover:bg-gray-50"
                @click="onEnableRecipe"
              >
                <Icon name="check-circle" size="18" class="text-[#6B5B57]" />
                <span>Enable recipe</span>
              </button>
            </template>

            <div class="h-px w-full bg-gray-200" />

            <button
              type="button"
              class="flex w-full items-center gap-4 px-5 py-4 text-left text-base font-semibold text-[#B42318] hover:bg-red-50"
              @click="onDeleteRecipe"
            >
              <Icon name="trash" size="18" class="text-[#B42318]" />
              <span>Delete recipe</span>
            </button>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ headerRecipe?.output_item_name || recipeFromList?.output_item_name || "Recipe" }}
        </h1>

        <div class="mt-2 flex flex-col flex-wrap gap-2">
          <div class="flex flex-wrap gap-2">
            <span
              v-if="outputQuantityText !== '—'"
              class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
              :class="quantityPillClass"
            >
              {{ outputQuantityText }}
            </span>

            <span
              v-if="isSubAssemblyRecipe"
              class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
              :class="subassemblyPillClass"
            >
              Sub-assembly
            </span>

            <span
              class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
              :class="statusPillClass"
            >
              {{ statusText }}
            </span>

            <span
              v-if="recipeFromList?.low_stock"
              class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
              :class="lowStockPillClass"
            >
              Low stock
            </span>
          </div>

          <span class="text-sm text-gray-500">
            Last edited:
            <span class="font-medium text-gray-700">
              {{ formatDateOnly(headerRecipe?.updated_at ?? recipeFromList?.updated_at ?? null) }}
            </span>
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <RecipeTableCard
          title="Estimated Cost per Batch"
          :value="formatMoney(estimatedCostPerBatch)"
          icon="bag"
        />

        <RecipeTableCard
          title="Last Used in Production"
          :value="formatDateTime(headerRecipe?.updated_at ?? null)"
          icon="bag"
        />
      </div>

      <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecipeIngredientsCard :rows="ingredientRows" />
        <RecipeProcessCostCard
          :process-costs="processCostRows"
          :note="headerRecipe?.notes"
          @view-note="openRecipeNote"
        />
      </div>
    </div>

    <RecipesDrawer
      v-model:open="showDrawer"
      :mode="drawerMode"
      :recipe="drawerRecipe"
      @close="onDrawerClosed"
      @updated="onUpdated"
      @created="(r) => onCreated(r as { uid?: string })"
      @refresh="() => {}"
    />

    <Modal :open="showRecipeNoteModal" title="Recipe Note" max-width="lg" @close="closeRecipeNote">
      <div class="space-y-4 rounded-2xl bg-gray-50 text-sm text-gray-800">
        <template v-if="hasNote">
          <p v-for="(line, i) in noteLines" :key="i" class="pb-5">{{ line }}</p>
        </template>
        <template v-else>
          <p class="text-gray-500">No notes.</p>
        </template>
      </div>
    </Modal>

    <Teleport to="body">
      <Transition name="sheet">
        <div
          v-if="showRecipeNoteModal && isMobile"
          class="fixed inset-0 z-50 flex flex-col justify-end"
        >
          <div class="absolute inset-0 bg-black/40" @click="closeRecipeNote" />

          <div class="relative rounded-t-3xl bg-white px-5 pt-5 pb-10 shadow-2xl">
            <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />

            <div class="mb-5 flex items-center justify-between">
              <h2 class="text-base font-semibold text-gray-900">Recipe Note</h2>
              <button
                type="button"
                class="flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
                @click="closeRecipeNote"
              >
                <Icon name="x" size="16" />
              </button>
            </div>

            <div class="space-y-3">
              <template v-if="hasNote">
                <p
                  v-for="(line, i) in noteLines"
                  :key="i"
                  class="text-sm leading-relaxed text-gray-700"
                >
                  {{ line }}
                </p>
              </template>
              <p v-else class="text-sm text-gray-400">No notes for this recipe.</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="sheet">
        <div
          v-if="showProcessNoteModal && isMobile"
          class="fixed inset-0 z-50 flex flex-col justify-end"
        >
          <div class="absolute inset-0 bg-black/40" @click="closeProcessNote" />

          <div class="relative rounded-t-3xl bg-white px-5 pt-5 pb-10 shadow-2xl">
            <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />

            <div class="mb-5 flex items-center justify-between">
              <h2 class="text-base font-semibold text-gray-900">Process Note</h2>
              <button
                type="button"
                class="flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
                @click="closeProcessNote"
              >
                <Icon name="x" size="16" />
              </button>
            </div>

            <div class="space-y-4">
              <template v-if="processNoteRows.length">
                <div
                  v-for="(row, idx) in processNoteRows"
                  :key="idx"
                  class="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div class="mb-2 flex items-center justify-between gap-3">
                    <p class="text-sm font-semibold text-gray-900">{{ row.name }}</p>
                    <p class="text-sm font-semibold text-gray-900">{{ formatMoney(row.cost) }}</p>
                  </div>
                  <p class="text-sm leading-relaxed text-gray-500">{{ row.note }}</p>
                </div>
              </template>
              <p v-else class="text-sm text-gray-400">No process notes.</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <DisableConfirmationModal
      v-model="showDisableModal"
      :loading="deleting"
      @confirm="confirmDisable"
    />

    <DeleteConfirmationModal
      :modelValue="showDeleteModal"
      header="Delete recipe"
      :loading="deleting"
      max-width="md"
      @close="showDeleteModal = false"
      @update:modelValue="showDeleteModal = false"
      @confirm="confirmDelete"
    >
      <div class="space-y-2">
        <p class="text-sm text-gray-700">
          This will permanently delete the recipe. You cannot undo this.
        </p>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            :disabled="deleting"
            @click.stop.prevent="showDeleteModal = false"
          >
            Cancel
          </button>

          <button
            type="button"
            class="flex-1 rounded-xl bg-red-600 px-4 py-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            :disabled="deleting"
            @click.stop.prevent="confirmDelete"
          >
            {{ deleting ? "Deleting..." : "Delete" }}
          </button>
        </div>
      </template>
    </DeleteConfirmationModal>
  </div>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-enter-active .relative,
.sheet-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .relative,
.sheet-leave-to .relative {
  transform: translateY(100%);
}
</style>
