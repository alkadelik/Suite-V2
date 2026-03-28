<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue"
import { useMediaQuery } from "@vueuse/core"
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import Icon from "@components/Icon.vue"
import { toast } from "@/composables/useToast"
import {
  fetchDrawerOutputItems,
  fetchDrawerRecipesForItem,
  createDraftAndHydrate,
  finalizeDraft,
  fetchProductionRunDetail,
  fetchRecipeDetail,
  getEntityDetail,
  type DrawerOutputItem,
  type DrawerRecipe,
  type DrawerIngredientRow,
  type DrawerExpenseRow,
} from "@modules/production/api"
import type {
  ProdRunCreatePayload,
  ProdRunFinalizePayload,
  TProdRunDetail,
  ProdRunIngredientUsed,
  ProdRunProcessCostUsed,
} from "@modules/production/types"

// ── Local-only types ───────────────────────────────────────────────────────────

type Variant = { uid: string; name: string; group: string }

export type ProductionRunData = {
  uid?: string
  output_item_uid?: string
  output_item_name?: string
  recipe_uid?: string
  quantity_produced?: number
  quantity_damaged?: number
  selling_price?: string
}

// ── Props / Emits ──────────────────────────────────────────────────────────────

const props = defineProps<{
  open: boolean
  mode?: "create" | "edit"
  run?: Partial<ProductionRunData> | null
}>()

const emit = defineEmits<{
  (e: "update:open", v: boolean): void
  (e: "close"): void
  (e: "saved", run: TProdRunDetail): void
}>()

// ── Mode ───────────────────────────────────────────────────────────────────────

const isEditMode = computed(() => props.mode === "edit" && !!props.run)
const drawerTitle = computed(() => (isEditMode.value ? "Edit Run" : "Create Run"))

// ── Responsive ─────────────────────────────────────────────────────────────────

const isMobile = useMediaQuery("(max-width: 1024px)")

// ── Step state ─────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4
const activeStep = ref(0)
const draftUid = ref<string | null>(null)
const isSubmitting = ref(false)

const stepCircleClass = (index: number) => {
  if (activeStep.value > index) return "bg-[#D97706] text-white border border-[#D97706]"
  if (activeStep.value === index) return "bg-[#111827] text-white border border-[#111827]"
  return "bg-white text-gray-500 border border-gray-300"
}

const stepLineClass = (afterIndex: number) =>
  activeStep.value > afterIndex ? "bg-[#D97706]" : "bg-gray-200"

// ── Output items ───────────────────────────────────────────────────────────────

const outputItems = ref<DrawerOutputItem[]>([])
const loadingOutputItems = ref(false)

// ── Recipes (keyed by output item UID) ─────────────────────────────────────────

const recipesMap = ref<Record<string, DrawerRecipe[]>>({})
const loadingRecipes = ref(false)

// ── Variants (API not yet available) ──────────────────────────────────────────

const MOCK_VARIANTS: Record<string, Variant[]> = {}

// ── Ingredients ────────────────────────────────────────────────────────────────

const ingredients = ref<DrawerIngredientRow[]>([])
const loadingIngredients = ref(false)

const estimatedCost = computed(() => ingredients.value.reduce((sum, r) => sum + r.cost, 0))

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

const insufficientRows = computed(() => ingredients.value.filter((r) => r.available < r.required))
const hasInsufficient = computed(() => insufficientRows.value.length > 0)

// ── Quick Adjust ───────────────────────────────────────────────────────────────

const quickAdjustOpen = ref(false)
const quickAdjustValues = ref<Record<string, string>>({})

watch(quickAdjustOpen, (isOpen) => {
  if (!isOpen) return
  const vals: Record<string, string> = {}
  insufficientRows.value.forEach((r) => {
    vals[r.uid] = String(r.available)
  })
  quickAdjustValues.value = vals
})

const adjustAll = () => {
  insufficientRows.value.forEach((row) => {
    const v = Number(quickAdjustValues.value[row.uid] ?? row.available)
    if (!isNaN(v) && v >= 0) {
      row.available = v
      row.adjusted = true
    }
  })
  quickAdjustOpen.value = false
}

// ── Inline edit ────────────────────────────────────────────────────────────────

const openEdit = (row: DrawerIngredientRow) => {
  ingredients.value.forEach((r) => {
    r.editing = false
  })
  row.editValue = String(row.used)
  row.editing = true
}

const confirmEdit = (row: DrawerIngredientRow) => {
  const v = Number(row.editValue)
  if (!isNaN(v) && v >= 0) {
    row.used = v
    row.adjusted = true
  }
  row.editing = false
}

// ── Form state ─────────────────────────────────────────────────────────────────

const selectedOutputItem = ref<DrawerOutputItem | null>(null)
const selectedVariantsByGroup = ref<Record<string, string>>({})
const selectedRecipeUid = ref<string | null>(null)
const quantityProduced = ref("")
const quantityDamaged = ref("")

const variants = computed<Variant[]>(() =>
  selectedOutputItem.value ? (MOCK_VARIANTS[selectedOutputItem.value.uid] ?? []) : [],
)

const recipes = computed<DrawerRecipe[]>(() =>
  selectedOutputItem.value ? (recipesMap.value[selectedOutputItem.value.uid] ?? []) : [],
)

const hasVariants = computed(() => variants.value.length > 0)

const selectedRecipe = computed(
  () => recipes.value.find((r) => r.uid === selectedRecipeUid.value) ?? null,
)

