<template>
  <section class="mx-auto flex min-h-[80vh] max-w-screen-xl items-center py-20">
    <div class="mx-auto max-w-2xl space-y-8 text-center">
      <div class="space-y-4">
        <div
          class="text-primary-600 flex items-center justify-center text-8xl leading-none font-bold md:text-9xl"
        >
          4<img
            src="/images/logos/leyyow-icon.svg?url"
            class="text-primary-600 !h-16 !w-16 md:!h-20 md:!w-20"
          />4
        </div>
      </div>

      <!-- Error message -->
      <div class="space-y-4">
        <h1 class="text-3xl font-bold text-gray-900 md:text-4xl">
          Yipee! You've found a missing page.
        </h1>
        <p class="mx-auto max-w-lg text-lg leading-relaxed text-gray-600">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you
          entered the wrong URL.
        </p>
      </div>

      <div class="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
        <AppButton label="Go Home" size="lg" @click="$router.push('/')" class="w-full sm:w-auto" />
        <AppButton
          variant="outlined"
          label="Go Back"
          size="lg"
          @click="$router.back()"
          class="w-full sm:w-auto"
        />
      </div>

      <!-- Helpful links -->
      <div class="border-t border-gray-200 pt-8">
        <p class="mb-4 text-sm text-gray-500">Or try these helpful links:</p>
        <nav class="flex flex-wrap justify-center gap-6 text-sm">
          <RouterLink
            to="/orders"
            class="text-primary-600 hover:text-primary-500 transition-colors"
          >
            Orders
          </RouterLink>
          <RouterLink
            to="/inventory"
            class="text-primary-600 hover:text-primary-500 transition-colors"
          >
            Inventory
          </RouterLink>
          <RouterLink
            to="/customers"
            class="text-primary-600 hover:text-primary-500 transition-colors"
          >
            Customers
          </RouterLink>
          <RouterLink
            to="/popups"
            class="text-primary-600 hover:text-primary-500 transition-colors"
          >
            Popups
          </RouterLink>
        </nav>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
</script>
