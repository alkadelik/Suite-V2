<script setup>
import { Icon } from "@iconify/vue"
import { storeToRefs } from "pinia"
import { useRouter } from "vue-router"
import AppButton from "~/components/common/app-button.vue"
import Modal from "~/components/common/modal.vue"
import { useFeedbackStore } from "~/stores/feedback"

const router = useRouter()
const { closeSuccessModal } = useFeedbackStore()
const { successModal } = storeToRefs(useFeedbackStore())

const onClick = () => {
  router.push(successModal.value.link)
  closeSuccessModal()
}
</script>

<template>
  <Modal :open="successModal.open" size="md" centered @update:open="closeSuccessModal">
    <div class="flex flex-col items-center justify-center text-center">
      <Icon icon="flowbite:badge-check-solid" class="text-primary-500 h-28 w-28" />
      <h4 class="my-1 text-xl font-semibold">{{ successModal.title }}</h4>
      <p class="text-primary-400 mb-3 text-base">
        {{ successModal.subtitle }}
      </p>
      <AppButton
        v-if="successModal.link && successModal.linkText"
        :label="successModal.linkText"
        class="w-full"
        @click="onClick"
      />
    </div>
  </Modal>
</template>
