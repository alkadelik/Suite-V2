import { defineStore } from "pinia"
import { ref } from "vue"
import { TExpenseCategory } from "./types"
import { DateRangeType } from "@/utils/formatDate"

export const useExpenseStore = defineStore(
  "expenses",
  () => {
    const categories = ref<TExpenseCategory[] | null>(null)
    const selectedDateRange = ref<DateRangeType>("last_7_days")

    const setCategories = (data: TExpenseCategory[]) => {
      categories.value = data
    }

    const clearCategories = () => {
      categories.value = null
    }

    const hasCategories = () => {
      return categories.value !== null && categories.value.length > 0
    }

    const setDateRange = (range: DateRangeType) => {
      selectedDateRange.value = range
    }

    return {
      categories,
      selectedDateRange,
      setCategories,
      clearCategories,
      hasCategories,
      setDateRange,
    }
  },
  { persist: true },
)
