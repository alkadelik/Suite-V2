<script setup lang="ts">
import WhatsNewModal from "@components/WhatsNewModal.vue"
import { useAuthStore } from "@modules/auth/store"
import { useSettingsStore } from "@modules/settings/store"
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { driver, type Driver } from "driver.js"
import { getWalkthrough } from "../constants"
import { hasVisibleModalDialog } from "../dom"
import { useWalkthroughStore } from "../store"
import type { WalkthroughId } from "../types"
import { buildDriverSteps } from "../driverAdapter"

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const walkthrough = useWalkthroughStore()
const route = useRoute()
const router = useRouter()

const announcementOpen = ref(false)
const announcementFeature = ref<WalkthroughId>("pickup-times")
const announcementMobileStartView = ref<"intro" | "features">("intro")
let announceTimer: number | undefined

const userId = computed(() => authStore.user?.uid ?? null)
const eligibleFeatures = computed<WalkthroughId[]>(() => {
  if (!authStore.isAuthenticated || !userId.value) return []
  const features: WalkthroughId[] = ["discounts", "shipments"]
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

// A completed creation is an irreversible boundary. Discounts step 5 never navigates back
// into a form that could create the same discount twice.
function showBackFor(index: number): boolean {
  if (walkthrough.activeId === "discounts" && index === 4) return false
  const target = definition.value?.steps[index]
  return index > 0 || target?.showBack === true
}

// --- driver.js instance ---------------------------------------------------------------
let driverObj: Driver | null = null
// Which tour's steps are currently loaded into the driver. setSteps() must run only once per
// tour — driver's setSteps() resets state without removing the live popover/overlay, so calling
// it mid-tour orphans the current card on screen. After the initial drive() we only moveTo().
let drivenId: WalkthroughId | null = null

function getProgress() {
  return walkthrough.activeProgress
}

function overlayColor(): string {
  const token = getComputedStyle(document.documentElement)
    .getPropertyValue("--walkthrough-overlay")
    .trim()
  return token || "rgba(20, 17, 14, 0.62)"
}

function ensureDriver(): Driver {
  if (driverObj) return driverObj
  driverObj = driver({
    animate: true,
    overlayColor: overlayColor(),
    // The token already carries its own alpha, so keep fill-opacity at 1.
    overlayOpacity: 1,
    stagePadding: 6,
    stageRadius: 10,
    popoverClass: "leyyow-walkthrough",
    showProgress: true,
    progressText: "{{current}} of {{total}}",
    showButtons: ["next", "previous", "close"],
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Done",
    smoothScroll: true,
    allowClose: true,
    allowKeyboardControl: true,
    // Drawers/modals for a step can mount a tick after we advance; let driver wait for them.
    waitForElement: 2500,
    // Stray clicks on the dimmed overlay must not dismiss a guided tour.
    overlayClickBehavior: () => {},
    onNextClick: () => next(),
    onPrevClick: () => void back(),
    onCloseClick: () => closeWalkthrough(),
  })
  return driverObj
}

function destroyDriver(): void {
  driverObj?.destroy()
  driverObj = null
  drivenId = null
}

function syncDriver(): void {
  if (!active.value || !step.value || !definition.value || !walkthrough.activeId) {
    destroyDriver()
    return
  }

  // First time we drive this tour: load its steps on a fresh instance and start. Never setSteps
  // again on a live instance (it resets state without removing the popover/overlay, orphaning the
  // current card) — tear down any prior tour first, then navigate with moveTo.
  if (drivenId !== walkthrough.activeId) {
    destroyDriver()
    const fresh = ensureDriver()
    drivenId = walkthrough.activeId
    fresh.setSteps(
      buildDriverSteps(definition.value, {
        getProgress,
        currentIndex: stepIndex.value,
        showBackFor,
      }),
    )
    fresh.drive(stepIndex.value)
    return
  }

  const instance = ensureDriver()
  if (instance.getActiveIndex() !== stepIndex.value) instance.moveTo(stepIndex.value)
  else instance.refresh()
}

async function start(id: WalkthroughId): Promise<void> {
  if (!userId.value || !eligibleFeatures.value.includes(id)) return
  announcementOpen.value = false
  walkthrough.markReleaseSeen(userId.value)
  walkthrough.start(id, userId.value)
  await router.push(getWalkthrough(id).steps[0].route)
  await nextTick()
  syncDriver()
}

function closeAnnouncement(): void {
  if (userId.value) walkthrough.markReleaseSeen(userId.value)
  announcementOpen.value = false
}

function closeWalkthrough(): void {
  walkthrough.dismiss()
  destroyDriver()
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

// Finishing any tour hands the merchant back to the feature picker — position in
// the list makes no difference, the last one (shipments) included. Only when
// there's no picker left to show does the walkthrough just end.
watch(
  () => walkthrough.completedId,
  async (id) => {
    if (!id) return
    walkthrough.clearCompletion()
    const features = eligibleFeatures.value
    if (!features.length) return
    announcementFeature.value = features.includes(id) ? id : features[0]
    announcementMobileStartView.value = "features"
    await nextTick()
    announcementOpen.value = true
  },
)

// `eligibleFeatures` rebuilds its array on every settings/auth change, so this
// watcher fires far more often than the list actually changes — key it on the
// contents. Only a different user may close an open announcement: a settings
// refetch landing just after a tour completes (the pickup save refetches store
// details, for one) must not tear down the modal we just reopened.
const eligibleKey = computed(() => eligibleFeatures.value.join(","))

watch(
  [userId, eligibleKey],
  ([id], previous) => {
    // `previous` is undefined on the immediate run — that counts as a user change.
    const userChanged = id !== previous?.[0]
    if (userChanged) announcementOpen.value = false
    if (!id) return
    if (userChanged) walkthrough.resumeForUser(id)
    const features = eligibleFeatures.value
    if (!walkthrough.hasSeenRelease(id) && features.length) {
      if (!features.includes(announcementFeature.value)) announcementFeature.value = features[0]
      scheduleAnnouncement()
    }
  },
  { immediate: true },
)

// Drive the tour off the store: any step/route/active change re-syncs the driver instance.
watch(
  [active, stepIndex, () => walkthrough.activeId],
  async () => {
    await nextTick()
    syncDriver()
  },
  { flush: "post" },
)

onBeforeUnmount(() => {
  if (announceTimer) window.clearTimeout(announceTimer)
  destroyDriver()
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
</template>
