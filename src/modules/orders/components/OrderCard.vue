<template>
  <div
    role="status"
    class="bg-primary-50 border-primary-200 w-full animate-pulse rounded-xl border p-3"
  >
    <div class="flex gap-2.5">
      <!--  Image Skeleton -->
      <div class="bg-primary-200 h-12 w-12 rounded-lg"></div>

      <!--  Info Skeleton -->
      <div class="mr-6 flex-1 truncate text-sm">
        <div class="bg-primary-200 mb-1 h-3.5 w-32 rounded"></div>
        <div class="bg-primary-200 h-3 w-20 rounded"></div>
      </div>

      <!-- Actions Dropdown Skeleton -->
      <div class="flex flex-col items-end">
        <div class="bg-primary-200 mb-2 h-6 w-6 rounded"></div>
        <div class="bg-primary-200 h-3 w-16 rounded"></div>
      </div>
    </div>

    <!-- Divider -->
    <hr class="border-primary-200 my-2" />

    <!-- Stock Info & Availability Toggle Skeleton -->
    <div class="flex items-center justify-between gap-1">
      <!-- Stock info skeleton -->
      <div class="border-primary-200 flex items-center gap-2 rounded-full border py-1 pr-3 pl-3">
        <div class="bg-primary-200 h-3 w-16 rounded"></div>
      </div>

      <!-- Toggle switch skeleton -->
      <div class="flex items-center gap-2">
        <div class="bg-primary-200 h-3 w-12 rounded"></div>
        <div class="bg-primary-200 h-4 w-8 rounded-full"></div>
      </div>
    </div>

    <span class="sr-only">Loading...</span>
  </div>
</template>

<script setup>
defineProps({
  width: { type: String, default: "100%" },
  height: { type: String, default: "1rem" },
  rounded: { type: Boolean, default: false },
})
</script>
