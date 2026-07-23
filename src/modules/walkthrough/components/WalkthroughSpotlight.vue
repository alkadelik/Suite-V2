<script setup lang="ts">
import { computed } from "vue"
import type { WalkthroughHighlight } from "../types"

const props = withDefaults(
  defineProps<{
    rect: DOMRect
    highlight: WalkthroughHighlight
    targetElement?: HTMLElement
    backdrop?: boolean
  }>(),
  { backdrop: true },
)

const isMobile = computed(() => window.innerWidth < 1024)
const config = computed<WalkthroughHighlight>(() => ({
  ...props.highlight,
  ...(isMobile.value ? props.highlight.mobile : {}),
}))

const padding = computed(() => {
  const value = config.value.padding ?? 0
  if (typeof value === "number") {
    return { top: value, right: value, bottom: value, left: value }
  }
  return {
    top: value.top ?? 0,
    right: value.right ?? 0,
    bottom: value.bottom ?? 0,
    left: value.left ?? 0,
  }
})

const focusRect = computed(() => {
  const padded = {
    left: Math.max(0, props.rect.left - padding.value.left),
    top: Math.max(0, props.rect.top - padding.value.top),
    right: Math.min(window.innerWidth, props.rect.right + padding.value.right),
    bottom: Math.min(window.innerHeight, props.rect.bottom + padding.value.bottom),
  }
  if (config.value.mode !== "circle") return padded
  const size = Math.max(padded.right - padded.left, padded.bottom - padded.top)
  const centerX = props.rect.left + props.rect.width / 2
  const centerY = props.rect.top + props.rect.height / 2
  const left = Math.max(0, centerX - size / 2)
  const top = Math.max(0, centerY - size / 2)
  return {
    left,
    top,
    right: Math.min(window.innerWidth, left + size),
    bottom: Math.min(window.innerHeight, top + size),
  }
})

const ringStyle = computed(() => {
  const width = focusRect.value.right - focusRect.value.left
  const height = focusRect.value.bottom - focusRect.value.top
  const radius =
    config.value.mode === "circle"
      ? "9999px"
      : config.value.radius === "target"
        ? props.targetElement
          ? getComputedStyle(props.targetElement).borderRadius
          : getComputedStyle(document.documentElement).getPropertyValue("--walkthrough-radius")
        : `${config.value.radius ?? 12}px`
  return {
    left: `${focusRect.value.left}px`,
    top: `${focusRect.value.top}px`,
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: radius,
    borderColor: config.value.color ?? "var(--walkthrough-highlight)",
    borderWidth: `${config.value.width ?? 1}px`,
  }
})
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-[3000]" aria-hidden="true">
    <template v-if="backdrop">
      <div
        data-walkthrough-backdrop-panel
        class="pointer-events-auto absolute top-0 right-0 left-0 bg-[var(--walkthrough-overlay)]"
        :style="{ height: `${focusRect.top}px` }"
      />
      <div
        data-walkthrough-backdrop-panel
        class="pointer-events-auto absolute right-0 left-0 bg-[var(--walkthrough-overlay)]"
        :style="{ top: `${focusRect.bottom}px`, bottom: 0 }"
      />
      <div
        data-walkthrough-backdrop-panel
        class="pointer-events-auto absolute left-0 bg-[var(--walkthrough-overlay)]"
        :style="{
          top: `${focusRect.top}px`,
          width: `${focusRect.left}px`,
          height: `${focusRect.bottom - focusRect.top}px`,
        }"
      />
      <div
        data-walkthrough-backdrop-panel
        class="pointer-events-auto absolute right-0 bg-[var(--walkthrough-overlay)]"
        :style="{
          top: `${focusRect.top}px`,
          left: `${focusRect.right}px`,
          height: `${focusRect.bottom - focusRect.top}px`,
        }"
      />
    </template>
    <div
      v-if="config.mode !== 'spotlight'"
      class="absolute box-border border-solid"
      :style="ringStyle"
    />
  </div>
</template>
