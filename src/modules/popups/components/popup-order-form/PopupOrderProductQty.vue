<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import SelectField from "@components/form/SelectField.vue"
import Icon from "@components/Icon.vue"
import TextAreaField from "@components/form/TextAreaField.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { PopupInventory, PopupInventoryVariant } from "@modules/popups/types"
import { computed, onMounted, ref, reactive, watch } from "vue"
import * as yup from "yup"
import { useMediaQuery } from "@vueuse/core"

interface PopupOrderItem {
  product: PopupInventory
  variant: PopupInventoryVariant
  quantity: number
  unit_price: number
  notes?: string
}

interface VariantItem {
  variant: PopupInventoryVariant
  quantity: number
  unit_price: number
}

interface ValidationErrors {
  [variantUid: string]: {
    quantity?: string
    unit_price?: string
  }
}

const props = defineProps<{
  selectedProducts: PopupInventory[]
  orderItems: PopupOrderItem[]
}>()

const emit = defineEmits<{
  next: []
  prev: []
  "update:orderItems": [items: PopupOrderItem[]]
  "update:selectedProducts": [products: PopupInventory[]]
}>()

const localItems = ref<{ product: PopupInventory; notes?: string }[]>([])
const selectedVariants = ref<Map<string, VariantItem[]>>(new Map())
const validationErrors = ref<ValidationErrors>({})
const showNotes = reactive<Record<string, boolean>>({})

// Toggle this to true to clear notes when hidden
const CLEAR_NOTE_ON_HIDE = false

// Check if a product needs variant selection (has multiple variants)
const needsVariantSelection = (product: PopupInventory) => {
  return product.variants && product.variants.length > 1
}

// Get variant options for select dropdown
const getVariantOptions = (product: PopupInventory) => {
  if (!product.variants) return []
  return product.variants.map((v) => ({
    label: v.name,
    value: v.uid,
  }))
}

// Initialize local items when component mounts or products change
onMounted(() => {
  if (props.orderItems.length > 0) {
    // Group orderItems by product
    const productMap = new Map<string, { product: PopupInventory; notes?: string }>()
    const variantsMap = new Map<string, VariantItem[]>()

    for (const item of props.orderItems) {
      if (!productMap.has(item.product.uid)) {
        productMap.set(item.product.uid, { product: item.product, notes: item.notes })
      }

      const existing = variantsMap.get(item.product.uid) || []
      existing.push({
        variant: item.variant,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })
      variantsMap.set(item.product.uid, existing)
    }

    localItems.value = Array.from(productMap.values())
    selectedVariants.value = variantsMap
  } else {
    // Create initial items from selected products - group by product
    localItems.value = props.selectedProducts.map((product) => {
      // Auto-select variant if there's only one
      if (product.variants && product.variants.length === 1) {
        const variant = product.variants[0]
        selectedVariants.value.set(product.uid, [
          {
            variant,
            quantity: 1,
            unit_price: parseFloat(variant.event_price),
          },
        ])
      } else {
        // For products with multiple variants, start with empty selection
        selectedVariants.value.set(product.uid, [])
      }

      return {
        product,
        notes: "",
      }
    })
  }
})

// Watch for new products added in step 0
watch(
  () => props.selectedProducts.length,
  () => {
    // Get current product UIDs in localItems
    const currentProductUids = new Set(localItems.value.map((item) => item.product.uid))

    // Find products that are in selectedProducts but not in localItems
    const newProductsToAdd = props.selectedProducts.filter(
      (product) => !currentProductUids.has(product.uid),
    )

    // Add new products to localItems
    for (const product of newProductsToAdd) {
      // Auto-select variant if there's only one
      if (product.variants && product.variants.length === 1) {
        const variant = product.variants[0]
        selectedVariants.value.set(product.uid, [
          {
            variant,
            quantity: 1,
            unit_price: parseFloat(variant.event_price),
          },
        ])
      } else {
        // For products with multiple variants, start with empty selection
        selectedVariants.value.set(product.uid, [])
      }

      localItems.value.push({
        product,
        notes: "",
      })
    }
  },
)

