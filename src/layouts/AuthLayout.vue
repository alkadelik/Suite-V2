<template>
  <div class="bg-brand-100 flex h-screen w-full overflow-hidden">
    <div class="flex flex-1 flex-col overflow-auto p-1.5 sm:p-4 md:items-center md:justify-center">
      <div class="p-2 md:mx-auto md:max-w-screen-sm">
        <RouterView />
      </div>
    </div>
    <div class="hidden flex-1 items-center justify-center bg-orange-600 md:flex"></div>
  </div>
</template>
