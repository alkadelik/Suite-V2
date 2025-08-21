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
      <div class="w-full px-4 py-10 md:px-24">
        <img
          src="/images/logos/leyyow-logo-2.svg?url"
          alt="leyyow logo"
          class="mb-10 h-8 md:mb-20"
        />
        <router-view />
      </div>
    </div>
  </div>
</template>
