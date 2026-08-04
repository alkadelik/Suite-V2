<template>
  <section class="overflow-hidden rounded-lg border border-gray-200 bg-white">
    <header class="text-core-800 border-b border-gray-200 px-4 py-3 text-sm font-semibold">
      Built-in Domain
    </header>
    <div class="flex items-center justify-between gap-3 px-4 py-6">
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-gray-900 md:text-base">{{ fullUrl }}</p>
        <Chip label="Never Expires" size="sm" color="blue" variant="outlined" class="mt-1" />
      </div>
      <RouterLink
        to="/settings/domains/built-in"
        class="flex shrink-0 items-center gap-1 text-sm font-medium text-gray-600"
      >
        <span class="hidden md:inline">View Details</span>
        <Icon name="arrow-right" size="18" />
      </RouterLink>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { RouterLink } from "vue-router"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"

const props = defineProps<{ url: string }>()

/** `url` is the bare storefront URL (no scheme), e.g. "buy.leyyow.com/my-store". */
const fullUrl = computed(() => `https://${props.url.replace(/^https?:\/\//, "")}`)
</script>
