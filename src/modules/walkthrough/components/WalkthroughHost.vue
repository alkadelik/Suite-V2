<script setup lang="ts">
import WhatsNewModal from "@components/WhatsNewModal.vue"
import { useAuthStore } from "@modules/auth/store"
import { useSettingsStore } from "@modules/settings/store"
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getWalkthrough } from "../registry"
import { hasVisibleModalDialog } from "../dom"
import { useWalkthroughStore } from "../store"
import type { AnchorTarget, WalkthroughId } from "../types"
import MissingAnchorCard from "./MissingAnchorCard.vue"
import WalkthroughCoachmark from "./WalkthroughCoachmark.vue"
import WalkthroughSpotlight from "./WalkthroughSpotlight.vue"

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const walkthrough = useWalkthroughStore()
const route = useRoute()
const router = useRouter()

const announcementOpen = ref(false)
const announcementFeature = ref<WalkthroughId>("pickup-times")
const announcementMobileStartView = ref<"intro" | "features">("intro")
const anchorTarget = ref<AnchorTarget | null>(null)
const anchorMissing = ref(false)
const measureNonce = ref(0)
const viewportWidth = ref(typeof window === "undefined" ? 1024 : window.innerWidth)
let announceTimer: number | undefined
let missingTimer: number | undefined
let measureTimer: number | undefined
let resizeObserver: ResizeObserver | undefined
let mutationObserver: MutationObserver | undefined
let observedElement: HTMLElement | null = null
let scrolledStepId: string | null = null

const userId = computed(() => authStore.user?.uid ?? null)
const eligibleFeatures = computed<WalkthroughId[]>(() => {
  if (!authStore.isAuthenticated || !userId.value) return []
  const features: WalkthroughId[] = ["discounts"]
  if (!settingsStore.isInternational && settingsStore.activeLocation?.is_hq) {
    features.unshift("pickup-times")
  }
  return features
})

const progress = computed(() => walkthrough.activeProgress)
const definition = computed(() => walkthrough.activeDefinition)
const step = computed(() => walkthrough.activeStep)
const stepIndex = computed(() => progress.value?.stepIndex ?? 0)
const routeMatchesStep = computed(() => {
  if (!step.value) return false
  if (step.value.route.endsWith("/")) return route.path.startsWith(step.value.route)
  return route.path === step.value.route
})
const active = computed(
  () =>
    Boolean(step.value && routeMatchesStep.value) &&
    Boolean(walkthrough.activeId && eligibleFeatures.value.includes(walkthrough.activeId)),
)
const mobileStandaloneActive = computed(
  () => viewportWidth.value < 1024 && step.value?.mobileStandalone === true,
)
const mobileHideTailActive = computed(
  () => viewportWidth.value < 1024 && step.value?.mobileHideTail === true,
)

