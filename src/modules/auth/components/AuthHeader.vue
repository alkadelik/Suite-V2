<template>
  <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">{{ title }}</h2>
</template>

<script setup lang="ts">
import { defineProps } from "vue"

defineProps({
  title: { type: String, default: "" },
})
</script>
