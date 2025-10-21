<script setup lang="ts">
import FormField from "@components/form/FormField.vue"
import Switch from "@components/form/Switch.vue"
import { ref } from "vue"

const enablePopup = ref(false)
</script>

<template>
  <div class="border-core-200 rounded-lg border bg-white">
    <div class="p-6">
      <div
        class="flex items-center justify-between rounded-2xl border border-gray-400 bg-gray-50 p-4"
      >
        <div class="flex-1 text-sm">
          <h3 class="font-medium text-gray-700">Enable Pop Up</h3>
          <p class="text-gray-500">Visitors will see this once per session</p>
        </div>
        <Switch v-model="enablePopup" />
      </div>
    </div>

    <div v-if="enablePopup" class="border-core-200 border-t p-6">
      <form class="grid gap-6">
        <FormField name="headline" label="Headline" placeholder="Enter Popup headline here" />

        <FormField
          name="body_text"
          type="textarea"
          label="Body Text"
          placeholder="Enter Popup body text here"
        />

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField name="cta_button_text" label="CTA Button Text" placeholder="e.g. Shop Now" />
          <FormField
            name="cta_button_link"
            label="CTA Button Link"
            placeholder="e.g. https://yourstore.com/shop"
          />
        </div>
      </form>
    </div>
  </div>
</template>
