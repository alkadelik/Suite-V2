<template>
  <!-- Overlay backdrop -->
  <transition name="fade">
    <div v-if="showBanner" class="fixed inset-0 z-[9998] bg-black/70"></div>
  </transition>

  <!-- Banner -->
  <transition name="slide-up">
    <div
      v-if="showBanner"
      class="fixed right-0 bottom-0 z-[9999] w-full max-w-[768px] rounded-lg border border-gray-200 bg-white p-6 shadow-lg lg:right-8 lg:bottom-8"
    >
      <div class="relative w-4/5">
        <h3 class="mb-2 text-lg font-semibold">We use Cookies</h3>
        <p class="text-core-700 mb-4 text-base">
          We use cookies to make your browsing smoother, personalise your experience, and help us
          improve our website.
        </p>

        <div class="flex flex-wrap gap-2">
          <AppButton label="Essential Cookies Only" color="alt" @click="declineConsent" />
          <AppButton label="Accept All" variant="outlined" @click="acceptConsent" />
        </div>
      </div>

      <img src="/images/cookie.png" alt="Cookies" class="absolute -top-4 -right-4 w-28" />
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from "vue"
import AppButton from "@/components/AppButton.vue"

const showBanner = ref(false)

onMounted(() => {
  const consent = localStorage.getItem("user_consent")
  if (consent !== "granted") showBanner.value = true
})

const acceptConsent = () => {
  if (window.gtag) {
    window.gtag("consent", "update", {
      ad_storage: "granted",
      analytics_storage: "granted",
    })
  }
  localStorage.setItem("user_consent", "granted")
  showBanner.value = false
}

const declineConsent = () => {
  if (window.gtag) {
    window.gtag("consent", "update", {
      ad_storage: "denied",
      analytics_storage: "denied",
    })
  }
  localStorage.setItem("user_consent", "denied")
  showBanner.value = false
}
</script>

<style scoped>
/* Smooth slide-up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Fade animation for overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
