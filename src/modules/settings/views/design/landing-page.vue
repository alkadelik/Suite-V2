<template>
  <div>
    <h3 class="mb-4 text-lg font-semibold">Landing Page Configuration</h3>
    <p class="mb-6 text-gray-600">Configure your landing page settings and layout.</p>

    <!-- Landing page content -->
    <div class="space-y-6">
      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700">Page Title</label>
        <input
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Welcome to Our Store"
        />
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700">Hero Section</label>
        <textarea
          class="w-full rounded-md border border-gray-300 px-3 py-2"
          rows="4"
          placeholder="Describe your business..."
        ></textarea>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700">Call to Action Button</label>
        <input
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Shop Now"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Landing page logic would go here
</script>