// Get currently selected variant UIDs for a product
const getSelectedVariantValues = (product: PopupInventory) => {
  const variants = selectedVariants.value.get(product.uid)
  if (!variants || variants.length === 0) return []
  return variants.map((v) => ({ value: v.variant.uid, label: v.variant.name }))
}

// Handle variant selection (supports multiple)
const onVariantChange = (
  product: PopupInventory,
  variantValues:
    | string
    | number
    | Record<string, unknown>
    | null
    | (string | number | Record<string, unknown>)[],
) => {
  if (!variantValues) {
    selectedVariants.value.set(product.uid, [])
    return
  }

  const values = Array.isArray(variantValues) ? variantValues : [variantValues]
  const variantItems: VariantItem[] = []

  for (const val of values) {
    let uid = ""
    if (typeof val === "object" && val !== null && "value" in val) {
      const v = val.value
      uid = typeof v === "string" || typeof v === "number" ? String(v) : ""
    } else if (typeof val === "string" || typeof val === "number") {
      uid = String(val)
    }

    const selectedVariant = product.variants.find((v) => v.uid === uid)
    if (selectedVariant) {
      // Check if this variant already exists to preserve qty/price
      const existing = selectedVariants.value.get(product.uid)?.find((v) => v.variant.uid === uid)

      variantItems.push({
        variant: selectedVariant,
        quantity: existing?.quantity || 1,
        unit_price: existing?.unit_price || parseFloat(selectedVariant.event_price),
      })
    }
  }

  selectedVariants.value.set(product.uid, variantItems)
}

const removeItem = (index: number) => {
  const item = localItems.value[index]
  const variants = selectedVariants.value.get(item.product.uid)
  if (variants) {
    variants.forEach((v) => delete validationErrors.value[v.variant.uid])
  }
  delete showNotes[item.product.uid]
  selectedVariants.value.delete(item.product.uid)
  localItems.value.splice(index, 1)

  // Immediately sync back to parent
  const remainingProducts = localItems.value.map((item) => item.product)
  emit("update:selectedProducts", remainingProducts)

  // Update orderItems in parent
  const orderItems: PopupOrderItem[] = []
  for (const item of localItems.value) {
    const variants = selectedVariants.value.get(item.product.uid)
    if (variants && variants.length > 0) {
      for (const variantItem of variants) {
        orderItems.push({
          product: item.product,
          variant: variantItem.variant,
          quantity: variantItem.quantity,
          unit_price: variantItem.unit_price,
          notes: item.notes,
        })
      }
    }
  }
  emit("update:orderItems", orderItems)
}

const toggleNotes = (productUid: string) => {
  const currentValue = showNotes[productUid] || false
  const newValue = !currentValue
  showNotes[productUid] = newValue

  // Optionally clear the note when user hides it
  if (CLEAR_NOTE_ON_HIDE && currentValue && !newValue) {
    const item = localItems.value.find((i) => i.product.uid === productUid)
    if (item) item.notes = ""
  }
}

const getActionItems = (item: { product: PopupInventory; notes?: string }) => {
  const notesVisible = showNotes[item.product.uid] || false
  return [
    {
      label: notesVisible ? "Hide Note" : "Show Note",
      icon: "note-text",
      action: () => {
        toggleNotes(item.product.uid)
      },
    },
    {
      label: "Remove Item",
      icon: "trash",
      action: () => {
        const index = localItems.value.findIndex((i) => i.product.uid === item.product.uid)
        if (index !== -1) removeItem(index)
      },
      disabled: localItems.value.length === 1,
    },
  ]
}

