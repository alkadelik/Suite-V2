import { defineStore } from "pinia"
import { ref } from "vue"
import { TExpenseCategory } from "./types"

export const useExpenseStore = defineStore(
  "expenses",
  () => {
    const categories = ref<TExpenseCategory[] | null>(null)

    const setCategories = (data: TExpenseCategory[]) => {
      categories.value = data
    }

    const clearCategories = () => {
      categories.value = null
    }

    const hasCategories = () => {
      return categories.value !== null && categories.value.length > 0
    }

    return {
      categories,
      setCategories,
      clearCategories,
      hasCategories,
    }
  },
  { persist: true },
)
