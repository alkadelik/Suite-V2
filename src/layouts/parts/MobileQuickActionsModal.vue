<script setup lang="ts">
import { toast } from "@/composables/useToast"
import Icon from "@components/Icon.vue"
import Modal from "@components/Modal.vue"
import { useRouter } from "vue-router"

defineProps<{ open: boolean; onClose: () => void }>()

const router = useRouter()

const quickActions = [
  {
    label: "Add a product",
    icon: "box",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    action: () => router.push("/inventory?create=true"),
  },
  {
    label: "Record a sale",
    icon: "bag",
    color: "bg-green-50 text-green-700 border-green-200",
    action: () => router.push("/orders?create=true"),
  },
  {
    label: "Create popup",
    icon: "calendar-tick",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    action: () => router.push("/popups?create=true"),
  },
  {
    label: "Add a customer",
    icon: "profile-add",
    color: "bg-primary-50 text-primary-700 border-primary-200",
    action: () => router.push("/customers?create=true"),
  },
  {
    label: "Record expense",
    icon: "receipt-add",
    color: "bg-pink-50 text-pink-700 border-pink-200",
    action: () => {
      toast.info("Expense module is coming soon!")
    },
  },
]
</script>

<template>
  <Modal variant="bottom-nav" max-width="5xl" :open="open" @close="onClose">
    <div class="grid grid-cols-3 gap-2 pb-28 md:gap-4 xl:grid-cols-5">
      <div
        v-for="action in quickActions"
        :key="action.label"
        class="cursor-pointer rounded-lg border px-2 py-3 text-center md:border-0 md:p-4 md:text-left"
        :class="action.color"
        @click="
          () => {
            action.action && action.action()
            onClose()
          }
        "
      >
        <div class="mb-1 flex items-center justify-between md:mb-4">
          <div
            class="border-core-200 mx-auto flex size-10 items-center justify-center rounded-xl border bg-white p-2 md:mx-0"
          >
            <Icon :name="action.icon" size="28" />
          </div>
        </div>
        <span class="text-xs font-medium md:text-base">{{ action.label }}</span>
      </div>
    </div>
  </Modal>
</template>
