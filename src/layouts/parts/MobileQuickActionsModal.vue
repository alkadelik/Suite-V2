<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"
import Modal from "@components/Modal.vue"
import { useRouter } from "vue-router"
import { useSettingsStore } from "@modules/settings/store"
import { usePremiumAccess } from "@/composables/usePremiumAccess"
import { useProductionStore } from "@modules/production/store"
import { toast } from "@/composables/useToast"
import { startCase } from "@/utils/format-strings"

defineProps<{ open: boolean; onClose: () => void }>()

const router = useRouter()
const { checkPremiumAccess } = usePremiumAccess()

const isHQ = computed(() => useSettingsStore().activeLocation?.is_hq ?? true)
const materialSingular = computed(() => useProductionStore().componentSingular)
const recipeSingularLabel = computed(() => useProductionStore().recipeSingularLabel)

const quickActions = computed(() => {
  const onNavigate = (path: string) => {
    if (!checkPremiumAccess()) return
    if (!path.startsWith("/"))
      return toast.info("This module is coming soon!", { title: "Discounts" })
    router.push(path)
  }

  const allActions = [
    {
      label: "Add Product",
      icon: "box-add-filled",
      color: "bg-blue-50 text-blue-800 border-blue-100",
      action: () => onNavigate("/inventory/products?create=true"),
      hqOnly: true,
    },
    {
      label: "Add Customer",
      icon: "profile-add",
      color: "bg-warning-50 text-warning-800 border-warning-100",
      action: () => onNavigate("/customers?create=true"),
    },
    {
      label: "Add Order",
      icon: "bag",
      color: "bg-green-50 text-green-800 border-green-100",
      action: () => onNavigate("/orders?create=true"),
    },
    {
      label: "Add Expense",
      icon: "receipt-add",
      color: "bg-bloom-50 text-bloom-800 border-bloom-100",
      action: () => onNavigate("/expenses?create=true"),
    },
    {
      label: "Add Popup",
      icon: "calendar-tick-filled",
      color: "bg-violet-50 text-violet-800 border-violet-100",
      action: () => onNavigate("/popups?create=true"),
      hqOnly: true,
    },
    {
      label: "Add Discount",
      icon: "tag-2-filled",
      color: "bg-primary-50 text-primary-800 border-primary-100",
      action: () => onNavigate("Discounts"),
      hqOnly: true,
    },
    {
      label: `Add ${startCase(materialSingular.value)}`,
      icon: "document-normal-filled",
      color: "bg-warning-50 text-warning-800 border-warning-100",
      action: () => onNavigate("/production/raw-materials?create=true"),
      hqOnly: true,
    },
    {
      label: `Add ${startCase(recipeSingularLabel.value)}`,
      icon: "clipboard-text-filled",
      color: "bg-[#F9F7F6] text-[#432A1E] border-[#EAE1DC]",
      action: () => onNavigate("/production/recipes?create=true"),
      hqOnly: true,
    },
    {
      label: "Add Run",
      icon: "chart-filled",
      color: "bg-error-50 text-error-800 border-error-100",
      action: () => onNavigate("/production/runs?create=true"),
      hqOnly: true,
    },
  ]

  return allActions.filter((action) => !action.hqOnly || isHQ.value)
})
</script>

<template>
  <Modal variant="bottom-nav" max-width="5xl" body-class="!bg-white" :open="open" @close="onClose">
    <div class="grid grid-cols-3 gap-2 pb-20 md:gap-4 xl:grid-cols-5">
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
