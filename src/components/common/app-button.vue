<script setup>
import { Icon } from "@iconify/vue"
import Loader from "../../assets/icons/loader.vue"

const props = defineProps({
  label: String,
  icon: String,
  type: {
    type: String,
    default: "button",
    validator: (v) => ["button", "submit", "reset"].includes(v),
  },
  small: { type: Boolean, default: false }, // small size button
  smaller: { type: Boolean, default: false }, // small size button
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }, // New loading state
  class: { type: [String, Array], default: "" },
  iconClass: { type: [String, Array], default: "" },
  variant: {
    type: String,
    default: "filled",
    validator: (v) => ["filled", "outlined", "tonal", "text"].includes(v),
  },
})

const emit = defineEmits(["click"])

const emitClick = (event) => {
  if (!props.loading && !props.disabled) {
    emit("click", event)
  }
}
</script>

<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-2xl font-semibold',
      'relative transition-all duration-200 ease-in-out',
      'focus:ring-2 focus:outline-none',
      variant === 'filled' && 'bg-brand-500 focus:ring-brand-500/50 text-white',
      variant === 'outlined' &&
        'border-brand-200 text-brand-500 bg-brand-50 focus:ring-brand-500/50 border',
      variant === 'tonal' &&
        'border-brand-200 text-brand-500 bg-brand-500/20 focus:ring-brand-500/50 border',
      variant === 'text'
        ? 'text-brand-500 focus:ring-brand-500/0 gap-1.5 text-sm underline underline-offset-4'
        : icon && !label && smaller
          ? 'h-7 w-7'
          : icon && !label && small
            ? 'h-9 w-9'
            : icon && !label
              ? 'h-11 w-11'
              : smaller
                ? 'h-8 gap-1 px-3 text-sm'
                : small
                  ? 'h-10 gap-2 px-4 text-sm'
                  : 'h-12 gap-2 px-6 text-sm',
      disabled
        ? 'bg-disabled text-disabled-text hover:disabled:bg-disabled cursor-not-allowed'
        : 'cursor-pointer hover:opacity-85',
      props.class,
    ]"
    :disabled="disabled || loading"
    :type="type"
    @click="emitClick"
  >
    <template v-if="loading">
      <Loader class="mr-2 flex-shrink-0 animate-spin" />
      <span v-if="label">{{ label }}</span>
    </template>
    <template v-else>
      <Icon
        v-if="icon"
        :icon="icon"
        :class="[
          'flex-shrink-0',
          variant == 'filled' ? 'text-white' : 'text-brand-500',
          icon && !label && 'h-5 w-5',
          props.iconClass,
        ]"
      />
      <slot>
        <span v-if="label">{{ label }}</span>
      </slot>
    </template>
  </button>
</template>
