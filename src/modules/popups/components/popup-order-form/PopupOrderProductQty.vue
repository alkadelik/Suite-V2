<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import { PopupInventory } from "@modules/popups/types"
import { computed, onMounted, ref } from "vue"

interface PopupOrderItem {
  product: PopupInventory
  quantity: number
  unit_price: number
}

const props = defineProps<{
  selectedProducts: PopupInventory[]
  orderItems: PopupOrderItem[]
}>()

const emit = defineEmits<{
  next: []
  prev: []
  "update:orderItems": [items: PopupOrderItem[]]
}>()

const localItems = ref<PopupOrderItem[]>([])

// Initialize local items when component mounts or products change
onMounted(() => {
  if (props.orderItems.length > 0) {
    localItems.value = [...props.orderItems]
  } else {
    // Create initial items from selected products
    localItems.value = props.selectedProducts.map((product) => ({
      product,
      quantity: 1,
      unit_price: parseFloat(product.event_price), // Use event price as default
    }))
  }
})

const removeItem = (index: number) => {
  localItems.value.splice(index, 1)
}

const canProceed = computed(() => {
  return localItems.value.every((item) => {
    // Must have valid quantity and price
    return item.quantity > 0 && item.unit_price > 0
  })
})

const handleNext = () => {
  if (canProceed.value) {
    emit("update:orderItems", localItems.value)
    emit("next")
  }
}

// Get original price for showing slash-through
const getOriginalPrice = (item: PopupOrderItem) => {
  const originalPrice = parseFloat(item.product.original_price)
  const eventPrice = parseFloat(item.product.event_price)
  return originalPrice !== eventPrice && originalPrice > eventPrice ? originalPrice : null
}
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="mb-4 text-sm">Adjust quantities and review prices.</p>

    <h3 class="mb-8 text-lg font-semibold">
      Selected Products <Chip :label="String(localItems.length)" />
    </h3>

    <section class="grid gap-6">
      <div v-for="(item, index) in localItems" :key="item.product.uid" class="rounded-xl bg-white">
        <div class="flex gap-4 p-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Icon name="box" class="h-6 w-6 text-gray-400" />
          </div>
          <div class="flex-1 space-y-1.5">
            <h4 class="text-sm font-medium capitalize">{{ item.product.product_name }}</h4>
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
            color="success"
            :label="`${item.product.available_quantity} available`"
            icon="box"
          />
          <button @click="removeItem(index)" class="text-gray-400 hover:text-gray-600">
            <Icon name="trash" class="h-5 w-5 cursor-pointer" />
          </button>
        </div>
        <div class="border-core-200 grid gap-4 border-t p-4">
          <!-- Quantity and Price -->
          <div class="grid grid-cols-2 gap-4">
            <TextField
              v-model="item.quantity"
              name="quantity"
              type="number"
              label="Quantity"
              placeholder="1"
              :min="1"
              :max="item.product.available_quantity"
            />
            <TextField
              v-model="item.unit_price"
              name="price"
              type="number"
              label="Unit Price"
              placeholder="e.g. 59.99"
              :min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>
    </section>

    <div class="h-24" />

    <div
      class="border-core-200 bg-base-background fixed right-0 bottom-0 left-0 flex gap-3 border-t p-6"
    >
      <AppButton label="Back" color="alt" class="w-1/3" icon="arrow-left" @click="emit('prev')" />
      <AppButton label="Next" class="w-2/3" :disabled="!canProceed" @click="handleNext" />
    </div>
  </div>
</template>
