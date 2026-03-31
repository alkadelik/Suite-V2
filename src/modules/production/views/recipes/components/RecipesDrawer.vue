<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { useProductionStore } from "../../../store"
import {
  rawMaterialToIngredientOption,
  fetchRawMaterials,
  fetchOutputItemOptions,
  createRecipe,
  patchRecipe,
  getEntityUnit,
  type RecipeCreatePayload,
  type OutputItemOption,
  type IngredientOption,
  type TRecipes,
} from "../../../api"

import AppButton from "@components/AppButton.vue"
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import StepperWizard from "@components/StepperWizard.vue"
import FormField from "@components/form/FormField.vue"
import SelectField from "@components/form/SelectField.vue"
import Icon from "@components/Icon.vue"

import { useMediaQuery } from "@vueuse/core"
import { useForm } from "vee-validate"
import * as yup from "yup"
import { watch, computed, ref, onMounted, onBeforeUnmount } from "vue"
import { toast } from "@/composables/useToast"
import { onInvalidSubmit } from "@/utils/validations"
import { useSettingsStore } from "@modules/settings/store"

type Option = { label: string; value: string }

type RecipeIngredientA = { ingredient: string; qty: number }
type RecipeIngredientB = { material_uid: string; quantity: number }

type RecipeProcessA = { name: string; cost_per_batch: number; notes?: string }
type RecipeProcessB = { name: string; cost?: string | number; note?: string }

type TRecipe = {
  uid?: string
  output_item?: string
  output_item_name?: string
  output_qty?: string | number
  output_quantity?: string | number
  unit?: string
  notes?: string
  stock?: string | number
  ingredients?: RecipeIngredientA[] | RecipeIngredientB[]
  process_costs?: RecipeProcessA[] | RecipeProcessB[]
}

const props = defineProps<{
  open: boolean
  recipe: Partial<TRecipe> | null
  mode?: "create" | "edit"
}>()

const emit = defineEmits<{
  (e: "update:open", v: boolean): void
  (e: "created", recipe: unknown): void
  (e: "updated", recipe: unknown): void
  (e: "close"): void
  (e: "refresh"): void
}>()

const currency = computed(() => useSettingsStore().storeDetails?.currency || "NGN")

const productionStore = useProductionStore()
const isMobile = useMediaQuery("(max-width: 1028px)")
const isEditMode = computed(() => props.mode === "edit" && !!props.recipe)
const isDuplicateMode = computed(() => props.mode !== "edit" && !!props.recipe)

const selectedComponent = computed(() => useProductionStore().selectedRecipeOption)
const recipeLabel = computed(() => selectedComponent.value?.label || "Recipe")
const isSubAssembly = computed(() => values.output_item?.type === "sub_assembly")
const steps = computed(() => [`Add ${recipeLabel.value}`, "Ingredients", "Process costs"])
const activeStep = ref(0)
const isCompleted = (index: number) => activeStep.value > index
const isActive = (index: number) => activeStep.value === index

const stepCircleClass = (index: number) => {
  if (isCompleted(index)) return "bg-[#D97706] text-white border border-[#D97706]"
  if (isActive(index)) return "bg-[#111827] text-white border border-[#111827]"
  return "bg-white text-gray-700 border border-gray-300"
}

const unitOptions = ref<Option[]>([
  { label: "Pieces (pcs)", value: "pcs" },
  { label: "Kilograms (kg)", value: "kg" },
  { label: "Grams (g)", value: "g" },
  { label: "Liters (L)", value: "L" },
  { label: "Milliliters (ml)", value: "ml" },
])

const outputItemOptions = ref<OutputItemOption[]>([])
const ingredientOptions = ref<IngredientOption[]>([])

const loadingOutputItems = ref(false)
const loadingIngredients = ref(false)
const drawerLoading = ref(false)
const allowManualUnit = ref(false)

const normalise = (s: unknown): string => {
  if (typeof s === "string") return s.trim().toLowerCase()
  if (typeof s === "number" || typeof s === "boolean") return String(s).trim().toLowerCase()
  return ""
}

const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)

const findOption = (options: Option[], raw: unknown): Option | null => {
  const q = normalise(raw)
  if (!q) return null
  return (
    options.find((o) => normalise(o.value) === q) ||
    options.find((o) => normalise(o.label) === q) ||
    null
  )
}

const normaliseUnitValue = (raw: string) => {
  const u = normalise(raw)
  const map: Record<string, string> = {
    piece: "pcs",
    pieces: "pcs",
    pc: "pcs",
    pcs: "pcs",
    kilogram: "kg",
    kilograms: "kg",
    gram: "g",
    grams: "g",
    liter: "L",
    litre: "L",
    liters: "L",
    litres: "L",
    milliliter: "ml",
    millilitre: "ml",
    milliliters: "ml",
    millilitres: "ml",
  }
  return (map[u] ?? raw).trim()
}

