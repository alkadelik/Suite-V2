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

    const setSelectedComponentOption = (option: { label: string; value: string } | null) => {
      selectedComponentOption.value = option
    }

    const componentSingular = computed(() => {
      const v = componentValue.value
      return v.endsWith("s") ? v.slice(0, -1) : v
    })

    const selectedRecipeOption = ref<{ label: string; value: string } | null>(null)
    const recipeLabel = computed(() => selectedRecipeOption.value?.label || "Recipes")
    const recipeValue = computed(() => selectedRecipeOption.value?.value || "recipe")

    const recipeSingularLabel = computed(() => {
      const v = recipeValue.value
      if (v === "bom") return "BOM"
      return v.charAt(0).toUpperCase() + v.slice(1)
    })

    const setSelectedRecipeOption = (option: { label: string; value: string } | null) => {
      selectedRecipeOption.value = option
    }

    return {
      selectedComponentOption,
      componentLabel,
      componentValue,
      componentSingular,
      setSelectedComponentOption,
      selectedRecipeOption,
      recipeLabel,
      recipeValue,
      recipeSingularLabel,
      setSelectedRecipeOption,
    }
  },
  { persist: true },
)
