<template>
  <ConfirmationModal
    v-model="isOpen"
    variant="error"
    header="Logout"
    paragraph="Are you sure you want to logout? Any unsaved work will be lost. Make sure you've saved your progress before continuing."
    header-icon="signout"
    action-label="Logout"
    info-message="You will need to login again to access your account."
    :loading="false"
    @confirm="onLogout"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import { useAuthStore } from "@modules/auth/store"

const props = defineProps({ open: Boolean })
const emit = defineEmits(["close"])
const store = useAuthStore()

const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) emit("close")
  },
})

const onLogout = () => {
  store.logout()
  emit("close")
}
</script>
