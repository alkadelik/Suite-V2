import { ref } from "vue"
import { ISelectOption, IIndustry, IRole } from "./types"

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

export const ROLE_OPTIONS = ref<ISelectOption[]>([])

export const updateStoreRoleOptions: (options: IRole[]) => void = (options) => {
  ROLE_OPTIONS.value.splice(
    0,
    ROLE_OPTIONS.value.length,
    ...options.map((option) => ({
      label: option.name,
      value: option.uid,
    })),
  )
}

export const CURRENCY_OPTIONS = [
  { label: "Nigerian Naira (NGN)", value: "NGN" },
  { label: "US Dollar (USD)", value: "USD" },
]
