<script setup lang="ts">
import Icon from "@components/Icon.vue"

const props = withDefaults(
  defineProps<{
    imageUrl?: string | null
    name: string
    selected?: boolean
    disabled?: boolean
    viewMode?: "grid" | "list"
  }>(),
  {
    selected: false,
    disabled: false,
    viewMode: "grid",
  },
)

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (!props.disabled) {
    emit("click")
  }
}
</script>

<template>
  <!-- Grid View -->
  <div
    v-if="viewMode === 'grid'"
    class="rounded-xl bg-white p-1.5 transition-all"
    :class="
      disabled
        ? 'cursor-not-allowed opacity-50'
        : selected
          ? 'ring-primary-600 cursor-pointer shadow-lg ring-2'
          : 'cursor-pointer hover:shadow-lg'
    "
    @click="handleClick"
  >
    <div class="relative flex h-[88px] items-center justify-center rounded-xl bg-gray-200">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="name"
        class="h-full w-full rounded-xl object-cover"
      />
      <Icon v-else name="box" size="40" />

      <!-- Badge slot (for out of stock, fully added, etc.) or checkbox -->
      <slot name="badge">
        <input
          v-if="!disabled"
          type="checkbox"
          :checked="selected"
          class="accent-primary-600 pointer-events-none absolute top-2 right-2 h-4 w-4 rounded border-gray-300 bg-white"
        />
      </slot>
    </div>

    <div class="space-y-1 p-1 py-2">
      <h4 class="line-clamp-1 text-xs font-medium">{{ name }}</h4>
      <div class="flex justify-between gap-2 text-xs">
        <slot name="primaryInfo" />
        <slot name="secondaryInfo" />
      </div>
    </div>
  </div>

  <!-- List View -->
  <div
    v-else
    class="flex items-center gap-3 rounded-xl bg-white p-3 transition-all"
    :class="
      disabled
        ? 'cursor-not-allowed opacity-50'
        : selected
          ? 'ring-primary-600 cursor-pointer ring-2'
          : 'cursor-pointer hover:shadow-md'
    "
    @click="handleClick"
  >
    <!-- Product Image -->
    <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="name"
        class="h-full w-full rounded-lg object-cover"
      />
      <Icon v-else name="box" size="24" />
    </div>

    <!-- Product Info -->
    <div class="min-w-0 flex-1">
      <h4 class="line-clamp-1 text-sm font-medium">{{ name }}</h4>
      <div class="mt-1 flex items-center gap-3 text-xs text-gray-500">
        <slot name="primaryInfo" />
        <slot name="secondaryInfo" />
      </div>
    </div>

    <!-- Right side: badge or checkbox -->
    <slot name="badge">
      <input
        v-if="!disabled"
        type="checkbox"
        :checked="selected"
        class="accent-primary-600 pointer-events-none h-4 w-4 flex-shrink-0 rounded border-gray-300"
      />
    </slot>
  </div>
</template>
