import { TConversion } from "@modules/production/types"

export type IngredientRow = {
  id: string
  ingredient: {
    label: string
    value: string
    unit: string
    cost_per_unit: number
    kind: string
    conversions?: TConversion[]
    // not in api, added for convenience
    available_stock?: number
    used_stock?: number
  }
  qty: number
}

export type ProcessRow = {
  id: string
  name: string
  cost: string
  note: string
}

export type AdditionalExpenseRow = {
  id: string
  name: string
  amount: string
}

export type BasicRunDetails = {
  outputQuantity: number
  damagedQuantity: number
  recipeUid: string
  recipeOption?: {
    label: string
    value: string
    item_type?: string
    output_product?: string | null
  } | null
  outputVariantUid?: string
  outputVariantOption?: { label: string; value: string; price?: number } | null
  outputItemType?: "product" | "sub_assembly"
  outputUnit?: string
  variantPrice?: number
}
