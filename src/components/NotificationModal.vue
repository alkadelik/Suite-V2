<script setup lang="ts">
import { watch, onUnmounted, computed } from "vue"
import Icon from "./Icon.vue"
import type { INotification } from "@modules/shared/types"

interface Props {
  open: boolean
  notifications: INotification[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  dismiss: [uid: string]
}>()

// Show up to 3 notifications in the stack
const visibleNotifications = computed(() => props.notifications.slice(0, 3))
const hasMultiple = computed(() => props.notifications.length > 1)

// Get card style based on its position in the stack
const getCardStyle = (index: number) => {
  if (index === 0) {
    // Top card - main position (use relative to establish container height)
    return {
      position: "relative" as const,
      top: "0px",
      transform: "scale(1)",
      zIndex: 20,
      opacity: 1,
    }
  }
  // Stacked cards behind - peeking from top
  return {
    position: "absolute" as const,
    top: `${-index * 16}px`,
    transform: `scale(${1 - index * 0.03})`,
    zIndex: 20 - index,
    opacity: 1 - index * 0.15,
  }
}

const dismissFirst = () => {
  if (visibleNotifications.value.length > 0) {
    emit("dismiss", visibleNotifications.value[0].uid)
  }
}

const closeAll = () => emit("close")

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  document.body.style.overflow = ""
})
</script>

<template>
  <Transition name="modal-overlay">
    <div
      v-if="open && notifications.length > 0"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      @click="closeAll"
    >
      <div class="relative w-full max-w-xl" @click.stop>
        <!-- Unified card stack using TransitionGroup -->
        <TransitionGroup name="card-stack" tag="div" class="relative">
          <div
            v-for="(notification, index) in visibleNotifications"
            :key="notification.uid"
            class="notification-card inset-x-0 overflow-hidden rounded-3xl bg-white"
            :class="index === 0 ? 'shadow-xl' : 'shadow-lg'"
            :style="getCardStyle(index)"
          >
            <!-- Gradient Header -->
            <div
              class="relative flex h-52 items-center justify-start px-8"
              style="background: linear-gradient(180deg, #f9a825 0%, #ffcc80 40%, #ffffff 100%)"
            >
              <!-- Close button (only on top card) -->
              <button
                v-if="index === 0"
                type="button"
                class="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-white"
                @click="dismissFirst"
              >
                <Icon name="close-circle" size="28" />
              </button>

              <!-- Notification count badge (only on top card) -->
              <div
                v-if="index === 0 && hasMultiple"
                class="absolute top-4 left-4 flex h-8 min-w-8 items-center justify-center rounded-full bg-white/80 px-3 text-sm font-semibold text-gray-700"
              >
                {{ notifications.length }}
              </div>

              <!-- Bell Image -->
              <div class="mt-6">
                <img
                  src="/images/bell.png"
                  alt="Notification Bell"
                  class="h-24 w-24 drop-shadow-lg"
                />
              </div>
            </div>

            <!-- Content -->
            <div class="px-8 pt-6 pb-8 text-left">
              <h3 class="mb-3 text-2xl font-bold text-gray-950">
                {{ notification.title }}
              </h3>
              <p class="text-base text-gray-600">{{ notification.message }}</p>
              <p class="mt-6 text-base font-medium text-gray-900">
                Thank you for selling with Leyyow
              </p>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay-enter-active,
.modal-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

/* TransitionGroup animations for the card stack */
.notification-card {
  transition:
    top 0.35s ease,
    transform 0.35s ease,
    opacity 0.35s ease,
    z-index 0s;
}

/* Card entering the stack (from bottom) */
.card-stack-enter-active {
  transition: all 0.35s ease;
}

.card-stack-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(30px);
}

/* Card leaving the stack (swipe out to the right with fade) */
.card-stack-leave-active {
  transition:
    transform 0.4s ease,
    opacity 0.4s ease;
  position: absolute !important;
  left: 0;
  right: 0;
  z-index: 30 !important;
}

.card-stack-leave-to {
  opacity: 0 !important;
  transform: translateX(150px) rotate(10deg) !important;
}

/* Smooth move transition for remaining cards */
.card-stack-move {
  transition:
    top 0.35s ease,
    transform 0.35s ease,
    opacity 0.35s ease;
}
</style>
