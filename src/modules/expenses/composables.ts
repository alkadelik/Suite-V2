import { computed, watch } from "vue"
import { useGetExpenseCategories } from "./api"
import { useExpenseStore } from "./store"
import { isTaxCategory, isShippingSubcategory } from "./constants"

/**
 * The expense categories, served from the persisted store and fetched once when it's
 * empty. Shared by everything that needs to turn a category/sub-category name into the
 * uid the API filters on.
 */
export function useExpenseCategories() {
  const expenseStore = useExpenseStore()
  const { data: apiCategories } = useGetExpenseCategories(
    computed(() => !expenseStore.hasCategories()),
  )

  watch(
    () => apiCategories.value,
    (data) => {
      if (data?.results && data.results.length > 0) expenseStore.setCategories(data.results)
    },
    { immediate: true },
  )

  const categories = computed(() => {
    if (expenseStore.categories && expenseStore.categories.length > 0) {
      return expenseStore.categories
    }
    return apiCategories.value?.results || []
  })

  /** Uids of the tax category (and the legacy "Tax" one, for older stores) */
  const taxCategoryUids = computed(() =>
    categories.value.filter((cat) => isTaxCategory(cat.name)).map((cat) => cat.uid),
  )

  /** Uids of the "Shipping and handling" sub-category, which lives under Sales Expenses */
  const shippingSubCategoryUids = computed(() =>
    categories.value
      .flatMap((cat) => cat.sub_categories ?? [])
      .filter((sub) => isShippingSubcategory(sub.name))
      .map((sub) => sub.uid),
  )

  return { categories, taxCategoryUids, shippingSubCategoryUids }
}
