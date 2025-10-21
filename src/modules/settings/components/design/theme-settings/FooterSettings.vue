<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Footer</h4>
    </div>
    <div class="p-0 md:p-6">
      <p class="text-core-700 mb-4 text-sm">Fill in your business information</p>
      <div class="space-y-4">
        <FormField
          type="email"
          name="support_email"
          label="Support Email Address"
          placeholder="e.g Adebola99@gmail.com"
        />
        <FormField
          type="tel"
          name="support_phone"
          label="Support Phone Number"
          placeholder="901 234 5678"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormField from "@components/form/FormField.vue"
</script>
