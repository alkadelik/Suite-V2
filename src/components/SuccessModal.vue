<template>
  <MessageModal
    :open="modelValue"
    max-width="sm"
    :handle-padding="false"
    @close="emit('update:modelValue', false)"
  >
    <template #header>
      <div class="flex items-start justify-between px-6 pt-4">
        <div class="bg-success-50 flex size-12 items-center justify-center rounded-full">
          <div class="bg-success-100 flex size-10 items-center justify-center rounded-full">
            <Icon name="check-circle" size="20" class="text-success-600" />
          </div>
        </div>

        <button
          type="button"
          @click="emit('update:modelValue', false)"
          class="text-core-800 hover:text-core-600 transition-colors"
        >
          <Icon name="x-close" size="20" />
        </button>
      </div>
    </template>

    <div class="px-6 pb-8">
      <h3 class="text-core-800 mt-4 text-lg font-bold">{{ title }}</h3>
      <p class="text-core-500 mt-2 text-sm">{{ subtitle }}</p>

      <AppButton
        :label="buttonText"
        variant="outlined"
        class="mt-6 w-full"
        @click="emit('update:modelValue', false)"
      />
    </div>
  </MessageModal>
</template>

<script setup lang="ts">
import MessageModal from "@/components/MessageModal.vue"
import Icon from "@/components/Icon.vue"
import AppButton from "@/components/AppButton.vue"

interface Props {
  modelValue: boolean
  title: string
  subtitle: string
  buttonText?: string
}

withDefaults(defineProps<Props>(), {
  buttonText: "Awesome!",
})

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
}>()
</script>
