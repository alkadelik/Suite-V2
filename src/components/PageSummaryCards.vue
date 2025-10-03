<script setup lang="ts">
import Icon from "@components/Icon.vue"

const props = defineProps<{
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

// Calculate remainder items that don't fill a complete row
const getRemainder = (total: number, max: number) => {
  return total % max
}

// Get span class for an item based on its position
const getItemSpanClass = (index: number) => {
  const count = props.items.length
  const position = index + 1

  // Mobile (max 2)
  const mobileRemainder = getRemainder(count, 2)
  const isMobileLastRow = position > Math.floor(count / 2) * 2
  const mobileSpan = mobileRemainder === 1 && isMobileLastRow ? "col-span-2" : ""

  // Tablet (max 3)
  const tabletRemainder = getRemainder(count, 3)
  const isTabletLastRow = position > Math.floor(count / 3) * 3
  const tabletSpan =
    tabletRemainder > 0 && isTabletLastRow
      ? `md:col-span-${tabletRemainder === 1 ? "3" : "1"}`
      : "md:col-span-1"

  // Desktop (max 4)
  const desktopRemainder = getRemainder(count, 4)
  const isDesktopLastRow = position > Math.floor(count / 4) * 4
  const desktopSpan =
    desktopRemainder > 0 && isDesktopLastRow
      ? `lg:col-span-${desktopRemainder === 1 ? "4" : desktopRemainder === 2 ? "2" : desktopRemainder === 3 ? "1" : "1"}`
      : "lg:col-span-1"

  return `${mobileSpan} ${tabletSpan} ${desktopSpan}`
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading" class="p-8">
      <p>loading...</p>
    </div>

    <!-- Grid: max 2 on mobile, max 3 on tablet, max 4 on desktop -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="flex flex-col gap-1 rounded-lg px-3.5 py-3 shadow-sm md:gap-3"
        :class="[
          'bg-primary-25 border-primary-200 border md:border-0 md:bg-white',
          getItemSpanClass(i),
        ]"
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
