<script setup lang="ts">
import Icon from "@components/Icon.vue"
import { useAuthStore } from "@modules/auth/store"

const onLogout = () => {
  useAuthStore().logout()
}
</script>

<template>
  <div class="flex h-screen max-h-screen overflow-hidden">
    <!-- Left Side -->
    <div class="relative hidden flex-1 lg:block">
      <div class="relative h-full w-full overflow-hidden">
        <img
          src="../assets/images/jpegs/auth-layout-image.jpeg"
          alt="gradient background image"
          class="h-full w-full object-cover"
        />
      </div>
    </div>

    <!-- Right Side -->
    <div class="flex flex-1 justify-center overflow-y-auto p-4">
      <div class="w-full px-4 py-12 md:px-24">
        <div class="mb-5 flex justify-between md:mb-8">
          <img src="/LYW.svg?url" alt="leyyow logo" class="h-8" />

          <button
            v-if="!$route.path.includes('login') && !$route.path.includes('signup')"
            type="button"
            @click="onLogout"
          >
            <Icon name="signout" size="20" class="text-core-400 hover:text-core-600" />
          </button>
        </div>
        <router-view />
      </div>
    </div>
  </div>
</template>
