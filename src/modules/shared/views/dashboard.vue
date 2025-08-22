<template>
  <div>
    <SectionHeader size="lg" :title="`Welcome, ${getFullName(user as TNameObj)}`" />
  </div>
</template>

<script setup lang="ts">
import { getFullName, TNameObj } from "@/utils/format-strings"
import SectionHeader from "@components/SectionHeader.vue"
import { useAuthStore } from "@modules/auth/store"

const { user } = useAuthStore()
</script>
