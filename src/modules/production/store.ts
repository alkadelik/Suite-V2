import { defineStore } from "pinia"
import { computed, ref } from "vue"

export const useProductionStore = defineStore(
  "production",
  () => {
    const selectedComponentOption = ref<{ label: string; value: string } | null>(null)
    const componentLabel = computed(() => selectedComponentOption.value?.label || "Raw Materials")
    const componentValue = computed(() => {
      const value = selectedComponentOption.value?.value
      return value === "raw_materials" ? "material" : value || "material"
    })

    const setSelectedComponentOption = (option: { label: string; value: string }) => {
      selectedComponentOption.value = option
    }

    const selectedRecipeOption = ref<{ label: string; value: string } | null>(null)
    const recipeLabel = computed(() => selectedRecipeOption.value?.label || "")
    const recipeValue = computed(() => selectedRecipeOption.value?.value || "")

    const setSelectedRecipeOption = (option: { label: string; value: string }) => {
      selectedRecipeOption.value = option
    }

    return {
      selectedComponentOption,
      componentLabel,
      componentValue,
      setSelectedComponentOption,
      selectedRecipeOption,
      recipeLabel,
      recipeValue,
      setSelectedRecipeOption,
    }
  },
  { persist: true },
)
