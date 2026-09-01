<template>
  <section>
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-core-800 font-sato text-base font-semibold">Receivables</h3>
      <button
        v-if="hasMore"
        type="button"
        class="text-core-600 flex shrink-0 items-center gap-1 text-sm font-medium"
        @click="drawerOpen = true"
      >
        See all
        <Icon name="arrow-right" size="14" />
      </button>
    </div>

    <div class="mt-2 flex items-center gap-2">
      <span class="text-core-900 font-sato text-2xl font-bold">{{ data.totalLabel }}</span>
      <Chip :label="`${data.customerCount} customers`" color="blue" variant="outlined" size="sm" />
    </div>

    <div class="mt-4 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <ReceivableRow v-for="item in visible" :key="item.customerId" :item="item" />
    </div>

    <SeeAllDrawer
      :open="drawerOpen"
      title="Receivables"
      :items="data.items"
      :search-text="(i) => i.name"
      @close="drawerOpen = false"
    >
      <template #item="{ item }">
        <ReceivableRow :item="item" />
      </template>
    </SeeAllDrawer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import ReceivableRow from "./ReceivableRow.vue"
import SeeAllDrawer from "./SeeAllDrawer.vue"
import type { IReceivablesPanel } from "./types"

const props = defineProps<{ data: IReceivablesPanel }>()

const LIMIT = 3
const visible = computed(() => props.data.items.slice(0, LIMIT))
const hasMore = computed(() => props.data.items.length > LIMIT)
const drawerOpen = ref(false)
</script>
