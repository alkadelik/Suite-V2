import { defineStore } from "pinia"
import { ref } from "vue"
import { computed } from "vue"
import { TRawMaterial } from "./types"

export const useProductionStore = defineStore(
  "production",
  () => {
    const selectedComponentOption = ref<{ label: string; value: string } | null>(null)
    const componentLabel = computed(() => {
      return selectedComponentOption.value ? selectedComponentOption.value.label : ""
    })
    const componentValue = computed(() => {
      return selectedComponentOption.value ? selectedComponentOption.value.value : ""
    })

    const setSelectedComponentOption = (option: { label: string; value: string }) => {
      selectedComponentOption.value = option
    }

    // Selected material for editing/adjusting
    const selectedMaterial = ref<TRawMaterial | null>(null)
    const showEditDrawer = ref(false)
    const showAdjustStockModal = ref(false)

    const openEditMaterial = (material: TRawMaterial) => {
      selectedMaterial.value = material
      showEditDrawer.value = true
    }

    const closeEditMaterial = () => {
      selectedMaterial.value = null
      showEditDrawer.value = false
    }

    const openAdjustStock = (material: TRawMaterial) => {
      selectedMaterial.value = material
      showAdjustStockModal.value = true
    }

    const closeAdjustStock = () => {
      selectedMaterial.value = null
      showAdjustStockModal.value = false
    }

    return {
      selectedComponentOption,
      componentLabel,
      componentValue,
      setSelectedComponentOption,
      selectedMaterial,
      showEditDrawer,
      showAdjustStockModal,
      openEditMaterial,
      closeEditMaterial,
      openAdjustStock,
      closeAdjustStock,
    }
  },
  { persist: true },
)
