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
    <div class="flex flex-1 items-center justify-center overflow-auto p-4">
      <div class="w-full">
        <router-view />
      </div>
    </div>
  </div>
</template>
