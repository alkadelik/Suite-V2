<script setup lang="ts">
import Icon from "@components/Icon.vue"

defineProps<{
  items: {
    label: string
    value: string | number
    prev_value: string | number
    icon: string
    labelTag?: string
    labelTagClass?: string
    valueTag?: string
    valueTagClass?: string
    iconClass?: string
  }[]
  loading?: boolean
  defaultIcon: string
  defaultIconClass?: string
}>()
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading" class="p-8">
      <p>loading...</p>
    </div>

    <!-- Grid: 2 on mobile, 2 on tablet, 4 on desktop -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="flex flex-col gap-1 rounded-lg px-3.5 py-3 shadow-sm md:gap-3"
        :class="['bg-primary-25 border-primary-200 border md:border-0 md:bg-white']"
      >
        <!-- Top section -->
        <div class="flex flex-col gap-5 md:flex-row md:items-center md:gap-2">
          <span class="flex h-10 w-10 items-center justify-center rounded-2xl md:bg-gray-50">
            <!-- Mobile (default) -->
            <span class="block md:hidden">
              <Icon :name="item.icon" :class="['text-primary-600', item.iconClass]" :size="24" />
            </span>

            <!-- Tablet/Desktop -->
            <span class="hidden md:block">
              <Icon
                :name="defaultIcon"
                :class="['text-primary-600', defaultIconClass]"
                :size="24"
              />
            </span>
          </span>

          <h4 class="text-core-600 !font-outfit flex items-end gap-1.5 text-sm">
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

        <!-- Value -->
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

        <!-- Previous value comparison -->
        <p class="text-core-600 text-xs">vs. {{ item.prev_value }} last wk</p>
      </div>
    </div>
  </div>
</template>
