export type IngredientRow = {
  id: string
  ingredient: {
    label: string
    value: string
    unit?: string
    cost_per_unit: number
    kind: string
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
  outputVariantUid?: string
}
