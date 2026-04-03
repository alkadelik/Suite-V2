<template>
  <div
    :class="avatarClasses"
    @click="handleClick"
    :style="{ cursor: clickable ? 'pointer' : 'default' }"
  >
    <div :class="statusContainerClasses">
      <img
        v-if="url && !loading"
        :src="url"
        :alt="name"
        :class="[imageClasses]"
        :style="{ height: `${sizeValue}px`, width: `${sizeValue}px` }"
        loading="lazy"
      />
      <span v-else :class="initialsClasses" :style="initialsStyle" :aria-label="`${name} avatar`">
        {{ loading ? "" : getInitials(name) }}
      </span>
    </div>

    <div v-if="extraText" :class="textClasses" :style="maxWidth ? { maxWidth } : {}">
      <h4 :class="nameClasses">{{ name }}</h4>
      <p v-if="extraText && typeof extraText === 'string'" :class="extraTextClasses">
        {{ extraText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { getInitials } from "@/utils/format-strings"

type AvatarSize = "sm" | "md" | "lg" | number
type AvatarShape = "circle" | "square" | "rounded"
type AvatarStatus = "online" | "offline" | "away" | "busy"

interface AvatarProps {
  /** Avatar image URL */
  url?: string
  /** User's name (required for alt text and initials) */
  name: string
  /** Additional text to display next to avatar */
  extraText?: string | boolean
  /** Size of the avatar - preset or custom number */
  size?: AvatarSize
  /** Maximum width for the text container */
  maxWidth?: string
  /** Shape of the avatar */
  shape?: AvatarShape
  /** User's online status */
  status?: AvatarStatus
  /** Whether to show loading state */
  loading?: boolean
  /** Custom background color for initials */
  backgroundColor?: string
  /** Custom text color for initials */
  textColor?: string
  /** Whether the avatar is clickable */
  clickable?: boolean
  /** Additional CSS classes */
  class?: string
}

const props = withDefaults(defineProps<AvatarProps>(), {
  size: "md",
  shape: "circle",
  loading: false,
  clickable: false,
  class: "",
})

const emit = defineEmits<{ click: [] }>()

const handleClick = () => {
  if (props.clickable) emit("click")
}

const getSizeValue = (size: AvatarSize): number => {
  if (size === "sm") return 28
  if (size === "lg") return 64
  return typeof size === "number" ? size : 40
}

const sizeValue = computed(() => getSizeValue(props.size))
const sizeClass = computed(() => (typeof props.size === "string" ? props.size : ""))

const avatarClasses = computed(() => ["flex flex-row items-center gap-3", props.class])

const baseImageClasses =
  "object-cover flex-shrink-0 transition-all duration-200 border-2 border-transparent hover:scale-105"

const shapeClasses = {
  circle: "rounded-full",
  square: "rounded-sm",
  rounded: "rounded-lg",
}

const imageClasses = computed(() => [
  baseImageClasses,
  shapeClasses[props.shape],
  {
    "animate-pulse": props.loading,
    "hover:border-primary-200": !props.loading,
  },
])

const initialsClasses = computed(() => [
  baseImageClasses,
  shapeClasses[props.shape],
  "flex items-center justify-center font-semibold uppercase select-none",
  {
    "text-xs": sizeClass.value === "sm",
    "text-sm": sizeClass.value === "md" || !sizeClass.value,
    "text-3xl": sizeClass.value === "lg",
    "animate-pulse": props.loading,
    "hover:border-primary-200": !props.loading,
    "bg-primary-600 text-core-100": !props.loading,
    "bg-core-300": props.loading,
  },
])

const statusContainerClasses = computed(() => [
  "relative",
  {
    "after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-3 after:h-3 after:rounded-full after:border-2 after:border-core-100":
      props.status,
    "after:bg-green-500": props.status === "online",
    "after:bg-core-400": props.status === "offline",
    "after:bg-amber-500": props.status === "away",
    "after:bg-red-500": props.status === "busy",
  },
])

const textClasses = computed(() => ["flex-1 min-w-0"])

const nameClasses = computed(() => [
  "font-medium text-core-800 truncate m-0",
  {
    "text-xs": sizeClass.value === "sm",
    "text-sm": sizeClass.value === "md" || !sizeClass.value,
    "text-base": sizeClass.value === "lg",
  },
])

const extraTextClasses = computed(() => [
  "text-gray-600 truncate m-0",
  {
    "text-xs": sizeClass.value === "sm" || sizeClass.value === "md" || !sizeClass.value,
    "text-sm": sizeClass.value === "lg",
  },
])

const initialsStyle = computed(() => ({
  height: `${sizeValue.value}px`,
  width: `${sizeValue.value}px`,
  backgroundColor: props.backgroundColor,
  color: props.textColor,
}))
</script>
