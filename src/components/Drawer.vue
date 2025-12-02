<template>
  <!-- Backdrop -->
  <div :class="backdropClasses" @click="close" />

  <!-- Drawer -->
  <aside :class="drawerClasses" @click.stop tabindex="-1" role="dialog" aria-modal="true">
    <!-- Header -->
    <div v-if="showHeader" class="flex items-center justify-between border-b border-gray-200 p-5">
      <slot name="header">
        <h2 v-if="title" class="m-0 text-lg font-semibold text-gray-800">{{ title }}</h2>
        <span v-else></span>
        <button
          type="button"
          @click="close"
          class="cursor-pointer border-none bg-transparent p-0 text-gray-500 transition-colors duration-200 hover:text-gray-700"
        >
          <Icon name="close-circle" size="20" />
        </button>
      </slot>
    </div>

    <!-- Body -->
    <div
      class="bg-base-background drawer-body flex-1 overflow-y-auto"
      :class="[props.handlePadding ? 'p-5' : 'p-0', props.bodyClass]"
    >
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="border-t border-gray-200 p-5">
      <slot name="footer" />
    </div>
  </aside>
</template>
<script setup lang="ts">
import { computed, watch, onUnmounted } from "vue"
import Icon from "./Icon.vue"

/**
 * Drawer position types
 */
type DrawerPosition = "left" | "right" | "top" | "bottom"

/**
 * Props interface for the Drawer component
 */
interface Props {
  /** Whether the drawer is open/visible */
  open: boolean
  /** Optional title for the drawer header */
  title?: string
  /** Position from which the drawer slides in */
  position?: DrawerPosition
  /** Custom max width for the drawer (e.g., 'sm', 'md', 'lg', 'xl', '2xl', '500px') */
  maxWidth?: string
  /** Additional classes for the drawer body */
  bodyClass?: string
  /** Whether to show the header section */
  showHeader?: boolean
  /** Whether to apply padding to the drawer body (default: true) */
  handlePadding?: boolean
}

/**
 * Events emitted by the Drawer component
 */
interface Emits {
  /** Emitted when the drawer should be closed */
  (e: "close"): void
}

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
  position: "right",
  maxWidth: "md",
  showHeader: true,
  handlePadding: true,
})

// Define emits
const emit = defineEmits<Emits>()

/**
 * Close the drawer
 */
const close = () => emit("close")

/**
 * Computed classes for the backdrop
 */
const backdropClasses = computed(() => {
  return [
    "fixed inset-0 z-[1000] transition-all duration-300 ease-out",
    props.open
      ? "opacity-100 pointer-events-auto bg-black/60"
      : "opacity-0 pointer-events-none bg-black/60",
  ]
})

/**
 * Computed classes for the drawer
 */
const drawerClasses = computed(() => {
  const baseClasses = [
    "fixed bg-white z-[1100] transition-transform duration-300 ease-out shadow-xl flex flex-col focus:outline-none",
  ]

  // Position and transform classes
  switch (props.position) {
    case "left":
      baseClasses.push(
        "top-0 bottom-0 left-0 h-[dvh]",
        props.open ? "translate-x-0" : "-translate-x-full",
      )
      break
    case "right":
      baseClasses.push(
        "top-0 bottom-0 right-0 h-[dvh]",
        props.open ? "translate-x-0" : "translate-x-full",
      )
      break
    case "top":
      baseClasses.push(
        "top-0 left-0 right-0 max-h-[80vh]",
        props.open ? "translate-y-0" : "-translate-y-full",
      )
      break
    case "bottom":
      baseClasses.push(
        "bottom-0 left-0 right-0 max-h-[80vh]",
        props.open ? "translate-y-0" : "translate-y-full",
      )
      break
  }

  // Width classes for left/right drawers
  if (props.position === "left" || props.position === "right") {
    const maxWidthMap: Record<string, string> = {
      xs: "w-80 max-w-[90vw]",
      sm: "w-96 max-w-[90vw]",
      md: "w-[28rem] max-w-[90vw]",
      lg: "w-[32rem] max-w-[90vw]",
      xl: "w-[36rem] max-w-[90vw]",
      "2xl": "w-[42rem] max-w-[90vw]",
      full: "w-full",
    }

    if (maxWidthMap[props.maxWidth]) {
      baseClasses.push(maxWidthMap[props.maxWidth])
    } else {
      // Custom width value
      baseClasses.push(`w-[${props.maxWidth}] max-w-[90vw]`)
    }
  } else {
    // For top/bottom drawers, use full width
    baseClasses.push("w-full")
  }

  return baseClasses
})

/**
 * Prevent body scrolling when drawer is open
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
