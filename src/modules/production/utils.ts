import { TConversion } from "./types"

/** Returns the purchase unit for a given material
 * The purchase unit is determined by the first conversion's to_unit value. If there are no conversions
 * it returns the material's unit.
 */
export const getProdUsageUnit = (material: { unit: string; conversions?: TConversion[] }) => {
  const conversion = material.conversions?.[0]
  if (!conversion) return material.unit
  return conversion.to_unit
}

/** Converts a quantity from the material's unit to the purchase unit using the first conversion rate.
 * If there are no conversions, it returns the original quantity.
 */
export const convertQtyToUsageUnit = (
  quantity: number,
  material: { unit: string; conversions?: TConversion[] },
) => {
  const conversion = material.conversions?.[0]
  if (!conversion) return quantity // No conversion, return original quantity

  return quantity * Number(conversion.rate)
}

/** Converts a stored quantity in usage unit back to a human-readable
 * purchase-unit quantity for display. This is the inverse of convertQtyToUsageUnit:
 * the save flow divided by rate, so display multiplies by rate.
 */
export const convertQtyToPurchaseUnit = (
  quantity: number,
  material: { unit: string; conversions?: TConversion[] },
) => {
  const conversion = material.conversions?.[0]
  if (!conversion) return quantity

  return quantity / Number(conversion.rate)
}
