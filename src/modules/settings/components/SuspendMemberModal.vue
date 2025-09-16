<template>
  <MessageModal :open="modelValue" max-width="lg" @close="emit('update:modelValue', false)">
    <div class="bg-warning-50 absolute top-3 self-start rounded-full p-1.5">
      <div class="bg-warning-100 rounded-full p-2">
        <Icon name="pause" size="16" class="text-warning-600" />
      </div>
    </div>

    <h6 class="text sm mt-2 font-bold">Suspend Member</h6>
    <p class="mt-2 text-xs md:text-sm">Are you sure you want to suspend this member?</p>

    <div
      class="border-warning-300 bg-warning-25 text-warning-700 my-3 flex items-center gap-3 rounded-lg border p-3"
    >
      <div class="border-warning-100 rounded-full border-2 p-0.5">
        <div class="border-warning-300 rounded-full border-2 p-0.5">
          <Icon name="info-circle-filled" size="20" class="text-warning-600" />
        </div>
      </div>
      <p class="text-xs font-semibold md:text-sm">
        You can reverse this action by reactivating the member.
      </p>
    </div>

    <div class="mt-5 flex gap-2">
      <AppButton
        label="Cancel"
        variant="outlined"
        @click="emit('update:modelValue', false)"
        class="flex-1 !border-gray-200 bg-white !text-gray-700 hover:!bg-gray-100"
      />
      <AppButton
        label="Suspend"
        variant="filled"
        class="!bg-warning-600 hover:!bg-warning-500 flex-1"
        :loading="loading"
        @click="emit('suspend')"
      />
    </div>
  </MessageModal>
</template>

<script setup lang="ts">
import MessageModal from "@/components/MessageModal.vue"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"

defineProps<{ modelValue: boolean; loading: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
  suspend: []
}>()
</script>
