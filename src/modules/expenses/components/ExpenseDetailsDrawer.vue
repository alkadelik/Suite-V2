<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import { useMediaQuery } from "@vueuse/core"

defineProps<{ open: boolean }>()
const emit = defineEmits(["close", "refresh"])

const isMobile = useMediaQuery("(max-width: 1028px)")
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    title="Expense Details"
    max-width="2xl"
    variant="fullscreen"
    @close="emit('close')"
  >
  </component>
</template>