const canContinue = computed(
  () =>
    // Edit mode: draft exists, just need quantities
    (isEditMode.value &&
      !!draftUid.value &&
      !!quantityProduced.value &&
      Number(quantityProduced.value) > 0) ||
    // Create mode: need all fields
    (!!selectedOutputItem.value &&
      !!selectedRecipeUid.value &&
      !!quantityProduced.value &&
      Number(quantityProduced.value) > 0),
)

// ── Output item dropdown ────────────────────────────────────────────────────────

const outputDropdownRoot = ref<HTMLElement | null>(null)
const outputDropdownOpen = ref(false)
const outputQuery = ref("")

const filteredOutputItems = computed(() => {
  const q = outputQuery.value.trim().toLowerCase()
  if (!q) return outputItems.value
  return outputItems.value.filter((o) => o.name.toLowerCase().includes(q))
})

const openOutputDropdown = () => {
  if (isEditMode.value) return
  outputDropdownOpen.value = true
  outputQuery.value = ""
}
const closeOutputDropdown = () => {
  outputDropdownOpen.value = false
  outputQuery.value = ""
}

const pickOutputItem = async (item: DrawerOutputItem) => {
  selectedOutputItem.value = item
  selectedVariantsByGroup.value = {}
  selectedRecipeUid.value = null
  closeOutputDropdown()
  loadingRecipes.value = true
  try {
    const fetched = await fetchDrawerRecipesForItem(item.uid)
    recipesMap.value = { ...recipesMap.value, [item.uid]: fetched }
  } finally {
    loadingRecipes.value = false
  }
}

// ── Recipe dropdown ─────────────────────────────────────────────────────────────

const recipeDropdownRoot = ref<HTMLElement | null>(null)
const recipeDropdownOpen = ref(false)

const openRecipeDropdown = () => {
  if (!selectedOutputItem.value || isEditMode.value) return
  recipeDropdownOpen.value = true
}
const closeRecipeDropdown = () => {
  recipeDropdownOpen.value = false
}
const pickRecipe = (r: DrawerRecipe) => {
  selectedRecipeUid.value = r.uid
  closeRecipeDropdown()
}

watch(
  selectedVariantsByGroup,
  () => {
    selectedRecipeUid.value = null
  },
  { deep: true },
)

// ── Click-outside ───────────────────────────────────────────────────────────────

const onDocClick = (e: MouseEvent) => {
  if (outputDropdownOpen.value && !outputDropdownRoot.value?.contains(e.target as Node))
    closeOutputDropdown()
  if (recipeDropdownOpen.value && !recipeDropdownRoot.value?.contains(e.target as Node))
    closeRecipeDropdown()
}

onMounted(() => document.addEventListener("click", onDocClick, true))
onBeforeUnmount(() => document.removeEventListener("click", onDocClick, true))

// ── Step 3: Expenses ───────────────────────────────────────────────────────────

const processCosts = ref<DrawerExpenseRow[]>([])
const additionalExpenses = ref<DrawerExpenseRow[]>([{ id: "exp-default", name: "", cost: "" }])

const recipeProcessTotal = computed(() =>
  processCosts.value.reduce((sum, r) => sum + (Number(r.cost) || 0), 0),
)
const additionalExpensesTotal = computed(() =>
  additionalExpenses.value.reduce((sum, r) => sum + (Number(r.cost) || 0), 0),
)

const removeProcessCost = (id: string) => {
  processCosts.value = processCosts.value.filter((r) => r.id !== id)
}
const addExpense = () => {
  additionalExpenses.value.push({ id: `exp-${Date.now()}`, name: "", cost: "" })
}
const removeExpense = (id: string) => {
  additionalExpenses.value = additionalExpenses.value.filter((r) => r.id !== id)
}

// ── Step 4: Confirm & Finalize ─────────────────────────────────────────────────

const sellingPrice = ref("")
const showProfitEstimator = ref(false)

const materialsTotal = computed(() => estimatedCost.value)
const totalProductionCost = computed(
  () => materialsTotal.value + recipeProcessTotal.value + additionalExpensesTotal.value,
)

const usableUnits = computed(() => {
  const qty = Number(quantityProduced.value || 0)
  const damaged = Number(quantityDamaged.value || 0)
  return Math.max(0, qty - damaged)
})

const costPerUnit = computed(() =>
  usableUnits.value > 0 ? totalProductionCost.value / usableUnits.value : 0,
)
const sellingPriceNum = computed(() => Number(sellingPrice.value) || costPerUnit.value)
const profitPerUnit = computed(() => sellingPriceNum.value - costPerUnit.value)
const profitPerBatch = computed(() => profitPerUnit.value * usableUnits.value)
const isNegativeProfit = computed(() => profitPerUnit.value < 0)

watch(activeStep, (step) => {
  if (step === 3 && !sellingPrice.value && costPerUnit.value > 0) {
    sellingPrice.value = costPerUnit.value.toFixed(2)
  }
})

// ── Navigation ─────────────────────────────────────────────────────────────────

