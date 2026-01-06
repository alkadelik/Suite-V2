<script setup lang="ts">
import AppButton from "./AppButton.vue"
import Icon from "./Icon.vue"
import emptyGridPng from "@/assets/images/empty-grid.png"

/**
 * Props interface for the EmptyState component
 */
interface Props {
  /** Title text */
  title: string
  /** Optional description text */
  description?: string
  /** Whether the empty state is in a loading state */
  loading?: boolean
  /** Optional action button label */
  actionLabel?: string
  /** Optional action button icon */
  actionIcon?: string
  /** Action button variant */
  actionVariant?: "filled" | "outlined" | "text"
  /** Action button color */
  actionColor?: "primary" | "error" | "success" | "alt"
  /** Additional CSS classes for the container */
  class?: string
}

/**
 * Events emitted by the EmptyState component
 */
interface Emits {
  /** Emitted when the action button is clicked */
  (e: "action"): void
}

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
  // icon: "empty-store",
  title: "No data available",
  description: "Nothing to display here yet.",
  actionVariant: "outlined",
  actionColor: "primary",
})

// Define emits
const emit = defineEmits<Emits>()

/**
 * Handle action button click
 */
const handleAction = () => {
  emit("action")
}
</script>

<template>
  <div
    :class="[
      'flex min-h-[70vh] flex-col items-center justify-center md:rounded-3xl md:bg-white md:shadow-xs',
      'text-core-800 px-6 py-8 text-center',
      props.class,
    ]"
  >
    <div
      :class="[
        'min-h-60 w-full max-w-sm bg-cover bg-center py-8',
        'flex flex-col items-center justify-center text-center',
      ]"
      :style="{ backgroundImage: `url(${emptyGridPng})` }"
    >
      <Icon name="loader" size="120" class="text-primary-600 animate-spin" v-if="props.loading" />
      <template v-else>
        <slot name="image">
          <img
            src="@/assets/images/empty-store.svg?url"
            alt="Empty State Illustration"
            class="mx-auto mb-4"
          />
        </slot>

        <!-- Title -->
        <h3 class="mb-2 text-base font-semibold">
          {{ title }}
        </h3>

        <!-- Description -->
        <p v-if="description" class="text-core-600 mb-6 text-sm">
          {{ description }}
        </p>

        <!-- Action Button -->
        <AppButton
          v-if="actionLabel"
          :variant="actionVariant"
          :color="actionColor"
          :label="actionLabel"
          :icon="actionIcon"
          @click="handleAction"
        />
      </template>
    </div>
  </div>
</template>
