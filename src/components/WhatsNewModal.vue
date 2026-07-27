<script setup lang="ts">
import pickupArtwork from "@/assets/images/walkthrough/pickup-times.png"
import discountsArtwork from "@/assets/images/walkthrough/discounts.png"
import shipmentsArtwork from "@/assets/images/walkthrough/shipments.png"
import Icon from "@components/Icon.vue"
import { WALKTHROUGH_FEATURES } from "@modules/announcements/constants"
import type { WalkthroughFeature, WalkthroughId } from "@modules/announcements/types"
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue"

type MobileStartView = "intro" | "features"

const props = withDefaults(
  defineProps<{
    open: boolean
    features?: WalkthroughId[]
    initialFeature?: WalkthroughId
    mobileStartView?: MobileStartView
  }>(),
  {
    features: () => ["pickup-times", "discounts"],
    mobileStartView: "intro",
  },
)

const emit = defineEmits<{
  close: []
  show: [id: WalkthroughId]
}>()

const artwork: Record<WalkthroughId, string> = {
  "pickup-times": pickupArtwork,
  discounts: discountsArtwork,
  shipments: shipmentsArtwork,
}

const availableFeatures = computed<WalkthroughFeature[]>(() =>
  props.features.map((id) => WALKTHROUGH_FEATURES[id]),
)
const initialSelection = (): WalkthroughId =>
  props.initialFeature && props.features.includes(props.initialFeature)
    ? props.initialFeature
    : (props.features[0] ?? "discounts")
const selectedId = ref<WalkthroughId>(initialSelection())
const mobileView = ref<MobileStartView>(props.mobileStartView)
const mobileFeatureIndex = ref(0)
const dialog = ref<HTMLElement | null>(null)
let pointerGesture: { id: number; x: number; y: number } | null = null
let restoreFocus: HTMLElement | null = null

const selected = computed(() => WALKTHROUGH_FEATURES[selectedId.value])
const selectedArtwork = computed(() => artwork[selectedId.value])
const mobileFeature = computed(() => availableFeatures.value[mobileFeatureIndex.value] ?? null)
const mobileArtwork = computed(() => (mobileFeature.value ? artwork[mobileFeature.value.id] : ""))

function featureIndex(id: WalkthroughId): number {
  const index = availableFeatures.value.findIndex((feature) => feature.id === id)
  return index >= 0 ? index : 0
}

function select(id: WalkthroughId): void {
  selectedId.value = id
  mobileFeatureIndex.value = featureIndex(id)
}

function showFeature(id: WalkthroughId): void {
  emit("show", id)
}

function setMobileFeature(index: number): void {
  mobileFeatureIndex.value = Math.min(
    Math.max(index, 0),
    Math.max(availableFeatures.value.length - 1, 0),
  )
  const feature = availableFeatures.value[mobileFeatureIndex.value]
  if (feature) selectedId.value = feature.id
}

function showMobileFeatures(): void {
  mobileView.value = "features"
  setMobileFeature(featureIndex(selectedId.value))
}

function acknowledgeFeature(id: WalkthroughId): void {
  const index = featureIndex(id)
  const next = availableFeatures.value[index + 1]
  if (!next) {
    emit("close")
    return
  }
  select(next.id)
  if (mobileView.value === "features") setMobileFeature(index + 1)
}

function moveMobile(direction: -1 | 1): void {
  if (mobileView.value === "intro") {
    if (direction === 1) showMobileFeatures()
    return
  }
  setMobileFeature(mobileFeatureIndex.value + direction)
}

function onPointerDown(event: PointerEvent): void {
  if (event.pointerType === "mouse" && event.button !== 0) return
  pointerGesture = { id: event.pointerId, x: event.clientX, y: event.clientY }
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
}

function onPointerMove(event: PointerEvent): void {
  if (!pointerGesture || pointerGesture.id !== event.pointerId) return
  const deltaX = event.clientX - pointerGesture.x
  const deltaY = event.clientY - pointerGesture.y
  if (Math.abs(deltaX) > Math.abs(deltaY) + 6) event.preventDefault()
}

function finishPointer(event: PointerEvent, cancelled = false): void {
  if (!pointerGesture || pointerGesture.id !== event.pointerId) return
  const start = pointerGesture
  pointerGesture = null
  ;(event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId)
  if (cancelled) return
  const deltaX = event.clientX - start.x
  const deltaY = event.clientY - start.y
  if (Math.abs(deltaX) < 36 || Math.abs(deltaX) <= Math.abs(deltaY)) return
  moveMobile(deltaX < 0 ? 1 : -1)
}

