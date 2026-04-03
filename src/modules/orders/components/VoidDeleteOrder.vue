<script setup lang="ts">
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import FormField from "@components/form/FormField.vue"
import { ref } from "vue"
import OrderCard from "./OrderCard.vue"
import { TOrder } from "../types"

defineProps<{ open: boolean; action: string; loading: boolean; order: TOrder }>()

const emit = defineEmits(["close", "action"])

const reason = ref("")
</script>

<template>
  <DeleteConfirmationModal
    :model-value="open"
    @update:model-value="() => emit('close')"
    :loading="loading"
    :header="action === 'void' ? 'Void Order' : 'Delete Order'"
    @delete="() => emit('action', { action, reason })"
    :action-label="action === 'void' ? 'Void Order' : 'Delete Order'"
  >
    <template #paragraph>
      <div class="space-y-4">
        <p class="text-sm">This will completely remove all records of this order.</p>

        <OrderCard :order="order" :show-actions="false" />

        <FormField
          v-if="action === 'void'"
          type="textarea"
          name="reason"
          label="Reason For Voiding"
          placeholder="Please provide a reason for voiding this order"
          @update:model-value="reason = $event"
        />
      </div>
    </template>
  </DeleteConfirmationModal>
</template>
