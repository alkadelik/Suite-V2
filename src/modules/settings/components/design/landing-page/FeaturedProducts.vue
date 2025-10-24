<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Featured Products</h4>
    </div>
    <form class="grid gap-6 md:p-6" @submit.prevent="handleSubmit">
      <FormField
        type="radio"
        name="selection_mode"
        label="Select Featured Products"
        :radio-options="SELECTION_OPTIONS"
        v-model="formData.selection_mode"
      />

      <FormField
        name="title"
        label="Title (optional)"
        placeholder="e.g. Welcome to my Store"
        v-model="formData.title"
      />

      <FormField
        name="description"
        type="textarea"
        label="Description (optional)"
        placeholder="e.g. Discover amazing products and deals!"
        v-model="formData.description"
      />

      <div class="flex justify-end">
        <AppButton type="submit" label="Save Section" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"

const SELECTION_OPTIONS = [
  {
    label: "Default",
    description: "System chooses for you",
    value: "default",
  },
  {
    label: "Custom",
    description: "You pick specific products to display",
    value: "custom",
  },
]

// Form data
const formData = reactive({
  selection_mode: "default",
  title: "",
  description: "",
})

// Submit handler
const handleSubmit = () => {
  console.log("Form submitted with values:", formData)
  console.log("Selection Mode:", formData.selection_mode)
  console.log("Title:", formData.title)
  console.log("Description:", formData.description)
}
</script>
