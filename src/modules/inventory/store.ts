import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { TProduct } from "./types"

export const useInventoryStore = defineStore("inventory", () => {
  // State
  const products = ref<TProduct[]>([])
  const totalCount = ref(0)

  // Computed
  const productCount = computed(() => totalCount.value)

  // Actions
  const setProducts = (productList: TProduct[], count: number) => {
    products.value = productList
    totalCount.value = count
  }

  const clearProducts = () => {
    products.value = []
    totalCount.value = 0
  }

  return {
    products,
    totalCount,
    productCount,
    setProducts,
    clearProducts,
  }
})
