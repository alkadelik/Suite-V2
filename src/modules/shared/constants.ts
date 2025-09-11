import { ref } from "vue"
import { ISelectOption, IIndustry } from "./types"

export const INDUSTRY_OPTIONS = ref<ISelectOption[]>([])

export const updateStoreIndustryOptions: (options: IIndustry[]) => void = (options) => {
  INDUSTRY_OPTIONS.value.splice(
    0,
    INDUSTRY_OPTIONS.value.length,
    ...options.map((option) => ({
      label: option.name,
      value: option.uid,
    })),
  )
}

export const CURRENCY_OPTIONS = [
  { label: "US Dollar (USD)", value: "USD" },
  { label: "Nigerian Naira (NGN)", value: "NGN" },
  { label: "British Pound (GBP)", value: "GBP" },
  { label: "Euro (EUR)", value: "EUR" },
  { label: "Canadian Dollar (CAD)", value: "CAD" },
  { label: "Australian Dollar (AUD)", value: "AUD" },
  { label: "Japanese Yen (JPY)", value: "JPY" },
  { label: "Swiss Franc (CHF)", value: "CHF" },
  { label: "Chinese Yuan (CNY)", value: "CNY" },
  { label: "Indian Rupee (INR)", value: "INR" },
  { label: "South African Rand (ZAR)", value: "ZAR" },
  { label: "Brazilian Real (BRL)", value: "BRL" },
  { label: "Mexican Peso (MXN)", value: "MXN" },
  { label: "Singapore Dollar (SGD)", value: "SGD" },
  { label: "Hong Kong Dollar (HKD)", value: "HKD" },
]