const getErrorMessage = (e: unknown): string => {
  const err = e as { response?: { data?: unknown }; message?: string }
  const data = err.response?.data

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const record = data as Record<string, unknown>
    if (typeof record.detail === "string" && record.detail.trim()) return record.detail
    if (typeof record.message === "string" && record.message.trim()) return record.message

    const fieldErrors = Object.entries(record)
      .map(([key, val]) => {
        if (Array.isArray(val)) return `${key}: ${val.map((item) => String(item)).join(", ")}`
        if (typeof val === "string" || typeof val === "number" || typeof val === "boolean")
          return `${key}: ${String(val)}`
        return `${key}: Invalid value`
      })
      .join(" | ")
    if (fieldErrors) return fieldErrors
  }

  if (typeof data === "string" && data.trim()) return data
  if (typeof err.message === "string" && err.message.trim()) return err.message
  return "Something went wrong"
}

const parseMoney = (raw: string) => {
  const cleaned = String(raw || "").replace(/[^0-9.-]/g, "")
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

const formatNaira = (amount: number) => {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount)
  } catch {
    return `₦${Number(amount || 0).toLocaleString()}`
  }
}

const setUnitFromInventory = async (opt: OutputItemOption | null, fallbackUid?: string) => {
  const uid = opt?.value || fallbackUid || ""

  if (!uid) {
    allowManualUnit.value = false
    setFieldValue("unit", null)
    return
  }

  let unit = (opt?.unit || "").trim()
  if (!unit) unit = await getEntityUnit(uid)

  unit = normaliseUnitValue(unit)

  if (!unit) {
    allowManualUnit.value = true
    setFieldValue("unit", null)
    return
  }

  let unitOpt = findOption(unitOptions.value, unit)
  if (!unitOpt) {
    unitOpt = { label: unit, value: unit }
    unitOptions.value.push(unitOpt)
  }

  allowManualUnit.value = false
  setFieldValue("unit", unitOpt)
}

const CACHE_TTL_MS = 5 * 60 * 1000

const fetchOutputItems = async (force = false) => {
  const cached = productionStore.cachedOutputItems
  if (!force && cached.length && Date.now() - productionStore.inventoryCachedAt < CACHE_TTL_MS) {
    outputItemOptions.value = cached as OutputItemOption[]
    return
  }

  loadingOutputItems.value = true
  try {
    const items = await fetchOutputItemOptions()
    const deduped = items as OutputItemOption[]

    outputItemOptions.value = deduped
    productionStore.cachedOutputItems = deduped
    productionStore.inventoryCachedAt = Date.now()

    if (!deduped.length) toast.error("Could not load output items.")
  } finally {
    loadingOutputItems.value = false
  }
}

const fetchIngredients = async (force = false) => {
  const cached = productionStore.cachedIngredients
  if (!force && cached.length && Date.now() - productionStore.inventoryCachedAt < CACHE_TTL_MS) {
    ingredientOptions.value = cached.map((o) => ({ ...o }))
    return
  }

  loadingIngredients.value = true
  try {
    const rawResults = await fetchRawMaterials({ limit: 500, offset: 0 })
    const deduped: IngredientOption[] = rawResults
      .filter((m) => m.uid && m.name)
      .map((m) => rawMaterialToIngredientOption(m))

    ingredientOptions.value = deduped
    productionStore.cachedIngredients = deduped
  } catch (e: unknown) {
    console.error("fetchIngredients failed:", e)
    toast.error(getErrorMessage(e))
  } finally {
    loadingIngredients.value = false
  }
}

interface FormValues {
  output_item: OutputItemOption | null
  output_qty: string
  unit: Option | null
  notes: string
}

const schema = computed(() =>
  yup.object({
    output_item: yup.object().nullable().required("Output item is required").shape({
      label: yup.string().required(),
      value: yup.string().required(),
      type: yup.string().required(),
    }),
    output_qty: yup
      .number()
      .transform((value, originalValue) => (originalValue === "" ? undefined : value))
      .typeError("Output quantity must be a number")
      .required("Output quantity is required")
      .min(1, "Output quantity must be at least 1"),
    unit: yup.mixed().nullable(),
  }),
)

const { handleSubmit, resetForm, values, errors, setFieldValue, validate } = useForm<FormValues>({
  validationSchema: schema,
  initialValues: {
    output_item: null,
    output_qty: "",
    unit: null,
    notes: "",
  },
  validateOnMount: false,
})

type IngredientRow = { id: string; ingredient: IngredientOption; qty: number }

const ingredientRows = ref<IngredientRow[]>([])
const ingredientSelect = ref<IngredientOption | null>(null)
const ingredientSearch = ref("")

watch(ingredientSelect, (val) => {
  if (!val?.value) return
  const exists = ingredientRows.value.find((r) => r.ingredient.value === val.value)
  if (!exists) {
    ingredientRows.value.push({
      id: `${val.value}-${Date.now()}`,
      ingredient: val,
      qty: 1,
    })
  }
  ingredientSelect.value = null
})

const visibleIngredientRows = computed(() => {
  const rows = ingredientRows.value ?? []
  const q = ingredientSearch.value.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((r) => (r.ingredient?.label || "").toLowerCase().includes(q))
})

const incQty = (row: IngredientRow) => (row.qty += 1)
const decQty = (row: IngredientRow) => (row.qty = Math.max(0, row.qty - 1))
const removeRow = (row: IngredientRow) => {
  ingredientRows.value = ingredientRows.value.filter((r) => r.id !== row.id)
}

