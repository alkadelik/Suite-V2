<template>
  <ConfirmationModal
    :model-value="open"
    variant="error"
    header="Disconnect domain?"
    :paragraph="`Your store will revert to ${revertTo}. You can reconnect this domain anytime.`"
    action-label="Disconnect Domain"
    :loading="loading"
    @update:model-value="onUpdateOpen"
    @confirm="emit('confirm')"
  />
</template>

<script setup lang="ts">
import ConfirmationModal from "@components/ConfirmationModal.vue"

defineProps<{ open: boolean; loading?: boolean; revertTo: string }>()
const emit = defineEmits<{ close: []; confirm: [] }>()

function onUpdateOpen(v: boolean) {
  if (!v) emit("close")
}
</script>
