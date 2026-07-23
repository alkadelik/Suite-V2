<script setup lang="ts">
import Icon from "@components/Icon.vue"
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { computeCoachmarkLayout, type CoachmarkLayout } from "../positioning"
import type {
  WalkthroughDesktopPosition,
  WalkthroughMobileDock,
  WalkthroughPlacement,
} from "../types"

const props = withDefaults(
  defineProps<{
    stepId: string
    anchorRect: DOMRect
    placement: WalkthroughPlacement
    mobileDock?: WalkthroughMobileDock
    desktopPosition?: WalkthroughDesktopPosition
    title: string
    body: string
    instruction?: string
    stepNumber: number
    totalSteps: number
    showBack?: boolean
    hideNext?: boolean
    nextDisabled?: boolean
    isLast?: boolean
    hideTail?: boolean
  }>(),
  {
    showBack: true,
    hideNext: false,
    nextDisabled: false,
    isLast: false,
    hideTail: false,
  },
)

const emit = defineEmits<{ close: []; back: []; next: [] }>()
const card = ref<HTMLElement | null>(null)
const nextButton = ref<HTMLButtonElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const layout = ref<CoachmarkLayout | null>(null)
let restoreFocus: HTMLElement | null = null
let cardResizeObserver: ResizeObserver | undefined

function measure(): void {
  const height = card.value?.offsetHeight ?? 220
  layout.value = computeCoachmarkLayout(
    props.anchorRect,
    props.placement,
    height,
    window.innerWidth,
    window.innerHeight,
    { mobileDock: props.mobileDock, desktopPosition: props.desktopPosition },
  )
}

const cardStyle = computed(() => ({
  left: `${layout.value?.left ?? -9999}px`,
  top: `${layout.value?.top ?? -9999}px`,
  width: `${layout.value?.width ?? 380}px`,
  opacity: layout.value ? "1" : "0",
}))

const tailStyle = computed(() => {
  const side = layout.value?.side ?? props.placement
  const offset = layout.value?.tailOffset ?? 32
  const common = {
    background: "var(--walkthrough-surface)",
    width: "14px",
    height: "14px",
  }
  if (side === "top") return { ...common, bottom: "-7px", left: `${offset - 7}px` }
  if (side === "bottom") return { ...common, top: "-7px", left: `${offset - 7}px` }
  if (side === "left") return { ...common, right: "-7px", top: `${offset - 7}px` }
  return { ...common, left: "-7px", top: `${offset - 7}px` }
})

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    event.preventDefault()
    emit("close")
  } else if (event.key === "Enter" && !props.hideNext && !props.nextDisabled) {
    event.preventDefault()
    emit("next")
  }
}

watch(
  () => [
    props.anchorRect,
    props.title,
    props.body,
    props.instruction,
    props.stepId,
    props.mobileDock,
    props.desktopPosition,
    props.showBack,
    props.hideNext,
    props.nextDisabled,
  ],
  async () => {
    await nextTick()
    measure()
    if (!props.hideNext) {
      if (!props.nextDisabled) nextButton.value?.focus()
      else closeButton.value?.focus()
    }
  },
  { deep: true, immediate: true },
)

onMounted(() => {
  restoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  if (card.value && typeof ResizeObserver !== "undefined") {
    cardResizeObserver = new ResizeObserver(measure)
    cardResizeObserver.observe(card.value)
  }
  window.addEventListener("resize", measure)
  window.addEventListener("keydown", onKeydown)
})

onBeforeUnmount(() => {
  cardResizeObserver?.disconnect()
  window.removeEventListener("resize", measure)
  window.removeEventListener("keydown", onKeydown)
  restoreFocus?.focus?.()
})
</script>

<template>
  <section
    ref="card"
    class="walkthrough-motion fixed z-[3010] overflow-visible rounded-[var(--walkthrough-radius)] bg-[var(--walkthrough-surface)] text-left shadow-[var(--walkthrough-shadow)] transition-opacity duration-150"
    :style="cardStyle"
    role="dialog"
    aria-modal="false"
    :aria-labelledby="`${stepId}-title`"
    :aria-describedby="`${stepId}-body`"
  >
    <span
      v-if="!hideTail"
      data-walkthrough-tail
      class="absolute rotate-45 rounded-[2px]"
      :style="tailStyle"
      aria-hidden="true"
    />

    <header class="relative z-10 flex min-h-12 items-center justify-between gap-4 px-4 py-3">
      <h2
        :id="`${stepId}-title`"
        class="m-0 text-base font-semibold text-[var(--walkthrough-title)]"
      >
        {{ title }}
      </h2>
      <button
        ref="closeButton"
        type="button"
        class="flex size-7 shrink-0 items-center justify-center text-[var(--walkthrough-close)]"
        aria-label="Close walkthrough"
        @click="emit('close')"
      >
        <Icon name="x-close" size="18" />
      </button>
    </header>

    <div class="h-px w-full bg-[var(--walkthrough-divider)]" aria-hidden="true" />

    <div class="relative z-10 px-4 pt-3 pb-4">
      <p
        :id="`${stepId}-body`"
        class="m-0 text-base leading-6 whitespace-pre-line text-[var(--walkthrough-body)]"
        aria-live="polite"
      >
        {{ body }}
      </p>
      <p
        v-if="instruction"
        class="mt-3 text-base leading-6 font-semibold text-[var(--walkthrough-title)]"
      >
        {{ instruction }}
      </p>

      <footer class="mt-5 flex min-h-9 items-center gap-3">
        <span class="mr-auto text-sm font-medium text-[var(--walkthrough-step)]">
          {{ stepNumber }} of {{ totalSteps }}
        </span>
        <button
          v-if="showBack"
          type="button"
          class="min-h-9 px-2 text-sm font-semibold text-[var(--walkthrough-back)]"
          @click="emit('back')"
        >
          Back
        </button>
        <button
          v-if="!hideNext"
          ref="nextButton"
          type="button"
          class="min-h-9 rounded-xl bg-[var(--walkthrough-action)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--walkthrough-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--walkthrough-highlight)] disabled:cursor-not-allowed disabled:opacity-45"
          :disabled="nextDisabled"
          @click="emit('next')"
        >
          {{ isLast ? "Done" : "Next" }}
        </button>
      </footer>
    </div>
  </section>
</template>