const goNext = async () => {
  if (activeStep.value === 0) {
    // Edit mode: draft already exists, skip create
    if (isEditMode.value && draftUid.value) {
      activeStep.value = Math.min(activeStep.value + 1, TOTAL_STEPS - 1)
      return
    }
    if (!selectedRecipeUid.value || !quantityProduced.value) return
    isSubmitting.value = true
    try {
      const variantUid = Object.values(selectedVariantsByGroup.value)[0]
      const payload: ProdRunCreatePayload = {
        recipe_uid: selectedRecipeUid.value,
        ...(variantUid ? { output_variant_uid: variantUid } : {}),
        quantity_to_produce: quantityProduced.value,
        damaged_quantity: quantityDamaged.value || "0",
        ingredients: [],
        process_costs: [],
        additional_expenses: [],
      }
      const result = await createDraftAndHydrate(payload)
      draftUid.value = result.draftUid
      ingredients.value = result.ingredients
      processCosts.value = result.processCosts
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast.error(err.message ?? "Failed to create run")
      isSubmitting.value = false
      return
    } finally {
      isSubmitting.value = false
    }
  }
  activeStep.value = Math.min(activeStep.value + 1, TOTAL_STEPS - 1)
}

const goBack = () => {
  activeStep.value = Math.max(activeStep.value - 1, 0)
}

// ── Populate (edit mode) ───────────────────────────────────────────────────────

