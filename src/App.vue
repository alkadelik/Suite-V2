<template>
  <div>
    <router-view />
    <ToastContainer />
    <SupportModal />
  </div>
</template>

<script setup lang="ts">
import SupportModal from "@components/core/SupportModal.vue"
import ToastContainer from "@components/core/ToastContainer.vue"
</script>
