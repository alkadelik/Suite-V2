<script setup lang="ts">
import { computed, ref, watch } from "vue"
import * as yup from "yup"
import { toast } from "@/composables/useToast"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { useSettingsStore } from "@modules/settings/store"
import type { IProductCatalogue } from "@modules/inventory/types"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import Modal from "@components/Modal.vue"
import SelectField from "@components/form/SelectField.vue"
import TextField from "@components/form/TextField.vue"
import TextAreaField from "@components/form/TextAreaField.vue"

// Shape the parent passes in / receives back (matches add-order.vue's VariantRef)
interface VariantRef {
  uid: string
  name: string
  sku: string
  price: string
  sellable_stock: number
  original_price?: number
}

interface OrderItem {
  product: IProductCatalogue
  variant: VariantRef | null
  quantity: number
  unit_price: number
  notes?: string
}

// Internal state — adds the computed `available` stock (sellable - taken) for the UI
interface VariantState {
  variant: VariantRef
  available: number
  quantity: number
  unit_price: number
}

const props = defineProps<{
  open: boolean
  product: IProductCatalogue | null
  existingItems: OrderItem[]
}>()

const emit = defineEmits<{
  close: []
  save: [items: OrderItem[]]
  remove: [productUid: string]
}>()

const { format } = useFormatCurrency()
const currency = computed(() => useSettingsStore().storeDetails?.currency || "NGN")

const variantStates = ref<VariantState[]>([])
const notes = ref("")
const errors = ref<Record<string, { quantity?: string; unit_price?: string }>>({})

// A product needs explicit variant selection only when it has >1 variant or
// the single variant carries attributes (a meaningful "option").
const needsVariantSelection = computed(() => {
  const p = props.product
  if (!p?.variants?.length) return false
  if (p.variants.length > 1) return true
  return p.variants[0].attributes && p.variants[0].attributes.length > 0
})

const isEditing = computed(() => props.existingItems.length > 0)

const buildVariantState = (v: IProductCatalogue["variants"][number]): VariantState => {
  const sellable = Number(v.sellable_stock ?? v.available_stock ?? 0)
  const taken = Number((v as { popup_quantity_taken?: number }).popup_quantity_taken ?? 0)
  const variant: VariantRef = {
    uid: v.uid,
    name: v.name,
    sku: v.sku,
    price: v.price,
    sellable_stock: sellable,
    original_price: parseFloat(v.price),
  }
  return {
    variant,
    available: Math.max(0, sellable - taken),
    quantity: 1,
    unit_price: parseFloat(v.price),
  }
}

// For an existing item carried over from the parent we don't know `popup_quantity_taken`
// any more, so fall back to `sellable_stock` as the upper bound.
const fromExistingItem = (item: OrderItem): VariantState | null => {
  if (!item.variant) return null
  return {
    variant: item.variant,
    available: item.variant.sellable_stock,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }
}

const variantOptions = computed(() => {
  if (!props.product?.variants) return []
  return props.product.variants.map((v) => ({
    label:
      v.attributes && v.attributes.length > 0
        ? v.attributes.map((a) => a.attribute_value).join(", ")
        : v.name,
    value: v.uid,
  }))
})

const selectedVariantOption = computed(() =>
  variantStates.value.map((s) => {
    const opt = variantOptions.value.find((o) => o.value === s.variant.uid)
    return { label: opt?.label || s.variant.name, value: s.variant.uid }
  }),
)

// ─── Initialisation ──────────────────────────────────────────────────────────
const initState = () => {
  errors.value = {}
  const product = props.product
  if (!product) {
    variantStates.value = []
    notes.value = ""
    return
  }

  if (props.existingItems.length > 0) {
    variantStates.value = props.existingItems
      .map(fromExistingItem)
      .filter((s): s is VariantState => s !== null)
    notes.value = props.existingItems[0]?.notes ?? ""
    return
  }

  notes.value = ""

  if (!needsVariantSelection.value && product.variants?.length === 1) {
    variantStates.value = [buildVariantState(product.variants[0])]
  } else {
    variantStates.value = []
  }
}

