<template>
  <Modal :open="open" :show-header="false" max-width="sm" @close="emit('close')">
    <div class="flex flex-col items-center px-2 py-4 text-center">
      <!-- NOTE: design shows a gift illustration here; no gift icon asset exists yet. -->
      <span
        class="bg-error-50 text-error-500 flex h-14 w-14 items-center justify-center rounded-full"
      >
        <Icon name="danger" size="28" />
      </span>
      <h3 class="text-core-800 mt-4 text-lg font-semibold">Overwrite Products</h3>
      <p class="text-core-500 mt-1.5 text-sm">
        Type <span class="font-semibold">"OVERWRITE"</span> to complete
      </p>
      <TextField
        :model-value="text"
        placeholder="Type Here"
        class="mt-3 w-full"
        @update:model-value="(v: string) => (text = v)"
      />
    </div>

    <template #footer>
      <div class="flex gap-3">
        <AppButton
          label="Cancel"
          color="alt"
          variant="outlined"
          class="flex-1"
          @click="emit('close')"
        />
        <AppButton
          label="Complete"
          class="flex-1"
          :disabled="!canComplete"
          :loading="loading"
          @click="emit('complete')"
        />
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import Modal from "@components/Modal.vue"
import Icon from "@components/Icon.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"

const props = defineProps<{ open: boolean; loading?: boolean }>()
const emit = defineEmits<{ close: []; complete: [] }>()

const text = ref("")
const canComplete = computed(() => text.value.trim().toUpperCase() === "OVERWRITE")

watch(
  () => props.open,
  (o) => {
    if (o) text.value = ""
  },
)
</script>
