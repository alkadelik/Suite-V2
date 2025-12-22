<script setup lang="ts">
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import { PopupEvent } from "../types"
import { useClosePopupEvent } from "../api"
import { displayError } from "@/utils/error-handler"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import { computed } from "vue"
import { truncateCurrency } from "@/utils/format-currency"

const props = defineProps<{ open: boolean; event: PopupEvent }>()
const emit = defineEmits(["close", "refresh"])

const stats = computed(() => {
  return [
    {
      icon: "shopping-cart",
      label: "Starting Inventory",
      value: 26,
      valueText: "products",
      chip: "134 items",
    },
    {
      icon: "shopping-cart",
      label: "Closing Inventory",
      value: 26,
      valueText: "products",
      chip: "134 items",
    },
    {
      icon: "shopping-cart",
      label: "Total Sales",
      value: truncateCurrency(100000),
      valueText: "products",
      chip: "8 items sold",
    },
    {
      icon: "people",
      label: "Customers",
      value: 8,
      valueText: "",
      chip: "",
    },
  ]
})

const { mutate: closePopupEvent, isPending } = useClosePopupEvent()

const handleClose = () => {
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
  <DeleteConfirmationModal
    :model-value="open"
    @update:model-value="() => emit('close')"
    :loading="isPending"
    header="Close Popup"
    @delete="handleClose"
    action-label="Close Popup"
  >
    <template #paragraph>
      <div class="space-y-4">
        <p class="text-sm">This will completely remove all records of this popup.</p>

        <div class="border-core-200 rounded-xl border bg-white p-4">
          <h4>My Latest Popup</h4>
          <p class="flex items-center">
            <Icon name="calendar" size="16" class="mr-1" />
            Aug 1, 2024 - Aug 7, 2024
          </p>
          <hr class="border-core-200 my-2" />

          <div class="grid grid-cols-2 gap-4">
            <!-- stats card -->
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="border-primary-300 bg-primary-100 rounded-lg border p-4"
            >
              <!-- title -->
              <div class="flex items-center gap-2">
                <div
                  class="border-primary-500 flex h-10 w-10 items-center justify-center rounded-lg border bg-white"
                >
                  <Icon name="popup" class="text-primary-600 h-5 w-5" />
                </div>
                <h3>Starting Inventory</h3>
              </div>
              <!-- value -->
              <div class="flex items-center justify-between">
                <p>
                  <span class="text-xl font-semibold">500</span> <span class="text-sm">items</span>
                </p>
                <Chip label="134 items" color="blue" />
              </div>
            </div>
            <!--  -->
          </div>
        </div>
      </div>
    </template>

    <template #warning>
      <p class="font-semibold md:text-sm">
        The closing inventory (134 items) will be returned to your main inventory
      </p>
    </template>
  </DeleteConfirmationModal>
</template>
