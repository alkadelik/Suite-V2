import { defineStore } from "pinia"
import { ref } from "vue"

export type TDiscountsTab = "discounts" | "coupons"

export const useDiscountsStore = defineStore("discounts", () => {
  const activeTab = ref<TDiscountsTab>("discounts")
  const couponFilters = ref<{ status: string | null; scope: string | null; type: string | null }>({
    status: null,
    scope: null,
    type: null,
  })
  const setActiveTab = (tab: TDiscountsTab) => {
    activeTab.value = tab
  }
  const setCouponFilters = (f: typeof couponFilters.value) => {
    couponFilters.value = f
  }
  const clearCouponFilters = () => {
    couponFilters.value = { status: null, scope: null, type: null }
  }
  return { activeTab, couponFilters, setActiveTab, setCouponFilters, clearCouponFilters }
})