function onKeydown(event: KeyboardEvent): void {
  if (!props.open) return
  if (event.key === "Escape") {
    event.preventDefault()
    emit("close")
  }
  if (event.key === "ArrowRight") moveMobile(1)
  if (event.key === "ArrowLeft") moveMobile(-1)
  if (event.key === "Tab" && dialog.value) {
    const focusable = Array.from(
      dialog.value.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => getComputedStyle(element).display !== "none")
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      restoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
      selectedId.value = initialSelection()
      mobileView.value = props.mobileStartView
      mobileFeatureIndex.value = featureIndex(selectedId.value)
      pointerGesture = null
      document.body.style.overflow = "hidden"
      await nextTick()
      dialog.value?.focus()
    } else {
      document.body.style.overflow = ""
      restoreFocus?.focus?.()
    }
  },
  { immediate: true },
)

window.addEventListener("keydown", onKeydown)
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown)
  document.body.style.overflow = ""
})
</script>

<template>
  <Teleport to="body">
    <Transition name="whats-new-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[2500] flex items-center justify-center bg-[var(--walkthrough-announcement-overlay)] lg:p-6"
      >
        <section
          ref="dialog"
          tabindex="-1"
          role="dialog"
          aria-modal="true"
          aria-label="What’s new on Leyyow"
          class="walkthrough-motion relative h-[100dvh] w-full overflow-hidden bg-[var(--walkthrough-surface)] text-white outline-none lg:grid lg:h-auto lg:max-h-[min(720px,92dvh)] lg:max-w-[960px] lg:grid-cols-[300px_1fr] lg:rounded-[28px]"
        >
          <!-- Desktop feature navigation -->
          <aside
            class="hidden border-r border-[var(--walkthrough-divider)] px-9 py-10 lg:flex lg:flex-col"
          >
            <h1 class="max-w-[190px] text-[30px] leading-[1.08] font-bold">What’s new on Leyyow</h1>
            <nav class="mt-14 space-y-2" aria-label="New features">
              <button
                v-for="feature in availableFeatures"
                :key="feature.id"
                type="button"
                class="w-full rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors"
                :class="
                  selectedId === feature.id
                    ? 'bg-[var(--walkthrough-nav-active)] text-[var(--walkthrough-nav-text)]'
                    : 'text-[var(--walkthrough-step)] hover:bg-white/5 hover:text-white'
                "
                @click="select(feature.id)"
              >
                {{ feature.label }}
              </button>
            </nav>
          </aside>

          <!-- Desktop selected feature -->
          <div class="hidden min-h-0 flex-col lg:flex">
            <div
              class="relative flex min-h-[390px] flex-1 items-center justify-center overflow-hidden bg-[var(--walkthrough-art-surface)] px-10"
            >
              <div
                class="walkthrough-art-glow absolute inset-[15%] rounded-full"
                aria-hidden="true"
              />
              <img
                :src="selectedArtwork"
                :alt="`${selected.label} illustration`"
                class="relative z-10 max-h-[270px] w-auto max-w-[68%] object-contain drop-shadow-[var(--walkthrough-art-shadow)]"
              />
            </div>
            <div class="border-t border-[var(--walkthrough-divider)] px-10 py-8">
              <h2 class="text-[25px] leading-tight font-bold">{{ selected.title }}</h2>
              <p class="mt-4 max-w-xl text-[15px] leading-6 text-[var(--walkthrough-body)]">
                {{ selected.description }}
              </p>
              <div class="mt-10 flex items-center justify-between gap-3">
                <a
                  href="/changelog"
                  class="text-sm font-medium text-[var(--walkthrough-body)] underline-offset-4 hover:text-white hover:underline"
                >
                  See full changelog
                </a>
                <div class="flex gap-3">
                  <button
                    type="button"
                    data-whats-new-desktop-got-it
                    class="min-w-28 rounded-xl border border-[var(--walkthrough-secondary-border)] px-5 py-3 text-sm font-semibold"
                    @click="acknowledgeFeature(selectedId)"
                  >
                    Got It
                  </button>
                  <button
                    type="button"
                    class="min-w-28 rounded-xl bg-[var(--walkthrough-action)] px-5 py-3 text-sm font-semibold hover:bg-[var(--walkthrough-action-hover)]"
                    @click="showFeature(selectedId)"
                  >
                    Show Me
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile carousel -->
          <div
            data-mobile-swipe-region
            class="flex h-full touch-pan-y flex-col pt-[env(safe-area-inset-top)] select-none lg:hidden"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="finishPointer"
            @pointercancel="finishPointer($event, true)"
          >
            <template v-if="mobileView === 'intro'">
              <div
                data-mobile-intro
                class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[var(--walkthrough-art-surface)] p-8"
              >
                <div
                  class="walkthrough-art-glow absolute inset-[17%] rounded-full"
                  aria-hidden="true"
                />
                <img
                  :src="artwork[availableFeatures[0]?.id ?? 'discounts']"
                  alt="Leyyow new features"
                  class="relative z-10 max-h-[31dvh] w-auto max-w-[70vw] object-contain drop-shadow-[var(--walkthrough-art-shadow)]"
                />
              </div>
              <div
                class="flex min-h-[42dvh] shrink-0 flex-col items-center px-7 pt-8 pb-[max(24px,env(safe-area-inset-bottom))] text-center"
              >
                <h1 class="text-[24px] leading-tight font-bold">What’s New on Leyyow</h1>
                <p class="mt-5 max-w-sm text-sm leading-6 text-[var(--walkthrough-body)]">
                  We’ve rolled out powerful upgrades to help you track better, ship smarter, and
                  understand your numbers with clarity.
                </p>
                <button
                  type="button"
                  class="mt-auto flex items-center gap-2 py-3 text-sm font-semibold"
                  @click="showMobileFeatures"
                >
                  Swipe
                  <Icon name="swipe-gesture" class="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              </div>
            </template>

            <template v-else-if="mobileFeature">
              <div data-mobile-feature class="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <div
                  class="relative flex min-h-[48dvh] shrink-0 items-center justify-center overflow-hidden bg-[var(--walkthrough-art-surface)] p-7"
                >
                  <div
                    class="walkthrough-art-glow absolute inset-[16%] rounded-full"
                    aria-hidden="true"
                  />
                  <img
                    :src="mobileArtwork"
                    :alt="`${mobileFeature.label} illustration`"
                    class="relative z-10 max-h-[31dvh] w-auto max-w-[70vw] object-contain drop-shadow-[var(--walkthrough-art-shadow)]"
                  />
                </div>
                <div class="flex flex-col items-center px-6 pt-8 pb-6 text-center">
                  <h2 class="text-[23px] leading-tight font-bold">{{ mobileFeature.title }}</h2>
                  <p class="mt-5 max-w-sm text-sm leading-6 text-[var(--walkthrough-body)]">
                    {{ mobileFeature.description }}
                  </p>
                </div>
              </div>

              <div
                data-mobile-controls
                class="shrink-0 bg-[var(--walkthrough-surface)] px-6 pt-2 pb-[max(24px,env(safe-area-inset-bottom))]"
              >
                <div class="flex items-center justify-center gap-1.5" aria-label="Feature slides">
                  <button
                    v-for="(feature, index) in availableFeatures"
                    :key="feature.id"
                    type="button"
                    :aria-label="`Show ${feature.label}`"
                    :aria-current="mobileFeatureIndex === index ? 'step' : undefined"
                    class="flex size-8 items-center justify-center"
                    @click="setMobileFeature(index)"
                  >
                    <span
                      class="h-1.5 rounded-full transition-all"
                      :class="
                        mobileFeatureIndex === index
                          ? 'w-6 bg-[var(--walkthrough-back)]'
                          : 'w-1.5 bg-[var(--walkthrough-close)]'
                      "
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div class="mx-auto flex w-full max-w-sm gap-3 pt-4">
                  <button
                    type="button"
                    class="flex-1 rounded-xl border border-[var(--walkthrough-secondary-border)] px-4 py-3 text-sm font-semibold"
                    @click="acknowledgeFeature(mobileFeature.id)"
                  >
                    Got It
                  </button>
                  <button
                    type="button"
                    class="flex-1 rounded-xl bg-[var(--walkthrough-action)] px-4 py-3 text-sm font-semibold"
                    @click="showFeature(mobileFeature.id)"
                  >
                    Show Me
                  </button>
                </div>
                <a
                  href="/changelog"
                  class="mt-3 block text-center text-sm font-medium text-[var(--walkthrough-body)] underline-offset-4 hover:text-white hover:underline"
                >
                  See full changelog
                </a>
              </div>
            </template>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.walkthrough-art-glow {
  background: radial-gradient(
    ellipse at 50% 55%,
    var(--walkthrough-glow) 0%,
    var(--walkthrough-glow-mid) 34%,
    var(--walkthrough-glow-edge) 58%,
    transparent 78%
  );
  filter: blur(var(--walkthrough-glow-blur));
  transform: scale(1.16);
  opacity: var(--walkthrough-glow-opacity);
}

.whats-new-fade-enter-active,
.whats-new-fade-leave-active {
  transition: opacity 180ms ease;
}

.whats-new-fade-enter-from,
.whats-new-fade-leave-to {
  opacity: 0;
}
</style>
