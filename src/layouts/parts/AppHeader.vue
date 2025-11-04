<template>
  <header class="fixed top-0 right-0 left-0 z-20 border-b border-gray-200 bg-white">
    <div class="flex h-16 items-center gap-1.5 px-4">
      <img
        v-if="showLogo"
        :src="`${isMobile ? '/LYW-icon.svg' : '/LYW.svg'}`"
        alt="Leyyow"
        class="h-8 w-auto"
      />
      <div class="flex-1" />
      <!-- Storefront status -->
      <Chip
        v-if="!isMobile && liveStatusData"
        color="alt"
        size="md"
        label="Storefront"
        class="!pr-1"
      >
        <template #append>
          <Chip
            showDot
            :label="isLive ? 'Live' : 'Not live'"
            :color="isLive ? 'success' : 'error'"
          />
        </template>
      </Chip>
      <!-- Notifications -->
      <button class="rounded-xl p-2 hover:bg-gray-100">
        <Icon name="bell" size="20" />
      </button>
      <!-- Settings -->
      <button class="rounded-xl p-2 hover:bg-gray-100" @click="$router.push('/settings')">
        <Icon name="setting" size="20" />
      </button>
      <!-- User or CTA -->
      <Avatar
        v-if="isMobile"
        name="John Doe"
        clickable
        @click="$router.push('/settings/profile')"
      />
      <AppButton
        v-else
        size="md"
        class="!ring-primary-200 !rounded-full !ring-4"
        icon="add-circle"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core"
import AppButton from "@components/AppButton.vue"
import Avatar from "@components/Avatar.vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import { computed } from "vue"
import { useGetLiveStatus } from "@modules/shared/api"
import { useAuthStore } from "@modules/auth/store"

defineProps<{ showLogo?: boolean; logo?: "full" | "icon" }>()

const isMobile = useMediaQuery("(max-width: 1024px)")

const storeSlug = useAuthStore().user?.store_slug || ""
const { data: liveStatusData } = useGetLiveStatus(storeSlug)
const isLive = computed(() => liveStatusData.value?.data?.is_live || false)
</script>
