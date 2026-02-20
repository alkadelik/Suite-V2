<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Modal from "@components/Modal.vue"
import { TOrderItem } from "../types"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import { useMarkAllFulfilled, usePartiallyFulfill } from "../api"
import { toast } from "@/composables/useToast"
import { ref, computed, watch } from "vue"
import { displayError } from "@/utils/error-handler"
import { useMediaQuery } from "@vueuse/core"

type Props = {
  open: boolean
  items: TOrderItem[]
  orderId: string
}

const props = defineProps<Props>()
const emit = defineEmits(["close", "refresh"])

// Track quantities for each item
const itemQuantities = ref<Record<string, number>>({})

// Initialize quantities when modal opens
const initializeQuantities = () => {
  itemQuantities.value = props.items.reduce(
    (acc, item) => {
      acc[item.uid] = 0
      return acc
    },
    {} as Record<string, number>,
  )
}

// Initialize when items are loaded
watch(
  () => props.items,
  (items) => {
    if (props.open && items.length > 0) {
      initializeQuantities()
    }
  },
  { immediate: true },
)

// Compute unfulfilled items
const unfulfilledItems = computed(() =>
  props.items.filter((item) => item.qty_fulfilled < item.quantity),
)

// Check if all items are fully fulfilled
const canMarkAll = computed(() => unfulfilledItems.value.length > 0)

// Check if any item has a valid quantity to fulfill
const canFulfill = computed(() => Object.values(itemQuantities.value).some((qty) => qty > 0))

const { mutate: markAllFulfilled, isPending: isMarkingAll } = useMarkAllFulfilled()
const { mutate: partiallyFulfill, isPending: isFulfilling } = usePartiallyFulfill()

const handleMarkAll = () => {
  markAllFulfilled(props.orderId, {
    onSuccess: () => {
      toast.success("All items marked as fulfilled")
      emit("refresh")
      emit("close")
    },
    onError: displayError,
  })
}

const incrementQuantity = (item: TOrderItem) => {
  const remaining = item.quantity - item.qty_fulfilled
  if (itemQuantities.value[item.uid] < remaining) {
    itemQuantities.value[item.uid]++
  }
}

const decrementQuantity = (item: TOrderItem) => {
  if (itemQuantities.value[item.uid] > 0) {
    itemQuantities.value[item.uid]--
  }
}

const handleQuantityInput = (item: TOrderItem, value: string) => {
  const numValue = parseInt(value) || 0
  const remaining = item.quantity - item.qty_fulfilled
  // Clamp value between 0 and remaining quantity
  itemQuantities.value[item.uid] = Math.max(0, Math.min(numValue, remaining))
}

const handleFulfill = () => {
  // Build items array with only items that have quantity > 0
  const itemsToFulfill = Object.entries(itemQuantities.value)
    .filter(([, quantity]) => quantity > 0)
    .map(([uid, quantity]) => {
      const item = props.items.find((i) => i.uid === uid)
      return { variant: item!.variant, qty: quantity }
    })

  if (itemsToFulfill.length === 0) {
    toast.error("Please select at least one item to fulfill")
    return
  }

  partiallyFulfill(
    {
      id: props.orderId,
      body: { items: itemsToFulfill },
    },
    {
      onSuccess: () => {
        const itemCount = itemsToFulfill.length
        toast.success(`${itemCount} ${itemCount === 1 ? "item" : "items"} marked as fulfilled`)
        emit("refresh")
        emit("close")
      },
      onError: displayError,
    },
  )
}

// Re-initialize when modal opens
const handleModalChange = (isOpen: boolean) => {
  if (!isOpen) {
    emit("close")
  } else {
    initializeQuantities()
  }
}

const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)
</script>

<template>
  <Modal
    :open="open"
    max-width="xl"
    title="Fulfill Order"
    @close="handleModalChange(false)"
    body-class="!px-4 md:!px-6"
    variant="bottom-nav"
  >
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="text-core-700 mb-4 text-sm">
      Select the quantity of items you want to fulfill for this order
    </p>

    <div class="mb-4 flex items-center justify-between">
      <h3 class="flex items-center gap-2 text-lg font-semibold">
        <span>All Items</span>
        <Chip :label="String(unfulfilledItems.length)" />
      </h3>
      <AppButton
        v-if="canMarkAll"
        variant="text"
        label="Fulfill All Items"
        size="sm"
        :loading="isMarkingAll"
        :disabled="isMarkingAll"
        @click="handleMarkAll"
      />
    </div>

    <div class="space-y-3">
      <div
        v-for="item in unfulfilledItems"
        :key="item.uid"
        class="border-core-200 flex items-center gap-2 rounded-lg border bg-white p-2 md:gap-3 md:p-4"
      >
        <!-- Product Icon -->
        <span
          class="bg-core-50 flex size-10 shrink-0 items-center justify-center rounded-lg md:size-12"
        >
          <Icon name="box" size="20" class="text-gray-500" />
        </span>

        <!-- Product Info -->
        <div class="min-w-0 flex-1">
          <h3 class="flex items-baseline gap-1 text-sm font-medium">
            <span class="truncate"> {{ item.product_name }} </span>
            <span class="text-primary-600 shrink-0 text-xs">(x{{ item.quantity }})</span>
          </h3>
          <p class="text-core-400 truncate text-xs">{{ item.variant_name?.split(" - ")[1] }}</p>
          <p class="text-core-400 mt-1 text-xs">
            Fulfilled: {{ item.qty_fulfilled }}/{{ item.quantity }}
          </p>
        </div>

        <!-- Quantity Controls -->
        <div class="ml-2 flex items-center gap-2">
          <AppButton
            icon="minus"
            :size="isMobile ? 'xs' : 'sm'"
            :disabled="itemQuantities[item.uid] === 0"
            @click="decrementQuantity(item)"
          />

          <TextField
            type="number"
            :model-value="String(itemQuantities[item.uid])"
            :suffix="`/ ${item.quantity - item.qty_fulfilled}`"
            input-class="max-w-[32px] md:max-w-[60px] text-center"
            class="w-[88px] md:w-32"
            size="sm"
            @update:model-value="(val) => handleQuantityInput(item, val)"
          />

          <AppButton
            icon="add"
            :size="isMobile ? 'xs' : 'sm'"
            :disabled="itemQuantities[item.uid] >= item.quantity - item.qty_fulfilled"
            @click="incrementQuantity(item)"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="unfulfilledItems.length === 0"
        class="border-core-200 flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 py-12"
      >
        <Icon name="box" size="48" class="text-core-300 mb-3" />
        <p class="text-core-600 mb-1 text-sm font-medium">All items fulfilled</p>
        <p class="text-core-400 text-xs">This order has been completely fulfilled</p>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2">
        <AppButton
          label="Fulfill Selected Quantities"
          class="flex-1"
          :loading="isFulfilling"
          :disabled="!canFulfill || isFulfilling"
          @click="handleFulfill"
        />
      </div>
    </template>
  </Modal>
</template>
