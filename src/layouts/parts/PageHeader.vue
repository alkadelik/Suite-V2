<script setup lang="ts">
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { computed } from "vue"
import { useRoute } from "vue-router"
const route = useRoute()

const title = computed(() => {
  if (route.path.startsWith("/order")) return "Orders"
  if (route.path.startsWith("/inventory")) return "Inventory"
  if (route.path.startsWith("/popups")) return "Popups"
  if (route.path.startsWith("/customers")) return "Customers"
  return "Page"
})
</script>

<template>
  <header
    v-if="title !== 'Page'"
    class="bg-primary-25 border-primary-200 fixed top-0 right-0 left-0 z-30 border-b lg:hidden"
  >
    <div class="flex items-end gap-1 px-4 py-3">
      <div class="flex-1">
        <button
          type="button"
          class="text-primary-600 flex items-center gap-2 text-sm"
          @click="$router.back()"
        >
          <Icon name="arrow-left" size="20" />
          Back
        </button>
        <h1 class="text-xl font-semibold">{{ title || "Page" }}</h1>
      </div>
      <Chip icon="info-circle" label="Tutorial" />
    </div>
  </header>
</template>
