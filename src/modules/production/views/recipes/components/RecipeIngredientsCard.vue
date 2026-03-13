<script setup lang="ts">
import Icon from "@components/Icon.vue"

type IngredientRow = {
  name: string
  qty: string
  cost: number | string
}

defineProps<{
  rows: IngredientRow[]
}>()
</script>

<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-5">
    <div class="mb-4 flex items-center gap-3">
      <span class="flex size-10 items-center justify-center rounded-xl bg-[#FFF7ED]">
        <Icon name="blur" :size="18" class="text-[#9A3412]" />
      </span>
      <h3 class="text-sm font-semibold text-gray-900">Ingredients</h3>
    </div>

    <div class="overflow-hidden rounded-xl border border-gray-100">
      <div
        v-for="(r, idx) in rows"
        :key="idx"
        class="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-4 last:border-b-0"
      >
        <p class="text-sm text-gray-800">
          {{ r.name }}
          <span class="ml-1 text-xs text-gray-500">({{ r.qty }})</span>
        </p>
        <p class="text-sm font-medium text-gray-900">₦{{ r.cost }}</p>
      </div>
    </div>
  </div>
</template>
