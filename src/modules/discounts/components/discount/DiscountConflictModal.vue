<template>
  <Modal :open="open" :show-header="false" max-width="lg" @close="emit('close')">
    <div class="px-2 py-4">
      <div class="flex flex-col items-center text-center">
        <span
          class="bg-warning-50 text-warning-500 flex h-14 w-14 items-center justify-center rounded-full"
        >
          <Icon name="danger" size="28" />
        </span>
        <h3 class="text-core-800 mt-4 text-lg font-semibold">Discount Conflict</h3>
        <p class="text-core-500 mt-1.5 max-w-md text-sm">
          {{
            message ||
            "Some of the products you selected already have an active discount. Overwriting will replace their existing discount with this one."
          }}
        </p>
      </div>

      <!-- Conflicting variants — show exactly where each conflict comes from -->
      <ul class="mt-5 max-h-64 space-y-2 overflow-y-auto">
        <li
          v-for="c in conflicts"
          :key="c.variant_uid"
          class="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3"
        >
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600"
          >
            <Icon name="box" size="18" />
          </span>
          <div class="min-w-0 flex-1 text-left">
            <p class="truncate text-sm font-medium text-gray-800">{{ c.product_name }}</p>
            <p
              v-if="c.variant_name && c.variant_name !== c.product_name"
              class="truncate text-xs text-gray-500"
            >
              {{ c.variant_name }}
            </p>
          </div>
          <span class="shrink-0 text-right text-xs text-gray-500">
            on
            <span class="text-primary-600 font-medium">{{ c.discount_name }}</span>
          </span>
        </li>
      </ul>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <AppButton label="Overwrite" class="flex-1" @click="emit('overwrite')" />
        <AppButton
          label="Cancel"
          color="alt"
          variant="outlined"
          class="flex-1"
          @click="emit('close')"
        />
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from "@components/Modal.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"

/** Matches the backend `conflicts[]` entries in a DISCOUNT_CONFLICT response. */
export interface TDiscountConflict {
  variant_uid: string
  variant_name: string
  product_name: string
  product_uid: string
  discount_name: string
}

defineProps<{ open: boolean; conflicts: TDiscountConflict[]; message?: string }>()
const emit = defineEmits<{ close: []; overwrite: [] }>()
</script>
