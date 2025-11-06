<template>
  <div>
    <router-view />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import ToastContainer from "@components/core/ToastContainer.vue"
</script>