function viewportRect(): DOMRect {
  return {
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect
}

function selectorForAnchor(anchor: string): string {
  const escape = (value: string) =>
    typeof CSS !== "undefined" && CSS.escape ? CSS.escape(value) : value.replace(/["\\]/g, "\\$&")
  if (anchor === "discount-row" && progress.value?.context?.createdDiscountUid) {
    const uid = escape(progress.value.context.createdDiscountUid)
    return `[data-walkthrough-discount-row="${uid}"]`
  }
  return `[data-walkthrough="${escape(anchor)}"]`
}

function firstVisible(selector: string): HTMLElement | null {
  return (
    Array.from(document.querySelectorAll<HTMLElement>(selector)).find((element) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      )
    }) ?? null
  )
}

function observe(element: HTMLElement | null): void {
  if (observedElement === element) return
  resizeObserver?.disconnect()
  observedElement = element
  if (element && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(element)
  }
}

function measureAnchor(): void {
  if (!active.value || !step.value) {
    anchorTarget.value = null
    anchorMissing.value = false
    observe(null)
    return
  }

  if (mobileStandaloneActive.value) {
    if (missingTimer) window.clearTimeout(missingTimer)
    missingTimer = undefined
    anchorMissing.value = false
    observe(null)
    anchorTarget.value = {
      element: document.documentElement,
      rect: viewportRect(),
      usingFallback: false,
    }
    return
  }

  let element = firstVisible(selectorForAnchor(step.value.anchor))
  let usingFallback = false
  if (!element && step.value.fallbackAnchor) {
    element = firstVisible(selectorForAnchor(step.value.fallbackAnchor))
    usingFallback = Boolean(element)
  }

  if (!element) {
    anchorTarget.value = null
    observe(null)
    if (!missingTimer) {
      missingTimer = window.setTimeout(() => {
        anchorMissing.value = true
        missingTimer = undefined
      }, 4500)
    }
    return
  }

  if (missingTimer) window.clearTimeout(missingTimer)
  missingTimer = undefined
  anchorMissing.value = false
  observe(element)

  if (scrolledStepId !== step.value.id) {
    scrolledStepId = step.value.id
    const rect = element.getBoundingClientRect()
    if (rect.top < 16 || rect.bottom > window.innerHeight - 16) {
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
      window.setTimeout(scheduleMeasure, 350)
    }
    if (step.value.hideNext) {
      element.focus({ preventScroll: true })
    }
  }

  anchorTarget.value = {
    element,
    rect: element.getBoundingClientRect(),
    usingFallback,
  }
}

function scheduleMeasure(): void {
  if (measureTimer) window.clearTimeout(measureTimer)
  measureTimer = window.setTimeout(measureAnchor, 24)
}

function handleResize(): void {
  viewportWidth.value = window.innerWidth
  scheduleMeasure()
}

function retryAnchor(): void {
  anchorMissing.value = false
  measureNonce.value += 1
  measureAnchor()
}

async function start(id: WalkthroughId): Promise<void> {
  if (!userId.value || !eligibleFeatures.value.includes(id)) return
  announcementOpen.value = false
  walkthrough.markReleaseSeen(userId.value)
  walkthrough.start(id, userId.value)
  await router.push(getWalkthrough(id).steps[0].route)
  await nextTick()
  scheduleMeasure()
}

function closeAnnouncement(): void {
  if (userId.value) walkthrough.markReleaseSeen(userId.value)
  announcementOpen.value = false
}

function closeWalkthrough(): void {
  walkthrough.dismiss()
  anchorTarget.value = null
}

function next(): void {
  const currentStep = step.value
  if (!currentStep) return
  if (currentStep.nextCommand) {
    walkthrough.requestCommand(currentStep.nextCommand)
    return
  }
  if (stepIndex.value === (definition.value?.steps.length ?? 0) - 1) {
    walkthrough.complete()
    return
  }
  walkthrough.advance()
}

async function back(): Promise<void> {
  if (!definition.value || !progress.value) return
  if (progress.value.stepIndex === 0) {
    announcementFeature.value = walkthrough.activeId ?? eligibleFeatures.value[0] ?? "discounts"
    announcementMobileStartView.value = "features"
    walkthrough.dismiss()
    announcementOpen.value = true
    return
  }
  const destination = definition.value.steps[progress.value.stepIndex - 1]?.route
  walkthrough.back()
  if (destination && !route.path.startsWith(destination)) await router.push(destination)
}

const displayedTitle = computed(() =>
  anchorTarget.value?.usingFallback
    ? (step.value?.fallbackTitle ?? step.value?.title)
    : step.value?.title,
)
const displayedBody = computed(() =>
  anchorTarget.value?.usingFallback
    ? (step.value?.fallbackBody ?? step.value?.body)
    : step.value?.body,
)
const showBack = computed(() => {
  // A completed creation is an irreversible boundary. Step 5 never navigates
  // back into a form that could create the same discount twice.
  if (walkthrough.activeId === "discounts" && stepIndex.value === 4) return false
  return stepIndex.value > 0 || step.value?.showBack === true
})
function scheduleAnnouncement(delay = 900): void {
  if (announceTimer) window.clearTimeout(announceTimer)
  announceTimer = window.setTimeout(() => {
    announceTimer = undefined
    const id = userId.value
    if (
      !id ||
      walkthrough.hasSeenRelease(id) ||
      !eligibleFeatures.value.length ||
      walkthrough.activeId
    ) {
      return
    }
    if (hasVisibleModalDialog()) {
      scheduleAnnouncement(500)
      return
    }
    announcementMobileStartView.value = "intro"
    announcementOpen.value = true
  }, delay)
}

watch(
  () => walkthrough.completedId,
  async (id) => {
    if (!id) return
    walkthrough.clearCompletion()
    if (!eligibleFeatures.value.includes(id)) return
    announcementFeature.value = id
    announcementMobileStartView.value = "features"
    await nextTick()
    announcementOpen.value = true
  },
)

watch(
  [userId, eligibleFeatures],
  ([id, features]) => {
    announcementOpen.value = false
    if (!id) return
    walkthrough.resumeForUser(id)
    if (!walkthrough.hasSeenRelease(id) && features.length) {
      if (!features.includes(announcementFeature.value)) announcementFeature.value = features[0]
      scheduleAnnouncement()
    }
  },
  { immediate: true },
)

watch(
  [active, step, routeMatchesStep, measureNonce, mobileStandaloneActive],
  async () => {
    scrolledStepId = null
    await nextTick()
    scheduleMeasure()
  },
  { flush: "post" },
)

onMounted(() => {
  window.addEventListener("resize", handleResize, { passive: true })
  window.addEventListener("scroll", scheduleMeasure, { passive: true, capture: true })
  if (typeof MutationObserver !== "undefined") {
    mutationObserver = new MutationObserver(scheduleMeasure)
    mutationObserver.observe(document.body, { childList: true, subtree: true })
  }
})

onBeforeUnmount(() => {
  if (announceTimer) window.clearTimeout(announceTimer)
  if (missingTimer) window.clearTimeout(missingTimer)
  if (measureTimer) window.clearTimeout(measureTimer)
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  window.removeEventListener("resize", handleResize)
  window.removeEventListener("scroll", scheduleMeasure, { capture: true })
})
</script>

<template>
  <WhatsNewModal
    :open="announcementOpen"
    :features="eligibleFeatures"
    :initial-feature="announcementFeature"
    :mobile-start-view="announcementMobileStartView"
    @close="closeAnnouncement"
    @show="start"
  />

  <Teleport to="body">
    <template v-if="active && step && definition">
      <WalkthroughSpotlight
        v-if="anchorTarget && !mobileStandaloneActive"
        :rect="anchorTarget.rect"
        :highlight="step.highlight"
        :target-element="anchorTarget.element"
        :backdrop="definition.backdrop !== false"
      />
      <WalkthroughCoachmark
        v-if="anchorTarget"
        :step-id="step.id"
        :anchor-rect="anchorTarget.rect"
        :placement="step.placement"
        :mobile-dock="step.mobileDock"
        :desktop-position="step.desktopPosition"
        :hide-tail="mobileHideTailActive"
        :title="displayedTitle ?? step.title"
        :body="displayedBody ?? step.body"
        :instruction="anchorTarget.usingFallback ? undefined : step.instruction"
        :step-number="stepIndex + 1"
        :total-steps="definition.steps.length"
        :show-back="showBack"
        :hide-next="step.hideNext"
        :is-last="stepIndex === definition.steps.length - 1"
        @close="closeWalkthrough"
        @back="back"
        @next="next"
      />
      <MissingAnchorCard
        v-else-if="anchorMissing"
        title="We couldn't find this step"
        @retry="retryAnchor"
        @exit="closeWalkthrough"
      />
    </template>
  </Teleport>
</template>
