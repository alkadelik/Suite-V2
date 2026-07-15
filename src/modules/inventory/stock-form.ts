export const NEW_PURCHASE_REASON = "New purchase"

export interface AddStockDefaults {
  unitCost: string
  note: string
  recordExpense: boolean
}

/** Shared defaults for every manual add-stock entry point. */
export function getAddStockDefaults(previousCostPrice?: string | number | null): AddStockDefaults {
  return {
    unitCost:
      previousCostPrice === null || previousCostPrice === undefined
        ? ""
        : String(previousCostPrice),
    note: NEW_PURCHASE_REASON,
    recordExpense: true,
  }
}