const estimatedCost = computed(() => {
  return ingredientRows.value.reduce((sum, row) => {
    const price = Number(row.ingredient.cost_per_unit ?? 0)
    return sum + price * Number(row.qty || 0)
  }, 0)
})

const mobileSelectOpen = ref(false)
const mobileSelectQuery = ref("")
const mobileSelectRoot = ref<HTMLElement | null>(null)

const outputItemTouched = ref(false)
const outputDropdownRoot = ref<HTMLElement | null>(null)
const desktopOutputOpen = ref(false)
const desktopOutputQuery = ref("")

const openDesktopOutput = () => {
  if (isEditMode.value || isDuplicateMode.value) return
  desktopOutputOpen.value = true
  desktopOutputQuery.value = ""
  outputItemTouched.value = true
}
const closeDesktopOutput = () => {
  desktopOutputOpen.value = false
  desktopOutputQuery.value = ""
}
const pickDesktopOutput = (opt: OutputItemOption) => {
  setFieldValue("output_item", opt)
  outputItemTouched.value = true
  closeDesktopOutput()
}

const filteredOutputOptions = computed(() => {
  const q = desktopOutputQuery.value.trim().toLowerCase()
  if (!q) return outputItemOptions.value
  return outputItemOptions.value.filter((o) => o.label.toLowerCase().includes(q))
})

const selectedIngredientLabel = computed(() => ingredientSelect.value?.label || "")

const filteredIngredientOptions = computed(() => {
  const q = mobileSelectQuery.value.trim().toLowerCase()
  const selectedUid = values.output_item?.value
  const available = ingredientOptions.value.filter((o) => o.value !== selectedUid)
  if (!q) return available
  return available.filter((o) => (o.label || "").toLowerCase().includes(q))
})

const openMobileSelect = () => {
  mobileSelectOpen.value = true
  mobileSelectQuery.value = ""
}
const closeMobileSelect = () => {
  mobileSelectOpen.value = false
  mobileSelectQuery.value = ""
}
const pickMobileIngredient = (opt: IngredientOption) => {
  ingredientSelect.value = opt
  closeMobileSelect()
}

const onDocClick = (e: MouseEvent) => {
  if (desktopOutputOpen.value && !outputDropdownRoot.value?.contains(e.target as Node)) {
    closeDesktopOutput()
  }
  if (!mobileSelectOpen.value) return
  const root = mobileSelectRoot.value
  if (!root) return
  if (root.contains(e.target as Node)) return
  closeMobileSelect()
}

const onKeyDown = (e: KeyboardEvent) => {
  if (!mobileSelectOpen.value) return
  if (e.key === "Escape") closeMobileSelect()
}

onMounted(() => {
  document.addEventListener("click", onDocClick, true)
  document.addEventListener("keydown", onKeyDown, true)
})
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick, true)
  document.removeEventListener("keydown", onKeyDown, true)
})

type ProcessRow = { id: string; name: string; cost: string; note?: string }

const makeEmptyProcessRow = () => ({ id: `process-${Date.now()}`, name: "", cost: "0", note: "" })
const processRows = ref<ProcessRow[]>([makeEmptyProcessRow()])

const addProcessRow = () => {
  processRows.value.push({
    id: `process-${Date.now()}-${Math.random()}`,
    name: "",
    cost: "0",
    note: "",
  })
}
const removeProcessRow = (row: ProcessRow) => {
  processRows.value = processRows.value.filter((r) => r.id !== row.id)
  if (!processRows.value.length) processRows.value = [makeEmptyProcessRow()]
}

const showProcessNote = ref(false)
const activeProcessId = ref<string | null>(null)
const processNoteDraft = ref("")

const openProcessNote = (row: ProcessRow) => {
  activeProcessId.value = row.id
  processNoteDraft.value = row.note || ""
  showProcessNote.value = true
}
const saveProcessNote = () => {
  const row = processRows.value.find((r) => r.id === activeProcessId.value)
  if (row) row.note = processNoteDraft.value
  showProcessNote.value = false
  activeProcessId.value = null
  processNoteDraft.value = ""
}

const originalQty = ref<number | null>(null)
const hasAttemptedContinue = ref(false)

const resetAll = () => {
  activeStep.value = 0
  ingredientRows.value = []
  ingredientSelect.value = null
  ingredientSearch.value = ""
  processRows.value = [makeEmptyProcessRow()]
  originalQty.value = null
  hasAttemptedContinue.value = false
  resetForm({ values: { output_item: null, output_qty: "", unit: null, notes: "" } })
  outputItemTouched.value = false
}

