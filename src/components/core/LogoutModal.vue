<template>
  <Modal :open="open" max-width="md" title="Logout" @close="emit('close')">
    <div class="flex flex-col items-center">
      <span class="mb-2 rounded-full bg-red-100 p-4 text-red-600">
        <Icon name="signout" size="36" />
      </span>
      <p class="text-lg font-medium">Are you sure you want to logout?</p>
      <p class="text-center text-gray-600">
        Any unsaved work will be lost. Make sure you've saved your progress before continuing.
      </p>
    </div>

    <template #footer>
      <div class="grid grid-cols-2 gap-2">
        <AppButton label="Cancel" color="alt" @click="emit('close')" />
        <AppButton color="error" label="Logout" @click="onLogout" />
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import Modal from "@components/Modal.vue"
import { useAuthStore } from "@modules/auth/store"

defineProps({ open: Boolean })
const emit = defineEmits(["close"])
const store = useAuthStore()

const onLogout = () => {
  console.log("Logging out...")
  store.logout()
  emit("close")
}
</script>
