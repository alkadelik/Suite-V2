import { TConversion } from "./types"

/** Returns the purchase unit for a given material
 * The purchase unit is determined by the first conversion's to_unit value. If there are no conversions
 * it returns the material's unit.
 */
export const getPurchaseUnit = (material: { unit: string; conversions: TConversion[] }) => {
  const conversion = material.conversions[0]
  if (!conversion) return material.unit
  return conversion.to_unit
}

/** Converts a quantity from the material's unit to the purchase unit using the first conversion rate.
 * If there are no conversions, it returns the original quantity.
 */
export const convertToPurchaseUnit = (
  quantity: number,
  material: { unit: string; conversions: TConversion[] },
) => {
  const conversion = material.conversions[0]
  if (!conversion) return quantity // No conversion, return original quantity

  // Convert quantity to purchase unit
  if (conversion.from_unit === material.unit) {
    return quantity / Number(conversion.rate)
  } else if (conversion.to_unit === material.unit) {
    return quantity * Number(conversion.rate)
  }

  return quantity
}
