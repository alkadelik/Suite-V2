export type IngredientRow = {
  id: string
  ingredient: {
    label: string
    value: string
    unit?: string
    cost_per_unit: number
    kind: string
    available_stock?: number
    low_stock?: boolean
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
}