watch(
  () => [props.open, props.product?.uid],
  ([isOpen]) => {
    if (isOpen) initState()
  },
  { immediate: true },
)

// ─── Variant selection (multi) ───────────────────────────────────────────────
const onVariantChange = (
  vals:
    | string
    | number
    | Record<string, unknown>
    | null
    | (string | number | Record<string, unknown>)[],
) => {
  if (!props.product) return
  const arr = Array.isArray(vals) ? vals : vals != null ? [vals] : []
  const next: VariantState[] = []

  for (const val of arr) {
    let uid = ""
    if (typeof val === "object" && val !== null && "value" in val) {
      const v = (val as { value: unknown }).value
      uid = typeof v === "string" || typeof v === "number" ? String(v) : ""
    } else if (typeof val === "string" || typeof val === "number") {
      uid = String(val)
    }
    const raw = props.product.variants.find((v) => v.uid === uid)
    if (!raw) continue
    const existing = variantStates.value.find((s) => s.variant.uid === uid)
    const fresh = buildVariantState(raw)
    next.push({
      variant: fresh.variant,
      available: fresh.available,
      quantity: existing?.quantity ?? fresh.quantity,
      unit_price: existing?.unit_price ?? fresh.unit_price,
    })
  }

  variantStates.value = next
}

const removeVariant = (uid: string) => {
  variantStates.value = variantStates.value.filter((s) => s.variant.uid !== uid)
  delete errors.value[uid]
}

// ─── Validation ──────────────────────────────────────────────────────────────
const validate = (): boolean => {
  errors.value = {}
  if (variantStates.value.length === 0) {
    toast.error(
      needsVariantSelection.value
        ? "Select at least one variant before saving."
        : "This product has no available variants.",
    )
    return false
  }

  let ok = true
  for (const s of variantStates.value) {
    const max = s.available
    const schema = yup.object({
      quantity: yup
        .number()
        .transform((v, o) => (o === "" ? undefined : v))
        .typeError("Quantity must be a number")
        .required("Quantity is required")
        .positive("Quantity must be greater than 0")
        .integer("Quantity must be a whole number")
        .max(max, `Only ${max} available in stock`),
      unit_price: yup
        .number()
        .transform((_, o) => (o === "" ? undefined : Number(String(o).replace(/,/g, ""))))
        .typeError("Price must be a number")
        .required("Price is required")
        .positive("Price must be greater than 0")
        .min(0.01, "Price must be at least 0.01"),
    })
    try {
      schema.validateSync({ quantity: s.quantity, unit_price: s.unit_price }, { abortEarly: false })
    } catch (err) {
      ok = false
      if (err instanceof yup.ValidationError) {
        const fieldErrs: { quantity?: string; unit_price?: string } = {}
        err.inner.forEach((e) => {
          if (e.path) fieldErrs[e.path as "quantity" | "unit_price"] = e.message
        })
        errors.value[s.variant.uid] = fieldErrs
      }
    }
  }

  return ok
}

// ─── Save / Remove ───────────────────────────────────────────────────────────
const handleSave = () => {
  if (!props.product || !validate()) return
  const items: OrderItem[] = variantStates.value.map((s) => ({
    product: props.product as IProductCatalogue,
    variant: s.variant,
    quantity: s.quantity,
    unit_price: s.unit_price,
    notes: notes.value || undefined,
  }))
  emit("save", items)
}

const handleRemove = () => {
  if (!props.product) return
  emit("remove", props.product.uid)
}

const close = () => emit("close")

const headerImage = computed(() => props.product?.images?.[0]?.image)
const totalStock = computed(() => {
  if (!props.product?.variants) return 0
  return props.product.variants.reduce((sum, v) => {
    const sellable = Number(v.sellable_stock ?? v.available_stock ?? 0)
    const taken = Number((v as { popup_quantity_taken?: number }).popup_quantity_taken ?? 0)
    return sum + Math.max(0, sellable - taken)
  }, 0)
})
</script>

