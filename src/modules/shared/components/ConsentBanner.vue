<template>
  <transition name="slide-up">
    <div
      v-if="showBanner"
      class="fixed right-0 bottom-0 left-0 z-[9999] flex flex-col items-center justify-between gap-3 border-t border-gray-200 bg-white p-4 shadow-lg md:flex-row md:gap-4"
    >
      <p class="text-core-700 text-center text-base md:text-left">
        We use cookies to improve your experience, personalize content and ads, and analyze how our
        site is used. Please consent to continue.
      </p>

      <div class="flex gap-2">
        <AppButton label="Accept" @click="acceptConsent" />
        <AppButton label="Decline" color="alt" @click="declineConsent" />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from "vue"
import AppButton from "@components/AppButton.vue"

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
</style>
