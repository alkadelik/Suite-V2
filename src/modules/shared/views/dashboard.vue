<template>
  <div>
    <SectionHeader size="lg" :title="`Welcome, ${getFullName(user as TNameObj)}`" />
    <WelcomeToTeamModal v-model="openModal" />
  </div>
</template>

<script setup lang="ts">
import { getFullName, TNameObj } from "@/utils/format-strings"
import SectionHeader from "@components/SectionHeader.vue"
import { useAuthStore } from "@modules/auth/store"
import WelcomeToTeamModal from "../components/WelcomeToTeamModal.vue"
import { ref } from "vue"

const { user } = useAuthStore()
const openModal = ref(false)
</script>