const populateFromRecipe = async () => {
  const r: Partial<TRecipe> = props.recipe ?? {}
  const outputUid = typeof r.output_item === "string" ? r.output_item : ""
  const outputName = typeof r.output_item_name === "string" ? r.output_item_name : ""

  const outputOpt =
    outputItemOptions.value.find((o) => String(o.value) === outputUid && outputUid !== "") ||
    outputItemOptions.value.find((o) => o.label === outputName && outputName !== "") ||
    null

  const qtyRaw = r.output_qty ?? r.output_quantity ?? r.stock ?? ""

  setFieldValue("output_item", outputOpt)
  setFieldValue("output_qty", qtyRaw === "" ? "" : String(qtyRaw))
  setFieldValue("notes", typeof r.notes === "string" ? r.notes : "")

  if (isDuplicateMode.value && qtyRaw !== "") {
    originalQty.value = Number(qtyRaw)
  } else {
    originalQty.value = null
  }

  await setUnitFromInventory(outputOpt, outputUid || undefined)

  const rawIngredients = Array.isArray(r.ingredients) ? r.ingredients : []
  ingredientRows.value = rawIngredients
    .map((i) => {
      const item = i as Partial<RecipeIngredientA & RecipeIngredientB>
      const ingredientUid =
        typeof item.ingredient === "string"
          ? item.ingredient
          : typeof item.material_uid === "string"
            ? item.material_uid
            : ""

      const qty =
        typeof item.qty === "number"
          ? item.qty
          : typeof item.quantity === "number"
            ? item.quantity
            : Number(item.qty ?? item.quantity ?? 0)

      if (!ingredientUid) return null
      const opt = ingredientOptions.value.find((o) => String(o.value) === ingredientUid)
      if (!opt) return null

      return {
        id: `${opt.value}-${Date.now()}-${Math.random()}`,
        ingredient: opt,
        qty: isDuplicateMode.value ? 0 : qty,
      }
    })
    .filter((row): row is IngredientRow => row !== null)

  const rawProcess = Array.isArray(r.process_costs) ? r.process_costs : []
  if (rawProcess.length) {
    processRows.value = rawProcess.map((p) => {
      const item = p as Partial<RecipeProcessA & RecipeProcessB>
      return {
        id: `process-${Date.now()}-${Math.random()}`,
        name: typeof item.name === "string" ? item.name : "",
        cost: String(item.cost ?? item.cost_per_batch ?? "0"),
        note:
          typeof item.note === "string"
            ? item.note
            : typeof item.notes === "string"
              ? item.notes
              : "",
      }
    })
  } else {
    processRows.value = [makeEmptyProcessRow()]
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    resetAll()
    drawerLoading.value = true
    try {
      const force = true
      await Promise.all([fetchIngredients(force), fetchOutputItems(force)])
      if (props.recipe) await populateFromRecipe()
    } finally {
      drawerLoading.value = false
    }
  },
  { immediate: true },
)

watch(
  () => values.output_item,
  async (opt) => {
    await setUnitFromInventory(opt)
  },
)

const canProceedToStep2 = computed(() => {
  if (!values.output_item?.value || !values.output_qty) return false
  return true
})

const isDuplicateQtyUnchanged = computed(() => {
  if (!isDuplicateMode.value || originalQty.value === null) return false
  return Number(values.output_qty || 0) === originalQty.value
})

const duplicateRecipeExists = computed(() => {
  if (!values.output_item?.value || !values.output_qty) return false

  const uid = values.output_item.value
  const qty = Number(values.output_qty)

  const currentRecipeUid =
    productionStore.currentRecipe &&
    typeof productionStore.currentRecipe === "object" &&
    "uid" in productionStore.currentRecipe &&
    typeof productionStore.currentRecipe.uid === "string"
      ? productionStore.currentRecipe.uid
      : ""

  return productionStore.recipes.some((r: unknown) => {
    const recipe = r as Record<string, unknown>
    const recipeUid = typeof recipe.uid === "string" ? recipe.uid : ""
    const outputProduct = typeof recipe.output_product === "string" ? recipe.output_product : ""
    const outputRawMaterial =
      typeof recipe.output_raw_material === "string" ? recipe.output_raw_material : ""
    const outputQuantity =
      typeof recipe.output_quantity === "number"
        ? recipe.output_quantity
        : Number(recipe.output_quantity ?? 0)

    if (isEditMode.value && recipeUid === currentRecipeUid) return false
    return (outputProduct === uid || outputRawMaterial === uid) && outputQuantity === qty
  })
})

const goToNextStep = async () => {
  if (activeStep.value === 0) {
    hasAttemptedContinue.value = true
    outputItemTouched.value = true

    if (isDuplicateQtyUnchanged.value) {
      toast.error(`Please change the output quantity before duplicating this ${recipeLabel.value}`)
      return
    }

    if (duplicateRecipeExists.value) {
      toast.error(
        `A ${recipeLabel.value} with this item and quantity already exists. Please select a different amount.`,
      )
      return
    }

    const ok = await validate()
    if (!ok.valid) {
      toast.error("Please complete the required fields before continuing")
      return
    }
    if (!canProceedToStep2.value) return
  }

  activeStep.value = Math.min(activeStep.value + 1, steps.value.length - 1)
}

const goToPrevStep = () => {
  activeStep.value = Math.max(activeStep.value - 1, 0)
}

const isPending = ref(false)

