<script setup lang="ts">
import Chip from "@components/Chip.vue"
import Drawer from "@components/Drawer.vue"
import Icon from "@components/Icon.vue"

defineProps<{ open: boolean }>()

const emit = defineEmits(["close"])
</script>

<template>
  <Drawer :open="open" max-width="2xl" variant="fullscreen" @close="emit('close')">
    <template #header>
      <div class="flex items-center gap-2 px-6 py-4">
        <h2 class="text-core-800 text-lg font-semibold">Shipping Details</h2>
        <Chip icon="truck-fast" label="In Transit" />

        <button
          type="button"
          @click="emit('close')"
          class="text-core-800 hover:text-core-600 ml-auto"
        >
          <Icon name="close-circle" size="20" />
        </button>
      </div>
    </template>
  </Drawer>
</template>
