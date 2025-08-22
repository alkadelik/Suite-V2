<template>
  <div>
    <SectionHeader size="lg" :title="`Welcome, ${getFullName(user)}`" />
  </div>
</template>

<script setup lang="ts">
import { getFullName } from "@/utils/format-strings"
import SectionHeader from "@components/SectionHeader.vue"
import { useAuthStore } from "@modules/auth/store"

const { user } = useAuthStore()
</script>
