<template>
  <MessageModal :open="modelValue" max-width="sm" @close="emit('update:modelValue', false)">
    <div class="bg-success-50 absolute top-3 self-start rounded-full p-1.5">
      <div class="bg-success-100 rounded-full p-2">
        <Icon name="circle-check" size="16" class="text-success-600" />
      </div>
    </div>
    <h6 class="text sm mt-2 font-bold">🎉 Welcome to Leyyow!</h6>
    <p class="mt-2 text-xs md:text-sm">
      You’ve successfully joined the Smile Socks Team. <br /><br />
      Now you can manage sales, track customers, and access your team’s business tools—all in one
      place.
    </p>
    <AppButton label="Great, let's go!" variant="outlined" class="mt-4 w-full" />
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
}>()
</script>
