<script setup lang="ts">
import Icon from "@components/Icon.vue"
import { useAuthStore } from "@modules/auth/store"
import { useRouter } from "vue-router"

const router = useRouter()
const store = useAuthStore()

const onLogout = () => {
  console.log("Logging out...")
  store.clearAuth()
  router.push("/login")
}
</script>

<template>
  <div class="flex h-screen">
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
    <div class="flex flex-1 justify-center overflow-auto p-4">
      <div class="w-full px-4 py-12 md:px-24">
        <div class="flex justify-between">
          <img
            src="/images/logos/leyyow-logo-2.svg?url"
            alt="leyyow logo"
            class="mb-5 h-8 md:mb-10"
          />

          <button type="button" @click="onLogout">
            <Icon name="signout" size="20" class="text-core-400 hover:text-core-600" />
          </button>
        </div>
        <router-view />
      </div>
    </div>
  </div>
</template>