const populateFromRun = async (run: Partial<ProductionRunData>) => {
  quantityProduced.value = run.quantity_produced != null ? String(run.quantity_produced) : ""
  quantityDamaged.value = run.quantity_damaged != null ? String(run.quantity_damaged) : ""
  sellingPrice.value = run.selling_price ?? ""

  if (!run.uid) return

  draftUid.value = run.uid
  // Start at step 1 (pre-filled, locked) so user can review and click through
  activeStep.value = 0

  loadingIngredients.value = true
  try {
    const detail = await fetchProductionRunDetail(run.uid)
    if (!detail) return

    // Resolve output item from detail — more reliable than the list payload
    const itemUid = detail.output_product ?? detail.output_raw_material ?? ""
    const itemName = detail.output_item_name ?? run.output_item_name ?? ""
    const itemType: "product" | "sub_assembly" = detail.output_product ? "product" : "sub_assembly"
    const match = outputItems.value.find((o) => o.uid === itemUid)
    selectedOutputItem.value =
      match ?? (itemName ? { uid: itemUid, name: itemName, type: itemType } : null)

    // Recipe
    selectedRecipeUid.value = run.recipe_uid ?? detail.recipe ?? null

    // Quantities from detail (more accurate than list)
    if (!quantityProduced.value) quantityProduced.value = String(detail.quantity_to_produce ?? "")
    if (!quantityDamaged.value) quantityDamaged.value = String(detail.damaged_quantity ?? "")
    if (!sellingPrice.value) sellingPrice.value = String(detail.selling_price_per_unit ?? "")

    // Ingredients — fall back to recipe if run has none
    const toNum = (v: string | number | null | undefined) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }

    if (detail.ingredients_used?.length) {
      ingredients.value = detail.ingredients_used.map((i: ProdRunIngredientUsed) => ({
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
    } else if (detail.recipe) {
      const recipe = await fetchRecipeDetail(detail.recipe)
      if (recipe?.ingredients?.length) {
        const details = await Promise.all(
          recipe.ingredients.map((i) => getEntityDetail(i.material_uid)),
        )
        ingredients.value = recipe.ingredients.map((i, idx) => ({
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
    }

    // Process costs — fall back to recipe.process_costs if draft has none
    const usedCosts = detail.process_costs_used.filter((p: ProdRunProcessCostUsed) =>
      p.name?.trim(),
    )
    if (usedCosts.length) {
      processCosts.value = usedCosts.map((p) => ({
        id: p.uid,
        name: p.name,
        cost: String(p.cost_per_batch),
      }))
    } else if (detail.recipe) {
      const recipe = await fetchRecipeDetail(detail.recipe)
      if (recipe?.process_costs?.length) {
        processCosts.value = recipe.process_costs.map((p, idx) => ({
          id: `rcp-pc-${idx}`,
          name: p.name,
          cost: String(p.cost_per_batch),
        }))
      }
    }
  } finally {
    loadingIngredients.value = false
  }
}

// ── Reset ───────────────────────────────────────────────────────────────────────

const resetAll = () => {
  activeStep.value = 0
  draftUid.value = null
  selectedOutputItem.value = null
  selectedVariantsByGroup.value = {}
  selectedRecipeUid.value = null
  recipesMap.value = {}
  quantityProduced.value = ""
  quantityDamaged.value = ""
  ingredients.value = []
  loadingIngredients.value = false
  quickAdjustOpen.value = false
  processCosts.value = []
  additionalExpenses.value = [{ id: "exp-default", name: "", cost: "" }]
  sellingPrice.value = ""
  showProfitEstimator.value = false
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    resetAll()
    loadingOutputItems.value = true
    try {
      outputItems.value = await fetchDrawerOutputItems()
    } finally {
      loadingOutputItems.value = false
    }
    if (isEditMode.value && props.run) await populateFromRun(props.run)
  },
)

// ── Finalize ───────────────────────────────────────────────────────────────────

const onFinalize = async () => {
  const uid = draftUid.value
  if (!uid) {
    toast.error("No draft run found. Please complete step 1 first.")
    return
  }
  isSubmitting.value = true
  try {
    const payload: ProdRunFinalizePayload = {
      quantity_to_produce: quantityProduced.value || "0",
      damaged_quantity: quantityDamaged.value || "0",
      usable_quantity: usableUnits.value,
      material_cost_total: materialsTotal.value,
      process_cost_total: recipeProcessTotal.value,
      extra_cost_total: additionalExpensesTotal.value,
      total_cost: totalProductionCost.value,
      cost_per_unit: costPerUnit.value,
      selling_price_per_unit: sellingPriceNum.value,
      expected_profit_per_unit: profitPerUnit.value,
      expected_profit_per_batch: profitPerBatch.value,
    }
    const finalized = await finalizeDraft(uid, payload)
    emit("saved", finalized)
    emit("close")
    toast.success(isEditMode.value ? "Run updated successfully!" : "Production run finalized!")
  } catch (e: unknown) {
    const err = e as { response?: { data?: { detail?: string } }; message?: string }
    toast.error(err?.response?.data?.detail ?? err?.message ?? "Failed to finalize run")
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    max-width="2xl"
    variant="fullscreen"
    @close="emit('close')"
  >
    <!-- ── Header ── -->
    <template #header>
      <div class="border-b border-gray-100 px-6 py-4" :class="isMobile ? 'px-5' : ''">
        <div v-if="isMobile" class="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />
        <div class="flex justify-between">
          <p class="text-base font-semibold text-gray-900">{{ drawerTitle }}</p>
          <div class="flex items-center justify-center">
            <template v-for="i in TOTAL_STEPS" :key="i">
              <div
                class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors"
                :class="stepCircleClass(i - 1)"
              >
                <Icon v-if="activeStep > i - 1" name="check" size="13" />
                <span v-else>{{ i }}</span>
              </div>
              <div
                v-if="i < TOTAL_STEPS"
                class="mx-2 h-[2px] w-12 transition-colors"
                :class="stepLineClass(i - 1)"
              />
            </template>
            <button
              type="button"
              class="ml-6 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              @click="emit('close')"
            >
              <Icon name="close-circle" size="20" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Step 1: Basic run details ── -->
    <div v-show="activeStep === 0" class="px-5 pt-2">
      <!-- ── Skeleton while output items load ── -->
      <div v-if="loadingOutputItems" class="animate-pulse space-y-5 pt-2">
        <div class="flex size-10 items-center justify-center rounded-xl bg-gray-100">
          <div class="h-5 w-5 rounded-lg bg-gray-200" />
        </div>
        <div class="h-3 w-32 rounded-full bg-gray-200" />
        <!-- Output item field -->
        <div class="space-y-1.5">
          <div class="h-3 w-20 rounded-full bg-gray-200" />
          <div class="h-11 w-full rounded-xl bg-gray-100" />
        </div>
        <!-- Recipe field -->
        <div class="space-y-1.5">
          <div class="h-3 w-24 rounded-full bg-gray-200" />
          <div class="h-11 w-full rounded-xl bg-gray-100" />
        </div>
        <!-- Qty produced field -->
        <div class="space-y-1.5">
          <div class="h-3 w-36 rounded-full bg-gray-200" />
          <div class="h-11 w-full rounded-xl bg-gray-100" />
        </div>
        <!-- Qty damaged field -->
        <div class="space-y-1.5">
          <div class="h-3 w-28 rounded-full bg-gray-200" />
          <div class="h-11 w-full rounded-xl bg-gray-100" />
        </div>
      </div>

      <!-- ── Real form once loaded ── -->
      <template v-else>
        <div class="mb-2 flex size-10 items-center justify-center rounded-xl bg-gray-100">
          <Icon name="shop-add" size="22" class="text-gray-700" />
        </div>
        <p class="mb-6 text-sm text-gray-500">Basic run details</p>
        <div class="space-y-5">
          <!-- Output Item -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-700">
              Output Item <span class="text-red-500">*</span>
            </label>
            <div ref="outputDropdownRoot" class="relative">
              <button
                type="button"
                class="focus:border-primary-300 flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-sm transition outline-none"
                :class="isEditMode ? 'cursor-not-allowed opacity-50' : ''"
                :disabled="isEditMode"
                @click="outputDropdownOpen ? closeOutputDropdown() : openOutputDropdown()"
              >
                <span :class="selectedOutputItem ? 'text-gray-900' : 'text-gray-400'">
                  {{ selectedOutputItem?.name ?? "e.g Bread, Meatpie" }}
                </span>
                <Icon name="chevron-down" size="16" class="ml-2 shrink-0 text-gray-400" />
              </button>
              <div
                v-if="outputDropdownOpen"
                class="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                <div class="border-b border-gray-100 p-2">
                  <div class="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                    <Icon name="search-lg" size="14" class="shrink-0 text-gray-400" />
                    <input
                      v-model="outputQuery"
                      type="text"
                      class="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                      placeholder="Search options..."
                    />
                  </div>
                </div>
                <div class="max-h-60 overflow-y-auto p-1">
                  <button
                    v-for="item in filteredOutputItems"
                    :key="item.uid"
                    type="button"
                    class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-gray-50"
                    :class="selectedOutputItem?.uid === item.uid ? 'bg-primary-50' : ''"
                    @click="pickOutputItem(item)"
                  >
                    <span class="truncate text-gray-900">{{ item.name }}</span>
                    <div class="ml-2 flex shrink-0 items-center gap-2">
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                        :class="
                          item.type === 'sub_assembly'
                            ? 'border border-purple-200 bg-purple-50 text-purple-700'
                            : 'border border-blue-200 bg-blue-50 text-blue-700'
                        "
                      >
                        {{ item.type === "sub_assembly" ? "Sub-assembly" : "Product" }}
                      </span>
                      <Icon
                        v-if="selectedOutputItem?.uid === item.uid"
                        name="check"
                        size="13"
                        class="text-primary-500"
                      />
                    </div>
                  </button>
                  <p v-if="!filteredOutputItems.length" class="px-3 py-4 text-sm text-gray-400">
                    No items found.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Variants -->
          <div v-if="selectedOutputItem && hasVariants && !isEditMode">
            <label class="mb-2 block text-xs font-medium text-gray-700">Select Variant</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="v in variants"
                :key="v.uid"
                type="button"
                class="inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
                :class="
                  selectedVariantsByGroup[v.group] === v.uid
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                "
                @click="
                  selectedVariantsByGroup[v.group] === v.uid
                    ? delete selectedVariantsByGroup[v.group]
                    : (selectedVariantsByGroup[v.group] = v.uid)
                "
              >
                {{ v.name }}
              </button>
            </div>
          </div>

          <!-- Recipe -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-700">
              Select Recipe <span class="text-red-500">*</span>
            </label>
            <div ref="recipeDropdownRoot" class="relative">
              <!-- Skeleton while fetching recipes -->
              <div
                v-if="loadingRecipes"
                class="flex h-11 w-full animate-pulse items-center rounded-xl border border-gray-200 bg-gray-100 px-4"
              >
                <div class="h-3 w-1/3 rounded-full bg-gray-300" />
              </div>
              <button
                v-else
                type="button"
                class="flex h-11 w-full items-center justify-between rounded-xl border px-4 text-sm transition outline-none"
                :class="
                  !selectedOutputItem || isEditMode
                    ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                    : recipeDropdownOpen
                      ? 'border-primary-300 bg-white'
                      : 'focus:border-primary-300 border-gray-200 bg-white'
                "
                :disabled="!selectedOutputItem || isEditMode"
                @click="recipeDropdownOpen ? closeRecipeDropdown() : openRecipeDropdown()"
              >
                <span :class="selectedRecipe ? 'text-gray-900' : 'text-gray-400'">
                  {{ selectedRecipe ? selectedRecipe.code : "e.g Standard formula V2" }}
                </span>
                <Icon name="chevron-down" size="16" class="ml-2 shrink-0 text-gray-400" />
              </button>
              <div
                v-if="recipeDropdownOpen"
                class="border-primary-200 absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-xl border bg-white shadow-lg"
              >
                <div class="max-h-60 overflow-y-auto p-1">
                  <button
                    v-for="r in recipes"
                    :key="r.uid"
                    type="button"
                    class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-gray-50"
                    :class="selectedRecipeUid === r.uid ? 'bg-primary-50' : ''"
                    @click="pickRecipe(r)"
                  >
                    <span class="font-medium text-gray-900">{{ r.code }}</span>
                    <span
                      class="border-primary-200 bg-primary-50 text-primary-700 ml-3 inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                    >
                      Qty: {{ r.output_quantity }} {{ r.output_unit }}
                    </span>
                  </button>
                  <p v-if="!recipes.length" class="px-3 py-4 text-sm text-gray-400">
                    No recipes found for this item.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quantity Produced -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-700">
              Quantity Produced
              <span class="font-normal text-gray-400">(including damages)</span>
              <span class="text-red-500"> *</span>
            </label>
            <input
              v-model="quantityProduced"
              type="number"
              min="0"
              class="focus:border-primary-300 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm transition outline-none placeholder:text-gray-400"
              placeholder="e.g. 10"
            />
          </div>

          <!-- Quantity Damaged -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-700">Quantity Damaged</label>
            <input
              v-model="quantityDamaged"
              type="number"
              min="0"
              class="focus:border-primary-300 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm transition outline-none placeholder:text-gray-400"
              placeholder="e.g. 10"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- ── Step 2: Review ingredients ── -->
    <div v-show="activeStep === 1" class="flex flex-col">
      <!-- ── Skeleton while ingredients load ── -->
      <div v-if="loadingIngredients" class="animate-pulse space-y-3 px-5 pt-2">
        <div class="flex size-10 items-center justify-center rounded-xl bg-gray-100">
          <div class="h-5 w-5 rounded-lg bg-gray-200" />
        </div>
        <div class="h-3 w-48 rounded-full bg-gray-200" />
        <div v-for="n in 4" :key="n" class="rounded-xl border border-gray-100 bg-white px-4 py-3.5">
          <div class="flex items-center justify-between">
            <div class="h-3 w-24 rounded-full bg-gray-200" />
            <div class="h-3 w-16 rounded-full bg-gray-200" />
          </div>
          <div class="my-3 border-t border-dashed border-gray-100" />
          <div class="flex gap-4">
            <div class="flex flex-1 flex-col gap-2">
              <div class="h-8 w-20 rounded-lg bg-gray-100" />
              <div class="h-2.5 w-16 rounded-full bg-gray-200" />
            </div>
            <div class="flex flex-1 flex-col gap-2">
              <div class="h-8 w-20 rounded-lg bg-gray-100" />
              <div class="h-2.5 w-16 rounded-full bg-gray-200" />
            </div>
            <div class="flex flex-1 flex-col gap-2">
              <div class="h-8 w-20 rounded-lg bg-gray-100" />
              <div class="h-2.5 w-16 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Real content once loaded ── -->
      <template v-else>
        <div class="px-5 pt-2">
          <div class="mb-2 flex size-10 items-center justify-center rounded-xl bg-gray-100">
            <Icon name="bag" size="22" class="text-gray-700" />
          </div>
          <p class="mb-4 text-sm text-gray-500">Review and adjust ingredient quantities.</p>
        </div>

        <!-- Insufficient stock banner -->
        <div v-if="hasInsufficient" class="mx-5 mb-3">
          <div
            v-if="!quickAdjustOpen"
            class="border-error-300 bg-error-50 flex items-center justify-between rounded-xl border px-3 py-2.5"
          >
            <div class="flex items-center gap-2">
              <Icon name="warning-2" size="16" class="text-error-500 shrink-0" />
              <span class="text-error-700 text-xs font-medium">
                {{ insufficientRows.length }} material{{ insufficientRows.length > 1 ? "s" : "" }}
                with insufficient stock
              </span>
            </div>
            <button
              type="button"
              class="text-error-600 hover:text-error-700 text-xs font-semibold"
              @click="quickAdjustOpen = true"
            >
              Quick Adjust
            </button>
          </div>
          <div v-else class="border-error-300 overflow-hidden rounded-xl border bg-white">
            <div class="flex items-center justify-between px-4 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="border-error-200 bg-error-50 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2"
                >
                  <Icon name="warning-2" size="16" class="text-error-500" />
                </div>
                <span class="text-error-700 text-sm font-bold">
                  {{ insufficientRows.length }} material{{ insufficientRows.length > 1 ? "s" : "" }}
                  with insufficient stock
                </span>
              </div>
              <button
                type="button"
                class="text-error-700 hover:text-error-800 text-sm font-bold underline"
                @click="quickAdjustOpen = false"
              >
                Quick Adjust
              </button>
            </div>
            <div class="border-error-100 border-t" />
            <div class="px-4 pt-3 pb-1">
              <p class="text-core-600 my-4 text-sm font-medium">
                Adjust the quantities for this run to match what you currently have
              </p>
            </div>
            <div class="mx-4 mb-4 rounded-lg bg-gray-50 px-6 pb-2">
              <div
                v-for="(row, idx) in insufficientRows"
                :key="row.uid"
                class="flex items-center justify-between py-3"
                :class="idx !== insufficientRows.length - 1 ? 'border-b border-gray-200' : ''"
              >
                <span class="text-sm font-semibold text-gray-800">{{ row.name }}</span>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <span>Old</span>
                  <span
                    class="border-error-200 bg-error-50 text-error-700 inline-flex items-center rounded-lg border px-2.5 py-1 text-sm font-semibold"
                  >
                    {{ row.required }} {{ row.unit }}
                  </span>
                  <span class="mx-1 tracking-widest text-gray-400">- - - →</span>
                  <span>New</span>
                  <div
                    class="inline-flex items-center overflow-hidden rounded-lg border border-green-300 bg-green-50"
                  >
                    <input
                      v-model="quickAdjustValues[row.uid]"
                      type="number"
                      min="0"
                      class="w-14 bg-transparent px-2 py-1 text-sm font-semibold text-green-700 outline-none"
                    />
                    <span class="pr-2 text-sm font-semibold text-green-700">{{ row.unit }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
                @click="quickAdjustOpen = false"
              >
                <Icon name="chevron-up" size="16" />
              </button>
              <button
                type="button"
                class="text-primary-600 hover:text-primary-700 flex items-center gap-2 text-sm font-bold"
                @click="adjustAll"
              >
                <Icon name="check" size="16" class="text-primary-500" />
                Adjust All
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="!ingredients.length"
          class="mx-5 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400"
        >
          No ingredients loaded. Complete step 1 to load ingredients from the recipe.
        </div>

        <!-- Ingredient cards -->
        <div class="space-y-3 px-5">
          <div
            v-for="row in ingredients"
            :key="row.uid"
            class="rounded-xl border bg-white px-4 py-3.5"
            :class="
              row.available < row.required && !row.adjusted
                ? 'border-error-300 border-dashed'
                : 'border-gray-200'
            "
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="blur" size="20" class="shrink-0 text-gray-500" />
                <span class="text-sm font-semibold text-gray-800">{{ row.name }}</span>
                <span
                  v-if="row.adjusted"
                  class="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700"
                  >Adjusted</span
                >
              </div>
              <span class="text-sm font-bold text-gray-900">{{ formatNaira(row.cost) }}</span>
            </div>
            <div class="my-3 border-t border-dashed border-gray-200" />
            <div class="flex items-end gap-2">
              <div class="flex flex-1 flex-col gap-1.5">
                <span
                  class="inline-flex w-fit items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700"
                  >{{ row.required }} {{ row.unit }}</span
                >
                <span class="text-xs text-gray-400">Required Stock</span>
              </div>
              <div class="flex flex-1 flex-col gap-1.5">
                <span
                  class="inline-flex w-fit items-center rounded-lg border px-3 py-1.5 text-sm font-medium"
                  :class="
                    row.available >= row.required || row.adjusted
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-error-200 bg-error-200 text-error-700'
                  "
                  >{{ row.available }} {{ row.unit }}</span
                >
                <span class="text-xs text-gray-400">Available Stock</span>
              </div>
              <div class="flex flex-1 flex-col gap-1.5">
                <div v-if="!row.editing">
                  <span
                    class="inline-flex w-fit items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700"
                    >{{ row.used }} {{ row.unit }}</span
                  >
                </div>
                <div
                  v-else
                  class="border-primary-400 inline-flex w-fit overflow-hidden rounded-lg border-2 bg-white"
                >
                  <input
                    v-model="row.editValue"
                    type="number"
                    min="0"
                    class="w-20 bg-transparent px-3 py-1.5 text-sm font-medium text-gray-800 outline-none"
                    @keyup.enter="confirmEdit(row)"
                  />
                  <button
                    type="button"
                    class="flex items-center justify-center bg-green-50 px-2.5 text-green-600 hover:bg-green-100"
                    @click="confirmEdit(row)"
                  >
                    <Icon name="check" size="14" />
                  </button>
                </div>
                <span class="text-xs text-gray-400">Used Stock</span>
              </div>
              <button
                type="button"
                class="mb-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                @click="openEdit(row)"
              >
                <Icon name="edit-2" size="18" />
              </button>
            </div>
          </div>
        </div>
        <div class="h-4" />
      </template>
    </div>

    <!-- ── Step 3: Expenses ── -->
    <div v-show="activeStep === 2" class="px-5 pt-2">
      <div class="mb-2 flex size-10 items-center justify-center rounded-xl bg-gray-100">
        <Icon name="receipt-2" size="22" class="text-gray-700" />
      </div>
      <p class="mb-5 text-sm text-gray-500">Log expenses like fuel, labor, or packaging.</p>

      <div class="mb-5 rounded-xl border border-gray-200 bg-white">
        <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <Icon name="setting" size="16" class="text-gray-500" />
          <span class="text-sm font-semibold text-gray-800">Processes</span>
        </div>
        <div class="divide-y divide-gray-100">
          <div v-for="row in processCosts" :key="row.id" class="flex items-center gap-3 px-4 py-3">
            <input
              v-model="row.name"
              type="text"
              class="focus:border-primary-300 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400"
              placeholder="e.g Fuel, Labour"
            />
            <div
              class="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2"
            >
              <span class="text-sm text-gray-400">₦</span>
              <input
                v-model="row.cost"
                type="number"
                min="0"
                class="w-20 bg-transparent text-sm text-gray-700 outline-none"
                placeholder="5,000"
              />
            </div>
            <button
              type="button"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
              @click="removeProcessCost(row.id)"
            >
              <Icon name="minus" size="14" />
            </button>
          </div>
        </div>
        <div v-if="!processCosts.length" class="px-4 py-3 text-sm text-gray-400">
          No process costs from recipe.
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white">
        <div class="border-b border-gray-100 px-4 py-3">
          <span class="text-sm font-semibold text-gray-800">Additional Expenses</span>
        </div>
        <div class="divide-y divide-gray-100">
          <div
            v-for="row in additionalExpenses"
            :key="row.id"
            class="flex items-center gap-3 px-4 py-3"
          >
            <input
              v-model="row.name"
              type="text"
              class="focus:border-primary-300 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400"
              placeholder="e.g Boiling, Labour"
            />
            <div
              class="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2"
            >
              <span class="text-sm text-gray-400">₦</span>
              <input
                v-model="row.cost"
                type="number"
                min="0"
                class="w-20 bg-transparent text-sm text-gray-700 outline-none"
                placeholder="5,000"
              />
            </div>
            <button
              type="button"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
              @click="removeExpense(row.id)"
            >
              <Icon name="minus" size="14" />
            </button>
          </div>
        </div>
        <div class="border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            class="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            @click="addExpense"
          >
            <Icon name="add" size="16" />
            Add expense
          </button>
        </div>
      </div>
      <div class="h-4" />
    </div>

    <!-- ── Step 4: Confirm & Finalize ── -->
    <div v-show="activeStep === 3" class="px-5 pt-2">
      <div class="mb-2 flex size-10 items-center justify-center rounded-xl bg-gray-100">
        <Icon name="chart" size="22" class="text-gray-700" />
      </div>
      <p class="mb-5 text-sm text-gray-500">
        Confirm your production economics and set the selling price.
      </p>

      <div class="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-4">
        <p class="mb-3 text-sm font-semibold text-gray-800">Production Cost Breakdown</p>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">Materials</span>
            <span class="text-sm text-gray-800">{{ formatNaira(materialsTotal) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">Recipe Process Costs</span>
            <span class="text-sm text-gray-800">{{ formatNaira(recipeProcessTotal) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">Additional Expenses</span>
            <span class="text-sm text-gray-800">{{
              additionalExpensesTotal > 0 ? formatNaira(additionalExpensesTotal) : "-"
            }}</span>
          </div>
        </div>
        <div class="my-3 border-t border-dashed border-gray-200" />
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-semibold text-gray-800">Total Production Cost</span>
          <span class="text-sm font-bold text-gray-900">{{
            formatNaira(totalProductionCost)
          }}</span>
        </div>
        <div class="mb-1 flex items-center justify-between">
          <span class="text-sm text-gray-500">Usable units</span>
          <span class="text-sm text-gray-800">{{ usableUnits || "-" }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">Cost per Unit</span>
          <span class="text-sm text-gray-800">{{
            usableUnits ? formatNaira(costPerUnit) : "-"
          }}</span>
        </div>
      </div>

      <div class="mb-3 rounded-xl border border-gray-200 bg-white px-4 py-4 text-center">
        <p class="mb-2 text-xs text-gray-400">Selling Price</p>
        <div class="flex items-center justify-center gap-1">
          <span class="text-lg font-semibold text-gray-500">₦</span>
          <input
            v-model="sellingPrice"
            type="number"
            min="0"
            class="w-40 bg-transparent text-center text-2xl font-bold text-gray-900 outline-none"
            :placeholder="costPerUnit > 0 ? costPerUnit.toFixed(0) : '0'"
          />
        </div>
      </div>

      <button
        type="button"
        class="text-primary-600 hover:text-primary-700 flex items-center gap-1.5 text-sm font-semibold underline"
        @click="showProfitEstimator = true"
      >
        Open Profit Estimator
        <Icon name="arrow-right" size="16" />
      </button>
      <div class="h-4" />
    </div>

    <!-- ── Profit Estimator Modal ── -->
    <Modal
      :open="showProfitEstimator"
      title="Profit Estimator"
      max-width="md"
      @close="showProfitEstimator = false"
    >
      <p class="mb-4 text-sm text-gray-500">
        Calculate the estimated profit you earn based on your selling price
      </p>
      <div class="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">
        <p class="mb-1 text-xs text-gray-400">Enter Selling Price</p>
        <div class="flex items-center justify-center gap-1">
          <span class="text-base font-semibold text-gray-500">₦</span>
          <input
            v-model="sellingPrice"
            type="number"
            min="0"
            class="w-32 bg-transparent text-center text-2xl font-bold text-gray-900 outline-none"
          />
        </div>
      </div>
      <div class="mb-3 grid grid-cols-2 gap-3">
        <div
          class="rounded-xl border px-4 py-3"
          :class="isNegativeProfit ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'"
        >
          <p class="mb-1 text-xs text-gray-400">Expected Profit per Unit</p>
          <p
            class="text-base font-bold"
            :class="isNegativeProfit ? 'text-red-600' : 'text-green-600'"
          >
            {{ isNegativeProfit ? "-" : "" }}{{ formatNaira(Math.abs(profitPerUnit)) }}
          </p>
        </div>
        <div
          class="rounded-xl border px-4 py-3"
          :class="isNegativeProfit ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'"
        >
          <p class="mb-1 text-xs text-gray-400">Expected Profit per Batch</p>
          <p
            class="text-base font-bold"
            :class="isNegativeProfit ? 'text-red-600' : 'text-green-600'"
          >
            {{ isNegativeProfit ? "-" : "" }}{{ formatNaira(Math.abs(profitPerBatch)) }}
          </p>
        </div>
      </div>
      <div
        v-if="isNegativeProfit"
        class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3"
      >
        <Icon name="warning-2" size="16" class="mt-0.5 shrink-0 text-red-500" />
        <p class="text-xs text-red-600">
          The predicted profit on this batch is negative. Raise your price short-term and review
          your operations strategy long-term.
        </p>
      </div>
    </Modal>

    <!-- ── Footer ── -->
    <template #footer>
      <div v-if="activeStep === 0" class="px-6 py-4">
        <div v-if="loadingOutputItems" class="h-12 w-full animate-pulse rounded-xl bg-gray-200" />
        <button
          v-else
          type="button"
          class="h-12 w-full rounded-xl text-sm font-semibold text-white transition-opacity"
          :class="
            canContinue
              ? 'bg-[#C2570A] hover:opacity-90 active:opacity-80'
              : 'cursor-not-allowed bg-[#C2570A] opacity-40'
          "
          :disabled="!canContinue || isSubmitting"
          @click="goNext"
        >
          {{ isSubmitting ? "Creating run…" : "Continue" }}
        </button>
      </div>

      <div v-else-if="activeStep === 1" class="border-t border-gray-100 px-6 py-4">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-sm text-gray-600">Estimated cost</span>
          <span class="text-sm font-semibold text-gray-900">{{ formatNaira(estimatedCost) }}</span>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            class="flex h-12 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
            @click="goBack"
          >
            Back
          </button>
          <button
            type="button"
            class="h-12 flex-1 rounded-xl bg-[#C2570A] text-sm font-semibold text-white hover:opacity-90 active:opacity-80"
            @click="goNext"
          >
            Continue
          </button>
        </div>
      </div>

      <div v-else-if="activeStep === 2" class="border-t border-gray-100 px-6 py-4">
        <div class="mb-1 flex items-center justify-between">
          <span class="text-sm text-gray-600">Recipe Process Costs</span>
          <span class="text-sm font-semibold text-gray-900">{{
            formatNaira(recipeProcessTotal)
          }}</span>
        </div>
        <div class="mb-4 flex items-center justify-between">
          <span class="text-sm text-gray-600">Additional Expenses</span>
          <span class="text-sm font-semibold text-gray-900">{{
            additionalExpensesTotal > 0 ? formatNaira(additionalExpensesTotal) : "-"
          }}</span>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            class="flex h-12 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
            @click="goBack"
          >
            Back
          </button>
          <button
            type="button"
            class="h-12 flex-1 rounded-xl bg-[#C2570A] text-sm font-semibold text-white hover:opacity-90 active:opacity-80"
            @click="goNext"
          >
            Continue
          </button>
        </div>
      </div>

      <div v-else-if="activeStep === 3" class="border-t border-gray-100 px-6 py-4">
        <div class="flex gap-3">
          <button
            type="button"
            class="flex h-12 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
            @click="goBack"
          >
            Back
          </button>
          <button
            type="button"
            class="h-12 flex-1 rounded-xl bg-[#C2570A] text-sm font-semibold text-white hover:opacity-90 active:opacity-80 disabled:opacity-50"
            :disabled="isSubmitting"
            @click="onFinalize"
          >
            {{ isSubmitting ? "Finalizing…" : isEditMode ? "Save Changes" : "Finalize Production" }}
          </button>
        </div>
      </div>
    </template>
  </component>
</template>
