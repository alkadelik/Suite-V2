<script setup lang="ts">
import { PopupEvent } from "../types"
import { useClosePopupEvent, useGetPopupEventById } from "../api"
import { displayError } from "@/utils/error-handler"
import Icon from "@components/Icon.vue"
import { computed } from "vue"
import { truncateCurrency } from "@/utils/format-currency"
import { formatDate } from "../constants"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import StatCard from "@components/StatCard.vue"

const props = withDefaults(
  defineProps<{ open: boolean; event: PopupEvent; hasFullDetails?: boolean }>(),
  { hasFullDetails: true },
)
const emit = defineEmits(["close", "refresh"])

// Only fetch details when not already provided
const shouldFetch = computed(() => !props.hasFullDetails && props.open)

const { data: popupEvt, isPending: isFetchingDetails } = useGetPopupEventById(
  () => props.event.uid,
  shouldFetch,
)

// Use fetched data if available, otherwise use props
const eventData = computed(() => {
  if (props.hasFullDetails) {
    return props.event
  }
  return popupEvt.value || props.event
})

const stats = computed(() => {
  const data = eventData.value
  return [
    {
      icon: "bag",
      label: "Starting Inventory",
      value: data.starting_inventory.products,
      valueText: "products",
      chip: `${data.starting_inventory.items} items`,
    },
    {
      icon: "bag",
      label: "Closing Inventory",
      value: data.closing_inventory.products,
      valueText: "products",
      chip: `${data.closing_inventory.items} items`,
    },
    {
      icon: "shopping-cart",
      label: "Total Sales",
      value: truncateCurrency(data.total_sales_amount || 0),
      valueText: "",
      chip: data.total_orders ? `${data.total_orders || 0} items sold` : "",
    },
    {
      icon: "people",
      label: "Customers",
      value: data.customer_count || 0,
      valueText: "",
      chip: "",
    },
  ]
})

const { mutate: closePopupEvent, isPending: isClosing } = useClosePopupEvent()

const handleClose = () => {
  console.log("COLOSINF")
  closePopupEvent(props.event.uid, {
    onSuccess: () => {
      emit("refresh")
      emit("close")
    },
    onError: displayError,
  })
}
</script>

<template>
  <ConfirmationModal
    :model-value="open"
    @update:model-value="() => emit('close')"
    :loading="isClosing"
    header="Close Popup"
    @confirm="handleClose"
    action-label="Close Popup"
    max-width="2xl"
    variant="error"
    :info-message="`The closing inventory (${eventData?.closing_inventory?.items || 0} items) will be returned to your main inventory.`"
  >
    <template #paragraph>
      <div class="space-y-4">
        <p class="text-sm">This will completely remove all records of this popup.</p>

        <div class="border-core-200 rounded-xl border bg-white p-4">
          <h4 class="mb-2 text-base font-semibold">{{ event.name }}</h4>
          <p class="flex items-center text-sm">
            <Icon name="calendar" size="16" class="mr-1" />
            {{ formatDate(event.start_date || "") }} -
            {{ formatDate(event.end_date || "") }}
          </p>
          <hr class="border-core-200 my-4" />

          <div
            v-if="!hasFullDetails && isFetchingDetails"
            class="flex items-center justify-center py-12"
          >
            <Icon name="loader" size="64" class="!animate text-primary-600 !animate-spin" />
          </div>

          <!-- stats card -->
          <div v-else class="grid grid-cols-2 gap-4">
            <StatCard v-for="stat in stats" variant="alt" :key="stat.label" :stat="stat" />
          </div>
        </div>
      </div>
    </template>
  </ConfirmationModal>
</template>
