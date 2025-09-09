<script setup>
import Icon from "@components/Icon.vue"

defineProps({ items: { type: Array, default: () => [] }, loading: Boolean })
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading" class="p-8">
      <!-- <LoadingIcon class="!py-2" /> -->
      <p>loading...</p>
    </div>
    <div v-else class="grid grid-cols-2 gap-4">
      <div v-for="(item, i) in items" :key="i" class="rounded-lg bg-white px-3.5 py-3">
        <div class="inline-flex flex-col gap-1">
          <span class="flex h-6 w-6 items-center justify-center rounded-md bg-white">
            <Icon :name="item.icon" class="text-primary-600" />
          </span>
          <h4 class="text-core-600 flex items-end gap-1.5 text-sm">
            {{ item.label }}
            <span
              v-if="item.labelTag"
              class="bg-primary-50 text-primary-400 inline-flex h-5 w-fit items-center justify-center rounded-xl !px-2.5 text-[12px] font-medium"
              :class="item.labelTagClass"
            >
              {{ item.labelTag }}
            </span>
          </h4>
        </div>
        <p class="text-core-800 flex items-end gap-1.5 text-xl font-bold">
          {{ item.value }}
          <span
            v-if="item.valueTag"
            class="bg-primary-50 text-primary-400 inline-flex h-5 w-fit items-center justify-center rounded-xl !px-2.5 text-[12px] font-medium"
            :class="item.valueTagClass"
          >
            {{ item.valueTag }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>
