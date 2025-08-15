<script setup>
import { Icon } from "@iconify/vue";
import AppButton from "~/components/common/app-button.vue";
import Modal from "~/components/common/modal.vue";
import { useAuthStore } from "~/stores/auth";

defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue"]);
const { logout } = useAuthStore();
</script>

<template>
  <Modal :open="modelValue" size="md" centered @update:open="emit('update:modelValue', $event)">
    <div class="flex flex-col items-center justify-center gap-2 text-center">
      <Icon icon="solar:logout-3-bold-duotone" class="text-error h-14 w-14" />
      <h4 class="text-base font-semibold">Confirm Logout</h4>
      <p class="text-sm text-brand-400">
        Are you sure you want to log out? You will be signed out of your account.
      </p>
      <AppButton label="Yes, Log Out" class="bg-error w-full focus:ring-error/20" @click="logout" />
    </div>
  </Modal>
</template>