<template>
  <Modal
    :open="open"
    :max-width="needsVariantSelection ? 'xl' : 'lg'"
    :show-header="false"
    variant="bottom-nav"
    :handle-padding="false"
    body-class="!rounded-t-2xl"
    @close="close"
  >
    <div v-if="product" class="flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between gap-3 border-b border-gray-100 bg-white p-4">
        <div class="flex min-w-0 items-center gap-3">
          <div class="size-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <img
              v-if="headerImage"
              :src="headerImage"
              :alt="product.name"
              class="size-full object-cover"
            />
            <div v-else class="flex size-full items-center justify-center">
              <Icon name="box-filled" class="text-gray-400" size="20" />
            </div>
          </div>
          <div class="min-w-0">
            <h3 class="truncate text-sm font-semibold text-gray-900">{{ product.name }}</h3>
            <p class="text-xs text-gray-500">
              {{ format(parseFloat(product.variants?.[0]?.price ?? "0")) }}
            </p>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <Chip color="success" :label="`${totalStock} in Stock`" icon="box" />
          <button class="text-gray-400 hover:text-gray-600" aria-label="Close" @click="close">
            <Icon name="close-circle" size="20" />
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="space-y-4 p-4">
        <!-- Multi-variant: variant select -->
        <SelectField
          v-if="needsVariantSelection"
          :model-value="selectedVariantOption"
          @update:model-value="onVariantChange"
          name="variant"
          label="Select variant"
          placeholder="Choose variant(s)"
          :options="variantOptions"
          multiple
          searchable
          placement="auto"
        />

        <!-- Per-variant rows (multi-variant case) -->
        <template v-if="needsVariantSelection">
          <div
            v-for="state in variantStates"
            :key="state.variant.uid"
            class="rounded-xl border border-gray-200 bg-gray-50 p-3"
          >
            <div class="mb-3 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <Chip
                  color="primary"
                  :label="`${state.variant.name.split(' - ')[1] ?? state.variant.name} · ${format(parseFloat(state.variant.price))}`"
                />
              </div>
              <div class="flex items-center gap-2">
                <Chip color="success" :label="`${state.available} in Stock`" icon="box" />
                <button
                  class="hover:text-error-500 text-gray-400"
                  aria-label="Remove variant"
                  @click="removeVariant(state.variant.uid)"
                >
                  <Icon name="close-circle" size="18" />
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <TextField
                v-model="state.quantity"
                name="quantity"
                type="number"
                label="Quantity"
                placeholder="1"
                :min="1"
                :max="state.available"
                :error="errors[state.variant.uid]?.quantity"
              />
              <TextField
                v-model="state.unit_price"
                name="price"
                type="number"
                format="currency"
                step="0.01"
                :label="`Unit Price (${currency})`"
                placeholder="0.00"
                :min="0"
                :error="errors[state.variant.uid]?.unit_price"
              />
            </div>
          </div>
        </template>

        <!-- Single-variant case: just qty + price -->
        <template v-if="!needsVariantSelection && variantStates[0]">
          <TextField
            v-model="variantStates[0].quantity"
            name="quantity"
            type="number"
            label="Enter Quantity"
            placeholder="1"
            :min="1"
            :max="variantStates[0].available"
            :error="errors[variantStates[0].variant.uid]?.quantity"
          />
          <TextField
            v-model="variantStates[0].unit_price"
            name="price"
            type="number"
            format="currency"
            step="0.01"
            :label="`Unit Price (${currency})`"
            placeholder="0.00"
            :min="0"
            :error="errors[variantStates[0].variant.uid]?.unit_price"
          />
        </template>

        <!-- Notes (always shown) -->
        <TextAreaField
          v-model="notes"
          name="notes"
          label="Add Note (optional)"
          placeholder="Properties"
          :rows="3"
        />
      </div>

      <!-- Footer -->
      <div class="flex gap-3 border-t border-gray-100 bg-white p-4">
        <AppButton
          v-if="isEditing"
          label="Remove From Cart"
          color="alt"
          class="flex-1"
          @click="handleRemove"
        />
        <AppButton
          label="Save To Cart"
          class="flex-1"
          :disabled="variantStates.length === 0"
          @click="handleSave"
        />
      </div>
    </div>
  </Modal>
</template>