// Validate a single variant item
const validateVariantItem = async (variantItem: VariantItem) => {
  const schema = yup.object({
    quantity: yup
      .number()
      .transform((value, originalValue) => (originalValue === "" ? undefined : value))
      .typeError("Quantity must be a number")
      .required("Quantity is required")
      .positive("Quantity must be greater than 0")
      .integer("Quantity must be a whole number")
      .max(
        variantItem.variant.available_quantity,
        `Only ${variantItem.variant.available_quantity} available in stock`,
      ),
    unit_price: yup
      .number()
      .transform((value, originalValue) => (originalValue === "" ? undefined : value))
      .typeError("Price must be a number")
      .required("Price is required")
      .positive("Price must be greater than 0")
      .min(0.01, "Price must be at least 0.01"),
  })

  try {
    await schema.validate(
      { quantity: variantItem.quantity, unit_price: variantItem.unit_price },
      { abortEarly: false },
    )
    // Clear errors for this variant if validation passes
    delete validationErrors.value[variantItem.variant.uid]
    return true
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors: { quantity?: string; unit_price?: string } = {}
      err.inner.forEach((error) => {
        if (error.path) {
          errors[error.path as "quantity" | "unit_price"] = error.message
        }
      })
      validationErrors.value[variantItem.variant.uid] = errors
    }
    return false
  }
}

// Validate all variant items
const validateAllItems = async () => {
  const allVariants: VariantItem[] = []
  for (const variants of selectedVariants.value.values()) {
    allVariants.push(...variants)
  }
  const validations = await Promise.all(allVariants.map((v) => validateVariantItem(v)))
  return validations.every((isValid) => isValid)
}

const canProceed = computed(() => {
  return localItems.value.every((item) => {
    const variants = selectedVariants.value.get(item.product.uid)
    if (!variants || variants.length === 0) return false
    // All variants must have valid quantity and price
    return variants.every((v) => v.quantity > 0 && v.unit_price > 0)
  })
})

const handleNext = async () => {
  const isValid = await validateAllItems()
  if (isValid && canProceed.value) {
    // Convert selected variants to order items format
    const orderItems: PopupOrderItem[] = []
    for (const item of localItems.value) {
      const variants = selectedVariants.value.get(item.product.uid)
      if (variants && variants.length > 0) {
        for (const variantItem of variants) {
          orderItems.push({
            product: item.product,
            variant: variantItem.variant,
            quantity: variantItem.quantity,
            unit_price: variantItem.unit_price,
            notes: item.notes,
          })
        }
      }
    }
    emit("update:orderItems", orderItems)
    emit("next")
  }
}

// Get original price for showing slash-through
const getOriginalPrice = (variant: PopupInventoryVariant) => {
  const originalPrice = parseFloat(variant.original_price)
  const eventPrice = parseFloat(variant.event_price)
  return originalPrice !== eventPrice && originalPrice > eventPrice ? originalPrice : null
}

// Get price display for products
const getProductPriceDisplay = (product: PopupInventory) => {
  if (!product.variants || product.variants.length === 0) return "No price"

  const prices = product.variants.map((v) => parseFloat(v.event_price))
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  if (minPrice === maxPrice) {
    return formatCurrency(minPrice)
  }
  return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
}

// Calculate total quantity across all selected variants
const totalItemsCount = computed(() => {
  let total = 0
  for (const variants of selectedVariants.value.values()) {
    total += variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0)
  }
  return total
})

// Calculate total amount (quantity × unit_price for all variants)
const productsTotal = computed(() => {
  let total = 0
  for (const variants of selectedVariants.value.values()) {
    total += variants.reduce((sum, v) => sum + v.quantity * v.unit_price, 0)
  }
  return total
})

