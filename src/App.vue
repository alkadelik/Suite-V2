<template>
  <div>
    <router-view />
    <ToastContainer />
    <ConsentBanner />
  </div>
</template>

<script setup lang="ts">
import ToastContainer from "@components/core/ToastContainer.vue"
import ConsentBanner from "@modules/shared/components/ConsentBanner.vue"
</script>
