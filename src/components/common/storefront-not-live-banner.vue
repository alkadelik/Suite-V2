<script setup>
import AppIcon from "./app-icon.vue";
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";
import { useOnboardingStore } from "~/stores/onboarding";

defineProps({
  closable: {
    type: Boolean,
    default: true,
  },
});

const router = useRouter();
const onboardingStore = useOnboardingStore();

const setupStore = () => {
  router.push("/dashboard/setup-website?step=1");
  onboardingStore.toggleStoreNotLiveBanner(false);
};
</script>

<template>
  <div class="w-full border border-[#DDAF5D] bg-[#FFE9C3] rounded-lg p-4 mb-3 text-brand-600">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-3">
        <AppIcon name="InfoCircle" class="h-6 w-6 text-brand-600" />
        <p class="font-bold text-sm">Your storefront isn't live yet</p>
      </div>
      <Icon
        v-if="closable"
        icon="material-symbols-light:close"
        class="h-6 w-6 text-brand-600 cursor-pointer"
        @click="onboardingStore.toggleStoreNotLiveBanner(false)"
      />
    </div>
    <p class="mt-2 text-sm">
      Complete your bank details, delivery options, and KYC to start selling online.
    </p>
    <div class="flex items-center justify-between mt-3 font-semibold">
      <button v-if="closable" type="button" class="text-sm underline">Don't show this again</button>
      <button type="button" class="text-sm underline" @click="setupStore">Set up now</button>
    </div>
  </div>
</template>
