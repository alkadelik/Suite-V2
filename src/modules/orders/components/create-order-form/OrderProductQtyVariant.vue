<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import SelectField from "@components/form/SelectField.vue"
import Icon from "@components/Icon.vue"
import type { IProductCatalogue } from "@modules/inventory/types"
import { computed, onMounted, ref } from "vue"

interface OrderItem {
  product: IProductCatalogue
  variant: { uid: string; name: string; sku: string; price: string; stock: number } | null
  quantity: number
  unit_price: number
  notes?: string
}

const props = defineProps<{
  selectedProducts: IProductCatalogue[]
  orderItems: OrderItem[]
}>()

const emit = defineEmits<{
  next: []
  prev: []
  "update:orderItems": [items: OrderItem[]]
}>()

const localItems = ref<OrderItem[]>([])

// Check if a product needs variant selection (has multiple variants OR has attributes)
const needsVariantSelection = (product: IProductCatalogue) => {
  if (!product.variants || product.variants.length === 0) return false
  if (product.variants.length > 1) return true
  // Check if the single variant has attributes
  return product.variants[0].attributes && product.variants[0].attributes.length > 0
}

// Get variant options for select dropdown
const getVariantOptions = (product: IProductCatalogue) => {
  if (!product.variants) return []
  return product.variants.map((v) => ({
    label:
      v.attributes.length > 0
        ? `${v.name} (${v.attributes.map((a) => a.attribute_value).join(", ")})`
        : v.name,
    value: v.uid,
  }))
}

// Initialize local items when component mounts or products change
onMounted(() => {
  if (props.orderItems.length > 0) {
    localItems.value = [...props.orderItems]
  } else {
    // Create initial items from selected products
    localItems.value = props.selectedProducts.map((product) => {
      // Auto-select variant if there's only one and no attributes
      const defaultVariant =
        product.variants &&
        product.variants.length === 1 &&
        product.variants[0].attributes.length === 0
          ? {
              uid: product.variants[0].uid,
              name: product.variants[0].name,
              sku: product.variants[0].sku,
              price: product.variants[0].price,
              stock: product.variants[0].available_stock,
            }
          : null

      return {
        product,
        variant: defaultVariant,
        quantity: 1,
        unit_price: defaultVariant ? parseFloat(defaultVariant.price) : 0,
        notes: "",
      }
    })
  }
})

// Handle variant selection
const onVariantChange = (
  item: OrderItem,
  variantValue:
    | string
    | number
    | Record<string, unknown>
    | null
    | (string | number | Record<string, unknown>)[],
) => {
  if (!variantValue || Array.isArray(variantValue)) return
  let uid = ""
  if (typeof variantValue === "object" && variantValue.value) {
    const val = variantValue.value
    uid = typeof val === "string" || typeof val === "number" ? String(val) : ""
  } else if (typeof variantValue === "string" || typeof variantValue === "number") {
    uid = String(variantValue)
  }
  const selectedVariant = item.product.variants.find((v) => v.uid === uid)
  if (selectedVariant) {
    item.variant = {
      uid: selectedVariant.uid,
      name: selectedVariant.name,
      sku: selectedVariant.sku,
      price: selectedVariant.price,
      stock: selectedVariant.available_stock,
    }
    // Update unit price to variant price (user can still edit)
    item.unit_price = parseFloat(selectedVariant.price)
  }
}

const removeItem = (index: number) => {
  localItems.value.splice(index, 1)
}

const canProceed = computed(() => {
  return localItems.value.every((item) => {
    // Must have a variant selected and valid quantity/price
    return item.variant && item.quantity > 0 && item.unit_price > 0
  })
})

const handleNext = () => {
  if (canProceed.value) {
    emit("update:orderItems", localItems.value)
    emit("next")
  }
}

// Get original price for showing slash-through
const getOriginalPrice = (item: OrderItem) => {
  if (!item.variant) return null
  const originalPrice = parseFloat(item.variant.price)
  return originalPrice !== item.unit_price ? originalPrice : null
}
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="mb-4 text-sm">Adjust quantities, and review prices.</p>

    <h3 class="mb-8 text-lg font-semibold">
      Select Products <Chip :label="String(localItems.length)" />
    </h3>

    <section class="grid gap-6">
      <div v-for="(item, index) in localItems" :key="item.product.uid" class="rounded-xl bg-white">
        <div class="flex gap-4 p-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <img
              v-if="item.product.images && item.product.images.length > 0"
              :src="item.product.images[0]"
              :alt="item.product.name"
              class="h-full w-full rounded-lg object-cover"
            />
            <Icon v-else name="box" class="h-6 w-6 text-gray-400" />
          </div>
          <div class="flex-1 space-y-1.5">
            <h4 class="text-sm font-medium capitalize">{{ item.product.name }}</h4>
            <div class="flex items-center gap-1.5">
              <span
                v-if="getOriginalPrice(item)"
                class="text-core-300 line-through"
                style="font-size: 11px"
              >
                {{ formatCurrency(getOriginalPrice(item)!) }}
              </span>
              <span class="text-primary-600 flex items-center gap-1 text-xs">
                <Icon name="box" class="h-3 w-3" />
                {{ item.unit_price > 0 ? formatCurrency(item.unit_price) : "Set price" }}
              </span>
            </div>
          </div>
          <Chip
            v-if="item.variant"
            color="success"
            :label="`${item.variant.stock} in Stock`"
            icon="box"
          />
          <button
            v-if="localItems.length > 1"
            @click="removeItem(index)"
            class="text-gray-400 hover:text-gray-600"
          >
            <Icon name="trash" class="h-5 w-5 cursor-pointer" />
          </button>
        </div>
        <div class="border-core-200 grid gap-4 border-t p-4">
          <!-- Variant Selection (if needed) -->
          <SelectField
            v-if="needsVariantSelection(item.product)"
            :modelValue="item.variant?.name"
            @update:modelValue="onVariantChange(item, $event)"
            name="variant"
            label="Select Variant"
            placeholder="Choose a variant"
            :options="getVariantOptions(item.product)"
            required
          />

          <!-- Quantity and Price -->
          <div class="grid grid-cols-2 gap-4">
            <TextField
              v-model="item.quantity"
              name="quantity"
              type="number"
              label="Quantity"
              placeholder="1"
              :min="1"
              :max="item.variant?.stock || 999999"
              :disabled="!item.variant"
            />
            <TextField
              v-model="item.unit_price"
              name="price"
              type="number"
              label="Unit Price"
              placeholder="e.g. 59.99"
              :min="0"
              step="0.01"
              :disabled="!item.variant"
            />
          </div>
        </div>
      </div>
    </section>

    <div class="h-24" />

    <div class="border-core-200 fixed right-0 bottom-0 left-0 flex gap-3 border-t bg-white p-6">
      <AppButton label="Back" color="alt" class="w-1/3" icon="arrow-left" @click="emit('prev')" />
      <AppButton label="Next" class="w-2/3" :disabled="!canProceed" @click="handleNext" />
    </div>
  </div>
</template>
