<template>
  <MessageModal :open="modelValue" max-width="lg" @close="emit('update:modelValue', false)">
    <div class="bg-error-50 absolute top-3 self-start rounded-full p-1.5">
      <div class="bg-error-100 rounded-full p-2">
        <Icon name="trash-01" size="16" class="text-error-600" />
      </div>
    </div>

    <h6 class="text sm mt-2 font-bold">Delete Member</h6>
    <p class="mt-2 text-xs md:text-sm">Are you sure you want to delete this member?</p>

    <div
      class="border-error-300 bg-error-25 text-error-700 my-3 flex items-center gap-3 rounded-lg border p-3"
    >
      <div class="border-error-100 rounded-full border-2 p-0.5">
        <div class="border-error-300 rounded-full border-2 p-0.5">
          <Icon name="info-circle-filled" size="20" class="text-error-600" />
        </div>
      </div>
      <p class="text-xs font-semibold md:text-sm">This action cannot be reversed.</p>
    </div>

    <div class="mt-5 flex gap-2">
      <AppButton
        label="Cancel"
        variant="outlined"
        @click="emit('update:modelValue', false)"
        class="flex-1 !border-gray-200 bg-white !text-gray-700 hover:!bg-gray-100"
      />
      <AppButton
        label="Delete"
        variant="filled"
        class="!bg-error-600 hover:!bg-error-500 flex-1"
        @click="emit('delete')"
      />
    </div>
  </MessageModal>
</template>

<script setup lang="ts">
import MessageModal from "@/components/MessageModal.vue"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
  delete: []
}>()
</script>