const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="shop-add" size="28" />
    </div>
    <p class="mb-4 text-sm">Adjust quantities, and review prices.</p>

    <h3 class="mb-8 flex items-center gap-2 text-lg font-semibold">
      Select Products <Chip :label="String(localItems.length)" />
    </h3>

    <section class="grid gap-6">
      <div v-for="item in localItems" :key="item.product.uid" class="rounded-xl bg-white">
        <div class="flex gap-4 p-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <img
              v-if="item.product.images?.[0]?.image"
              :src="item.product.images[0].image"
              :alt="item.product.name"
              class="h-full w-full rounded-lg object-cover"
            />
            <Icon v-else name="box" class="h-6 w-6 text-gray-400" />
          </div>
          <div class="flex-1 space-y-1.5">
            <h4 class="text-sm font-medium capitalize">{{ item.product.name }}</h4>
            <div class="flex items-center gap-1.5">
              <span class="text-primary-600 flex items-center gap-1 text-xs">
                <Icon name="tag" class="h-3 w-3" />
                {{ getProductPriceDisplay(item.product) }}
              </span>
            </div>
          </div>
          <Chip
            v-if="
              needsVariantSelection(item.product) && selectedVariants.get(item.product.uid)?.length
            "
            color="primary"
            :label="`${selectedVariants.get(item.product.uid)?.length} variant(s)`"
            icon="box"
          />
          <Chip
            v-if="
              !needsVariantSelection(item.product) && selectedVariants.get(item.product.uid)?.[0]
            "
            color="success"
            :label="`${selectedVariants.get(item.product.uid)?.[0]?.variant.available_quantity ?? 0} in Stock`"
            icon="box"
            class="text-xs"
          />
          <DropdownMenu :items="getActionItems(item)" />
        </div>
        <div class="border-core-200 grid gap-4 border-t p-4">
          <!-- Variant Selection (if needed) -->
          <SelectField
            v-if="needsVariantSelection(item.product)"
            :modelValue="getSelectedVariantValues(item.product)"
            @update:modelValue="onVariantChange(item.product, $event)"
            name="variant"
            label="Select Variant(s)"
            placeholder="Choose variant(s)"
            :options="getVariantOptions(item.product)"
            multiple
            required
            :searchable="true"
            :placement="isMobile ? 'top' : 'auto'"
          />

          <!-- Quantity and Price for each selected variant -->
          <div
            v-for="variantItem in selectedVariants.get(item.product.uid) || []"
            :key="variantItem.variant.uid"
            :class="{
              'border-core-100 rounded-lg border bg-gray-50 p-3': needsVariantSelection(
                item.product,
              ),
            }"
          >
            <div
              v-if="needsVariantSelection(item.product)"
              class="mb-2 flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <Chip color="primary" :label="variantItem.variant.name" />
                <span
                  v-if="getOriginalPrice(variantItem.variant)"
                  class="text-core-300 line-through"
                  style="font-size: 11px"
                >
                  {{ formatCurrency(getOriginalPrice(variantItem.variant)!) }}
                </span>
                <span class="text-core-600 flex items-center gap-1 text-xs">
                  <Icon name="tag" class="h-3 w-3" />
                  {{ formatCurrency(parseFloat(variantItem.variant.event_price)) }}
                </span>
              </div>
              <Chip
                color="success"
                :label="`${variantItem.variant.available_quantity} in Stock`"
                icon="box"
                class="text-xs"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <TextField
                v-model="variantItem.quantity"
                name="quantity"
                type="number"
                label="Quantity"
                placeholder="1"
                :min="1"
                :max="variantItem.variant.available_quantity"
                :error="validationErrors[variantItem.variant.uid]?.quantity"
                @blur="validateVariantItem(variantItem)"
              />
              <TextField
                v-model="variantItem.unit_price"
                name="price"
                type="number"
                label="Unit Price"
                placeholder="e.g. 59.99"
                :min="0"
                step="0.01"
                :error="validationErrors[variantItem.variant.uid]?.unit_price"
                @blur="validateVariantItem(variantItem)"
              />
            </div>
          </div>
          <!-- Notes Section -->
          <div v-if="showNotes[item.product.uid]" class="pt-2">
            <TextAreaField
              v-model="item.notes"
              name="notes"
              label="Notes"
              placeholder="Add special instructions or notes for this item..."
              :rows="3"
            />
          </div>
        </div>
      </div>
    </section>

    <div class="h-40" />

    <div
      class="border-core-200 fixed right-0 bottom-0 left-0 space-y-2 border-t bg-white p-4 md:p-6"
    >
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-600">Total Items count:</p>
        <span class="text-sm font-medium">{{ totalItemsCount }}</span>
      </div>
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-600">Total products amount:</p>
        <span class="text-primary-600 text-base font-semibold">
          {{ formatCurrency(productsTotal) }}
        </span>
      </div>
      <div class="flex gap-3">
        <AppButton label="Back" color="alt" class="w-1/3" icon="arrow-left" @click="emit('prev')" />
        <AppButton label="Next" class="w-2/3" :disabled="!canProceed" @click="handleNext" />
      </div>
    </div>
  </div>
</template>
