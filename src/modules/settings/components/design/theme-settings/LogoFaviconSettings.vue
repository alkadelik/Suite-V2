<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Logo & Favicon</h4>
    </div>
    <div class="p-0 md:p-6">
      <div class="space-y-6">
        <!-- Logo Section -->
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex-1">
            <h5 class="mb-1 text-sm font-semibold text-gray-900">Logo</h5>
            <p class="text-sm text-gray-600">Add your brand's identity mark</p>
          </div>
          <div class="w-full md:w-64">
            <FormField
              type="file"
              name="logo"
              accept="image/*"
              :show-preview="true"
              :hide-label="true"
            />
          </div>
        </div>

        <!-- Divider -->
        <div class="hidden border-b border-gray-200 md:block"></div>

        <!-- Favicon Section -->
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex-1">
            <h5 class="mb-1 text-sm font-semibold text-gray-900">Favicon</h5>
            <p class="text-sm text-gray-600">
              A subtle touch that reinforces your brand identity across the web.
            </p>
          </div>
          <div class="w-full md:w-64">
            <FormField
              type="file"
              name="favicon"
              accept="image/*"
              :show-preview="true"
              :hide-label="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormField from "@components/form/FormField.vue"
</script>
