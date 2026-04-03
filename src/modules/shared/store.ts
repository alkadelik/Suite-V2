import { defineStore } from "pinia"
import { ref } from "vue"

export const useSharedStore = defineStore("shared", () => {
  // State
  const isSupportModalOpen = ref(false)

  // Actions
  const openSupportModal = () => {
    isSupportModalOpen.value = true
  }

  const closeSupportModal = () => {
    isSupportModalOpen.value = false
  }

  return {
    // State
    isSupportModalOpen,

    // Actions
    openSupportModal,
    closeSupportModal,
  }
})
