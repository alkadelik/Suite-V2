import { computed } from "vue"
import { useSettingsStore } from "@/modules/settings/store"
import { formatCurrency, truncateCurrency } from "@/utils/format-currency"

export function useFormatCurrency() {
  const currency = computed(() => useSettingsStore().storeDetails?.currency || "NGN")

  function format(
    value: number | string = 0,
    options: { currency?: string; kobo?: boolean } = {},
  ): string {
    return formatCurrency(value, { currency: currency.value, ...options })
  }

  function truncate(
    value: number | string = 0,
    options: { currency?: string; decimals?: number } = {},
  ): string {
    return truncateCurrency(value, { currency: currency.value, ...options })
  }

  return { currency, format, truncate }
}
