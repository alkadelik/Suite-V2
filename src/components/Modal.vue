<template>
  <!-- Overlay -->
  <Transition name="modal-overlay">
    <div
      v-if="open"
      class="fixed inset-0 z-[1200] bg-black/40"
      :class="[overlayClasses, props.overlayClass]"
      @click="close"
    >
      <!-- Modal Card -->
      <Transition name="modal-content">
        <div v-if="open" class="relative bg-white shadow-lg" :class="modalClasses" @click.stop>
          <!-- Header -->
          <slot v-if="showHeader" name="header">
            <div class="flex items-center justify-between px-6 py-4">
              <h2 class="text-core-800 text-lg font-semibold">
                {{ title }}
              </h2>
              <button
                type="button"
                @click="close"
                class="text-core-800 hover:text-core-600 transition-colors"
              >
                <Icon name="close-circle" size="20" />
              </button>
            </div>
          </slot>

          <!-- Body -->
          <div
            class="bg-base-background"
            :class="[
              bodyClasses,
              props.bodyClass,
              props.handlePadding !== false ? 'px-6 py-4' : '',
              !$slots.footer ? 'rounded-b-2xl' : '',
            ]"
          >
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" :class="[props.handlePadding !== false ? 'px-6 py-4' : '']">
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from "vue"
import Icon from "./Icon.vue"

/**
 * Modal variant types
 */
type ModalVariant = "centered" | "fullscreen" | "bottom-nav"

/**
 * Props interface for the Modal component
 */
interface Props {
  /** Whether the modal is open/visible */
  open: boolean
  /** Optional title for the modal header */
  title?: string
  /** Modal variant - determines positioning and size behavior */
  variant?: ModalVariant
  /** Custom max width for the modal (e.g., 'sm', 'md', 'lg', 'xl', '2xl', '500px') */
  maxWidth?: string
  /** Additional classes for the modal body */
  bodyClass?: string
  /** Whether to handle padding for the modal */
  handlePadding?: boolean
  /** Additional classes for the overlay */
  overlayClass?: string
  /** Whether to show the header */
  showHeader?: boolean
}

/**
 * Events emitted by the Modal component
 */
interface Emits {
  /** Emitted when the modal should be closed */
  (e: "close"): void
}

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
  variant: "centered",
  maxWidth: "lg",
  handlePadding: true,
  showHeader: true,
})

// Define emits
const emit = defineEmits<Emits>()

/**
 * Close the modal
 */
const close = () => emit("close")

/**
 * Computed classes for the overlay
 */
const overlayClasses = computed(() => {
  switch (props.variant) {
    case "fullscreen":
      return ""
    case "bottom-nav":
      return "flex items-end justify-center lg:items-center"
    case "centered":
    default:
      return "flex items-center justify-center"
  }
})

/**
 * Computed classes for the modal content
 */
const modalClasses = computed(() => {
  const baseClasses = []

  // Width and max-width classes
  if (props.variant === "fullscreen") {
    baseClasses.push("w-full h-full")
  } else {
    baseClasses.push("w-full max-h-[95dvh]")

    // Max width handling
    const maxWidthMap: Record<string, string> = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      "3xl": "max-w-3xl",
      "4xl": "max-w-4xl",
      "5xl": "max-w-5xl",
      "6xl": "max-w-6xl",
    }

    if (maxWidthMap[props.maxWidth]) {
      baseClasses.push(maxWidthMap[props.maxWidth])
    } else {
      baseClasses.push(`max-w-[${props.maxWidth}]`)
    }
  }

  // Border radius and positioning
  switch (props.variant) {
    case "fullscreen":
      baseClasses.push("")
      break
    case "bottom-nav":
      baseClasses.push("rounded-t-xl md:rounded-2xl mb-0")
      break
    case "centered":
    default:
      baseClasses.push("rounded-2xl m-2")
      break
  }

  return baseClasses.join(" ")
})

/**
 * Computed classes for the modal body
 */
const bodyClasses = computed(() => {
  const classes = []

  if (props.variant === "fullscreen") {
    classes.push("h-full max-h-[85dvh] overflow-y-auto")
  } else {
    classes.push("max-h-[80dvh] overflow-y-auto")
  }

  return classes.join(" ")
})

/**
 * Prevent body scrolling when modal is open
 */
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      // Prevent body scrolling
      document.body.style.overflow = "hidden"
    } else {
      // Restore body scrolling
      document.body.style.overflow = ""
    }
  },
  { immediate: true },
)

/**
 * Cleanup: restore body scrolling when component is unmounted
 */
onUnmounted(() => {
  document.body.style.overflow = ""
})
</script>

<style scoped>
/* Modal overlay transitions */
.modal-overlay-enter-active,
.modal-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

/* Modal content transitions */
.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

/* Bottom nav variant specific transitions */
.modal-content-enter-from.bottom-nav,
.modal-content-leave-to.bottom-nav {
  transform: translateY(100%);
}

@media (max-width: 768px) {
  .modal-content-enter-from,
  .modal-content-leave-to {
    transform: translateY(100%);
  }
}
</style>
