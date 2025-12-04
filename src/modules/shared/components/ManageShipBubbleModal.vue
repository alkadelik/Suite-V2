<template>
  <Modal
    :open="modelValue"
    title="Manage ShipBubble details"
    max-width="xl"
    @close="emit('update:modelValue', false)"
    variant="bottom-nav"
  >
    <div class="mb-6 space-y-2">
      <div class="flex size-10 items-center justify-center rounded-xl bg-gray-200 p-2">
        <Icon name="truck-fast" size="20" />
      </div>

      <p class="text-xs md:text-sm">
        Control how you want to deliver orders from your Leyyow store.
      </p>
    </div>

    <div class="space-y-5 pb-6">
      <div class="border-core-200 flex items-center gap-4 rounded-xl border bg-white px-4 py-3">
        <div class="flex size-10 items-center justify-center rounded-xl bg-gray-200 p-2">
          <Icon name="truck-fast" size="20" />
        </div>
        <div class="flex-1">
          <h3 class="mb-1 text-base font-semibold">Manage Shipping Details</h3>
          <p class="text-core-600 text-sm">Keep your shipping/delivery details up to date.</p>
        </div>
        <AppButton
          label="Edit Details"
          @click="
            $router.push(`/onboarding?shipbubble=true&redirect=${encodeURIComponent(route.path)}`)
          "
        />
      </div>

      <div class="border-core-200 flex items-center gap-4 rounded-xl border bg-white px-4 py-3">
        <div class="flex size-10 items-center justify-center rounded-xl bg-gray-200 p-2">
          <Icon name="truck-fast" size="20" />
        </div>
        <div class="flex-1">
          <h3 class="mb-1 text-base font-semibold">Manage Preferred Couriers</h3>
          <p class="text-core-600 text-sm">Select your preferred delivery provider.</p>
        </div>
        <AppButton
          label="Edit Couriers"
          @click="
            $router.push(
              `/onboarding?shipbubble=true&step=2&redirect=${encodeURIComponent(route.path)}`,
            )
          "
        />
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import AppButton from "@/components/AppButton.vue"
import Modal from "@/components/Modal.vue"
import Icon from "@components/Icon.vue"
import { useRoute } from "vue-router"

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ "update:modelValue": [boolean] }>()

const route = useRoute()
</script>
