<template>
  <section class="overflow-hidden rounded-xl bg-gray-50">
    <div class="flex flex-col gap-6 md:flex-row md:items-end md:gap-10">
      <div class="p-6 md:flex-1 md:p-12">
        <h2 class="text-lg font-bold text-gray-900 md:text-2xl">
          Your store deserves its own address
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          A custom domain makes your storefront memorable, builds trust with customers, and gives
          your brand the professional home it deserves — setup takes under 10 minutes.
        </p>
        <ul class="mt-4 space-y-2">
          <li
            v-for="benefit in benefits"
            :key="benefit"
            class="flex items-start gap-2 text-sm text-gray-700"
          >
            <Icon name="check-verified-01" size="20" class="mt-0.5 shrink-0 text-gray-600" />
            <span>{{ benefit }}</span>
          </li>
        </ul>
        <AppButton
          label="Connect A Domain"
          icon="arrow-right"
          icon-placement="right"
          class="mt-6"
          @click="emit('connect')"
        />
      </div>
      <picture class="px-6 pb-6 md:shrink-0 md:self-end md:p-0">
        <source media="(max-width: 768px)" :srcset="mobileImg" />
        <img
          :src="desktopImg"
          alt="Storefront preview"
          class="block w-full md:h-48 md:w-auto lg:h-72"
        />
      </picture>
    </div>
  </section>
</template>

<script lang="ts" setup>
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import { DOMAIN_BENEFITS } from "../../constants"
import desktopImg from "@/assets/images/domains/domain-preview-desktop.png"
import mobileImg from "@/assets/images/domains/domain-preview-mobile.png"

const benefits = DOMAIN_BENEFITS
const emit = defineEmits<{ connect: [] }>()
</script>
