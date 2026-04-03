<template>
  <div
    :class="['border-warning-200 cursor-pointer rounded-xl border']"
    @click="console.log('Clicked shipment:')"
  >
    <div class="bg-warning-50 rounded-t-xl p-2">
      <div class="flex items-start gap-2.5">
        <div class="flex-1 truncate text-sm"></div>
      </div>
    </div>
  </div>
</template>
