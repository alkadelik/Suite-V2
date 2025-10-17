<template>
  <div>
    <h3 class="mb-4 text-lg font-semibold">Pop-up Configuration</h3>
    <p class="mb-6 text-gray-600">Set up your pop-up preferences and behavior.</p>

    <!-- Popup content -->
    <div class="space-y-6">
      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700">Enable Pop-up</label>
        <div class="flex items-center">
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-600">Show pop-up on page load</span>
        </div>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700">Pop-up Title</label>
        <input
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Special Offer!"
        />
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700">Pop-up Message</label>
        <textarea
          class="w-full rounded-md border border-gray-300 px-3 py-2"
          rows="3"
          placeholder="Get 10% off your first order..."
        ></textarea>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700">Display Delay (seconds)</label>
        <input
          type="number"
          class="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="3"
          min="0"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Popup logic would go here
</script>