const onSubmit = handleSubmit(async (formValues) => {
  if (activeStep.value !== 2) return

  isPending.value = true
  try {
    const outputItem = formValues.output_item ?? values.output_item
    const outputUid = String(outputItem?.value || "")
    const outputType = outputItem?.type || "product"

    if (!outputUid) {
      toast.error("Output item is required")
      return
    }
    if (!isUuid(outputUid)) {
      toast.error("Output item must be a valid UUID.")
      return
    }

    const payload: RecipeCreatePayload = {
      output_item_type: outputType,
      output_item_uid: outputUid,
      output_quantity: Number(formValues.output_qty || 0),
      notes: formValues.notes || "",
      ingredients: ingredientRows.value
        .filter((r) => Number(r.qty || 0) > 0)
        .map((r) => ({
          material_uid: String(r.ingredient.value),
          quantity: Number(r.qty || 0),
        })),
      process_costs: processRows.value
        .filter((p) => String(p.name || "").trim())
        .map((p) => ({
          name: String(p.name || "").trim(),
          cost_per_batch: parseMoney(p.cost),
          notes: String(p.note || ""),
        })),
    }

    if (isEditMode.value) {
      const uid = String(props.recipe?.uid || "")
      if (!uid) {
        toast.error("Missing recipe uid")
        return
      }
      const updated = await patchRecipe(uid, payload)
      const mapped: TRecipes = {
        uid: updated.uid,
        output_item_name: updated.output_item_name ?? "",
        output_unit: updated.output_unit,
        item_type: updated.item_type === "sub_assembly" ? "sub_assembly" : "product",
        output_quantity: updated.output_quantity,
        producible_quantity: 0,
        ingredient_count: updated.ingredients != null ? updated.ingredients.length : 0,
        process_cost_count: updated.process_costs != null ? updated.process_costs.length : 0,
        last_cost: updated.last_cost,
        average_cost: updated.average_cost,
        is_active: updated.is_active,
        updated_at: updated.updated_at,
        output_product: updated.output_product ?? null,
        output_raw_material: updated.output_raw_material ?? null,
      }
      productionStore.upsertRecipeInList(mapped)
      emit("updated", updated)
      toast.success("Recipe updated successfully!")
    } else {
      const created = await createRecipe(payload)
      emit("created", created)
      toast.success("Recipe added successfully!")
    }

    emit("close")
    emit("refresh")
  } catch (e: unknown) {
    toast.error(getErrorMessage(e))
    console.error("Recipe save failed:", e)
  } finally {
    isPending.value = false
  }
}, onInvalidSubmit)
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    max-width="2xl"
    variant="fullscreen"
    @close="emit('close')"
  >
    <template #header>
      <div v-if="isMobile" class="border-b border-gray-100 bg-white px-5 pt-3 pb-4">
        <div class="mx-auto mb-3 h-1 w-12 rounded-full bg-gray-200" />
        <div class="flex items-start justify-between">
          <p class="text-core-800 text-xl leading-[30px] font-semibold">
            {{ isEditMode ? `Edit ${recipeLabel}` : `Add ${recipeLabel}` }}
          </p>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50"
            aria-label="Close"
            @click="emit('close')"
          >
            <Icon name="close-circle" size="24" />
          </button>
        </div>
        <div class="mt-3 flex items-center">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
            :class="stepCircleClass(0)"
          >
            <Icon v-if="activeStep > 0" name="check" size="14" />
            <span v-else>1</span>
          </div>
          <div
            class="mx-3 h-[2px] w-12"
            :class="activeStep >= 1 ? 'bg-[#D97706]' : 'bg-gray-200'"
          />
          <div
            class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
            :class="stepCircleClass(1)"
          >
            <Icon v-if="activeStep > 1" name="check" size="14" />
            <span v-else>2</span>
          </div>
          <div
            class="mx-3 h-[2px] w-12"
            :class="activeStep >= 2 ? 'bg-[#D97706]' : 'bg-gray-200'"
          />
          <div
            class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
            :class="stepCircleClass(2)"
          >
            <span>3</span>
          </div>
        </div>
      </div>

      <div v-else class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <p class="text-core-800 text-base font-semibold">
          {{ isEditMode ? `Edit ${recipeLabel}` : `Add ${recipeLabel}` }}
        </p>
        <div class="flex flex-1 justify-center">
          <div class="flex items-center">
            <div
              class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
              :class="stepCircleClass(0)"
            >
              <Icon v-if="activeStep > 0" name="check" size="14" />
              <span v-else>1</span>
            </div>
            <div
              class="mx-2 h-[2px] w-14"
              :class="activeStep >= 1 ? 'bg-[#D97706]' : 'bg-gray-200'"
            />
            <div
              class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
              :class="stepCircleClass(1)"
            >
              <Icon v-if="activeStep > 1" name="check" size="14" />
              <span v-else>2</span>
            </div>
            <div
              class="mx-2 h-[2px] w-14"
              :class="activeStep >= 2 ? 'bg-[#D97706]' : 'bg-gray-200'"
            />
            <div
              class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
              :class="stepCircleClass(2)"
            >
              <span>3</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50"
          aria-label="Close"
          @click="emit('close')"
        >
          <Icon name="close-circle" size="24" />
        </button>
      </div>
    </template>

    <StepperWizard v-model="activeStep" :steps="steps" :showIndicators="false">
      <template #default>
        <div v-show="activeStep === 0">
          <div v-if="drawerLoading" class="mt-2 space-y-5">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 animate-pulse rounded-xl bg-gray-200" />
              <div class="h-4 w-40 animate-pulse rounded bg-gray-200" />
            </div>
            <div class="space-y-2">
              <div class="h-3 w-24 animate-pulse rounded bg-gray-200" />
              <div class="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div class="space-y-2">
              <div class="h-3 w-28 animate-pulse rounded bg-gray-200" />
              <div class="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div class="space-y-2">
              <div class="h-3 w-32 animate-pulse rounded bg-gray-200" />
              <div class="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div class="space-y-2">
              <div class="h-3 w-20 animate-pulse rounded bg-gray-200" />
              <div class="h-24 w-full animate-pulse rounded-lg bg-gray-200" />
            </div>
          </div>

          <div v-else>
            <div>
              <div class="mb-2 flex size-10 items-center justify-center rounded-xl bg-gray-100 p-2">
                <Icon :name="isEditMode ? 'edit' : 'shop-add'" size="22" />
              </div>
              <p class="text-sm text-gray-600">
                {{ isEditMode ? `Update ${recipeLabel} details` : `Basic ${recipeLabel} details` }}
              </p>
            </div>

            <form class="mt-6 grid grid-cols-1 gap-5" @submit.prevent>
              <div ref="outputDropdownRoot" class="relative">
                <label class="mb-2 block text-xs font-medium text-gray-700">
                  Output Item <span class="text-red-500">*</span>
                </label>

                <button
                  type="button"
                  class="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-sm transition outline-none focus:border-orange-300"
                  :class="isEditMode || isDuplicateMode ? 'cursor-not-allowed opacity-50' : ''"
                  :disabled="isEditMode || isDuplicateMode"
                  @click="desktopOutputOpen ? closeDesktopOutput() : openDesktopOutput()"
                >
                  <div class="flex min-w-0 items-center gap-2">
                    <span
                      class="truncate"
                      :class="values.output_item ? 'text-gray-900' : 'text-gray-400'"
                    >
                      {{ values.output_item?.label || "Select an output item" }}
                    </span>
                    <span
                      v-if="isSubAssembly"
                      class="inline-flex shrink-0 items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700"
                    >
                      Sub-assembly
                    </span>
                  </div>
                  <Icon name="chevron-down" size="16" class="ml-2 shrink-0 text-gray-400" />
                </button>

                <p v-if="outputItemTouched && errors.output_item" class="mt-1 text-xs text-red-500">
                  {{ errors.output_item }}
                </p>

                <div
                  v-if="desktopOutputOpen"
                  class="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                >
                  <div class="border-b border-gray-100 p-2">
                    <div class="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                      <Icon name="search-lg" size="14" class="text-gray-400" />
                      <input
                        v-model="desktopOutputQuery"
                        type="text"
                        class="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                        placeholder="Search options..."
                      />
                    </div>
                  </div>

                  <div class="max-h-60 overflow-y-auto p-1">
                    <button
                      v-for="opt in filteredOutputOptions"
                      :key="opt.value"
                      type="button"
                      class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-gray-50"
                      :class="values.output_item?.value === opt.value ? 'bg-orange-50' : ''"
                      @click="pickDesktopOutput(opt)"
                    >
                      <span class="truncate text-gray-900">{{ opt.label }}</span>
                      <div class="ml-2 flex shrink-0 items-center gap-2">
                        <span
                          v-if="opt.type === 'sub_assembly'"
                          class="inline-flex shrink-0 items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                        >
                          Sub-assembly
                        </span>
                        <Icon
                          v-if="values.output_item?.value === opt.value"
                          name="check"
                          size="14"
                          class="text-orange-500"
                        />
                      </div>
                    </button>
                    <p v-if="!filteredOutputOptions.length" class="px-3 py-4 text-sm text-gray-400">
                      No items found.
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                type="number"
                name="output_qty"
                label="Output Quantity"
                placeholder="e.g. 10"
                required
              />

              <p
                v-if="duplicateRecipeExists && hasAttemptedContinue"
                class="mt-[-12px] text-xs font-medium text-red-600"
              >
                A {{ recipeLabel }} with this item and quantity already exists. Choose a different
                amount.
              </p>

              <p
                v-if="isDuplicateQtyUnchanged && hasAttemptedContinue"
                class="mt-[-12px] text-xs font-medium text-red-600"
              >
                You must change the output quantity when duplicating a recipe.
              </p>

              <FormField
                type="select"
                name="unit"
                label="Unit of measurement"
                placeholder="e.g pcs"
                :options="unitOptions"
                :searchable="true"
              />

              <FormField type="textarea" name="notes" label="Notes (optional)" placeholder="" />
            </form>
          </div>
        </div>

        <div v-show="activeStep === 1" :class="isMobile ? 'pb-28' : ''">
          <div class="mb-6">
            <div class="mb-2 flex size-10 items-center justify-center rounded-xl bg-gray-100 p-2">
              <Icon name="bag" size="22" />
            </div>
            <p class="text-sm text-gray-600">Add ingredients</p>
          </div>

          <div v-if="loadingIngredients" class="mb-4 space-y-3">
            <div v-for="n in 4" :key="n" class="flex items-center gap-3">
              <div class="h-9 flex-1 animate-pulse rounded-lg bg-gray-200" />
              <div class="h-9 w-20 animate-pulse rounded-lg bg-gray-200" />
              <div class="h-9 w-9 animate-pulse rounded-lg bg-gray-200" />
            </div>
          </div>

          <div v-if="!isMobile" class="relative">
            <SelectField
              :model-value="ingredientSelect"
              label="Select/Search Ingredients"
              placeholder="e.g Flour"
              :options="ingredientOptions"
              value-key="value"
              label-key="label"
              searchable
              @update:model-value="(v) => (ingredientSelect = v as IngredientOption | null)"
            />
          </div>

          <div v-else ref="mobileSelectRoot" class="relative">
            <label class="mb-2 block text-xs font-medium text-gray-700"
              >Select/Search Ingredients</label
            >

            <button
              type="button"
              class="flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-gray-300"
              @click="mobileSelectOpen ? closeMobileSelect() : openMobileSelect()"
            >
              <span
                class="truncate text-left"
                :class="selectedIngredientLabel ? 'text-gray-900' : 'text-gray-400'"
              >
                {{ selectedIngredientLabel || "e.g Flour" }}
              </span>
              <span class="ml-3 text-gray-400">▾</span>
            </button>

            <div
              v-if="mobileSelectOpen"
              class="absolute top-full left-0 z-[1400] mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
            >
              <div class="p-3">
                <div
                  class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                >
                  <Icon name="search-lg" size="16" class="text-gray-400" />
                  <input
                    v-model="mobileSelectQuery"
                    type="text"
                    class="h-6 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                    placeholder="Search options..."
                  />
                </div>
              </div>

              <div class="max-h-72 overflow-auto p-2">
                <button
                  v-for="opt in filteredIngredientOptions"
                  :key="opt.value"
                  type="button"
                  class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                  @click="pickMobileIngredient(opt)"
                >
                  <div class="min-w-0">
                    <span class="block truncate text-gray-900">{{ opt.label }}</span>
                    <div class="mt-1 flex items-center gap-2">
                      <span v-if="opt.unit" class="text-xs text-gray-500">{{ opt.unit }}</span>
                      <span
                        v-if="opt.kind === 'sub_assembly'"
                        class="inline-flex rounded-full border border-purple-200 bg-purple-50 px-2 py-[2px] text-[11px] font-medium text-purple-700"
                      >
                        Sub-assembly
                      </span>
                    </div>
                  </div>
                  <span class="ml-3 text-gray-400">›</span>
                </button>

                <div
                  v-if="!filteredIngredientOptions.length"
                  class="px-3 py-6 text-sm text-gray-500"
                >
                  No results.
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
            <div class="mb-4">
              <div
                class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <Icon name="search-lg" size="18" class="text-gray-400" />
                <input
                  v-model="ingredientSearch"
                  class="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  placeholder="e.g Search by ingredient name"
                  type="text"
                />
              </div>
            </div>

            <div class="space-y-3">
              <div
                v-for="row in visibleIngredientRows"
                :key="row.id"
                class="rounded-2xl border border-gray-200 bg-white px-4 py-3"
              >
                <div
                  :class="isMobile ? 'flex flex-col gap-3' : 'flex items-center justify-between'"
                >
                  <div class="flex min-w-0 items-center gap-3">
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                      <Icon name="blur" size="18" />
                    </span>
                    <div class="flex min-w-0 flex-col">
                      <div class="flex min-w-0 items-center gap-2">
                        <p class="truncate text-sm font-medium text-gray-900">
                          {{ row.ingredient.label }}
                        </p>
                        <span
                          v-if="row.ingredient.kind === 'sub_assembly'"
                          class="inline-flex rounded-full border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700"
                        >
                          Sub-assembly
                        </span>
                      </div>
                      <div class="mt-1 flex items-center gap-2">
                        <span
                          v-if="row.ingredient.cost_per_unit"
                          class="inline-flex rounded-full border border-[#FDBA74] bg-[#FFF7ED] px-2 py-1 text-xs font-medium text-[#9A3412]"
                        >
                          {{ formatNaira(row.ingredient.cost_per_unit || 0) }} /
                          {{ row.ingredient.unit || "unit" }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    class="flex items-center gap-3"
                    :class="isMobile ? 'w-full justify-between' : ''"
                  >
                    <div
                      class="flex items-center gap-2 rounded-xl border border-[#FDBA74] bg-white px-3 py-2"
                      :class="isMobile ? 'flex-1 justify-between' : ''"
                    >
                      <button
                        type="button"
                        class="flex h-7 w-7 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-50"
                        @click="decQty(row)"
                      >
                        <span class="text-lg leading-none">−</span>
                      </button>
                      <span class="min-w-6 text-center text-sm font-medium text-gray-900">
                        {{ row.qty }}
                      </span>
                      <button
                        type="button"
                        class="flex h-7 w-7 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-50"
                        @click="incQty(row)"
                      >
                        <span class="text-lg leading-none">+</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                      aria-label="Remove ingredient"
                      @click="removeRow(row)"
                    >
                      <span class="text-base leading-none">−</span>
                    </button>
                  </div>
                </div>
              </div>

              <div
                v-if="!(visibleIngredientRows?.length || 0)"
                class="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500"
              >
                No ingredients added yet. Use the dropdown above to add ingredients.
              </div>
            </div>
          </div>
        </div>

        <div v-show="activeStep === 2" class="px-5 py-2">
          <div class="mb-6">
            <div
              class="mb-2 flex size-10 items-center justify-center rounded-xl bg-neutral-200 p-[11px]"
            >
              <Icon name="shop-add" size="22" />
            </div>
            <p class="text-sm text-gray-600">Add process costs</p>
          </div>

          <div class="space-y-4">
            <div
              v-for="(row, idx) in processRows"
              :key="row.id"
              class="rounded-2xl border border-gray-200 bg-white px-4 py-4"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                    <Icon name="setting" size="18" class="text-gray-700" />
                  </span>
                  <p class="text-sm font-medium text-gray-900">Process {{ idx + 1 }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 hover:bg-gray-50"
                    aria-label="Add note"
                    @click="openProcessNote(row)"
                  >
                    <Icon name="note-add" size="24" />
                  </button>
                  <button
                    type="button"
                    class="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    aria-label="Remove process"
                    @click="removeProcessRow(row)"
                  >
                    <span class="text-lg leading-none">−</span>
                  </button>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-4">
                <div class="col-span-1">
                  <label class="mb-2 block text-xs font-medium text-gray-700">Process name</label>
                  <input
                    v-model="row.name"
                    type="text"
                    class="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-gray-300"
                    placeholder="e.g Boiling, Labour"
                  />
                </div>
                <div class="col-span-1">
                  <label class="mb-2 block text-xs font-medium text-gray-700"
                    >Cost ({{ currency }})</label
                  >
                  <input
                    v-model="row.cost"
                    type="text"
                    inputmode="numeric"
                    class="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-gray-300"
                    placeholder="₦5,000"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              class="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600"
              @click="addProcessRow"
            >
              <span class="text-lg leading-none">+</span>
              <span>Add process cost</span>
            </button>
          </div>

          <Modal
            v-if="!isMobile"
            :open="showProcessNote"
            title="Add Note"
            max-width="md"
            @close="showProcessNote = false"
          >
            <div class="space-y-4">
              <p class="text-sm font-medium text-gray-900">Notes (optional)</p>
              <textarea
                v-model="processNoteDraft"
                class="min-h-[120px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-300"
                placeholder='e.g "I spent too much money on this process"'
              />
            </div>
            <template #footer>
              <div class="flex">
                <AppButton label="Add Note" class="w-full" @click="saveProcessNote" />
              </div>
            </template>
          </Modal>

          <Teleport v-if="isMobile" to="body">
            <Transition name="note-sheet">
              <div v-if="showProcessNote" class="fixed inset-0 z-[9999] flex flex-col justify-end">
                <div class="absolute inset-0 bg-black/40" @click="showProcessNote = false" />
                <div class="relative rounded-t-3xl bg-white px-5 pt-5 pb-10 shadow-2xl">
                  <div class="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-300" />
                  <div class="mb-5 flex items-center justify-between">
                    <h2 class="text-base font-semibold text-gray-900">Add Note</h2>
                    <button
                      type="button"
                      class="flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
                      @click="showProcessNote = false"
                    >
                      <Icon name="x" size="16" />
                    </button>
                  </div>
                  <p class="mb-2 text-sm font-medium text-gray-700">Notes (optional)</p>
                  <textarea
                    v-model="processNoteDraft"
                    rows="5"
                    class="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white"
                    placeholder='e.g "I spent too much money on this process"'
                  />
                  <button
                    type="button"
                    class="mt-5 w-full rounded-2xl bg-[#C2570A] py-4 text-sm font-semibold text-white active:opacity-90"
                    @click="saveProcessNote"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </Transition>
          </Teleport>
        </div>
      </template>
    </StepperWizard>

    <template #footer>
      <div class="px-6 py-4">
        <div
          v-if="activeStep === 1"
          class="mb-4 flex items-center justify-between text-sm font-semibold text-gray-900"
        >
          <span>Estimated cost</span>
          <span>{{ formatNaira(estimatedCost) }}</span>
        </div>

        <div class="flex gap-3">
          <AppButton
            v-if="activeStep === 0"
            label="Cancel"
            color="alt"
            class="flex-1"
            @click="emit('close')"
          />
          <AppButton v-else label="Back" color="alt" class="flex-1" @click="goToPrevStep" />

          <AppButton
            v-if="activeStep < 2"
            label="Continue"
            class="flex-1"
            :disabled="activeStep === 0 ? !canProceedToStep2 : false"
            :inactive="activeStep === 0 ? !canProceedToStep2 : false"
            @click="goToNextStep"
          />

          <AppButton
            v-else
            :label="isEditMode ? `Update ${recipeLabel}` : `Add ${recipeLabel}`"
            class="flex-1"
            :loading="isPending"
            :disabled="isPending"
            @click="onSubmit"
          />
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
.note-sheet-enter-active,
.note-sheet-leave-active {
  transition: opacity 0.25s ease;
}
.note-sheet-enter-active .relative,
.note-sheet-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.note-sheet-enter-from,
.note-sheet-leave-to {
  opacity: 0;
}
.note-sheet-enter-from .relative,
.note-sheet-leave-to .relative {
  transform: translateY(100%);
}
</style>
