import { floatDecimal } from "@/utils/others"
import { TConversion, TRawMaterial } from "./types"

export type TConversionItem = { unit: string; conversions?: TConversion[] }

export type TMaterialWarning = { key: string; icon: string; class: string; tooltip: string }

/**
 * Warning indicators (with tooltips) shown beside a material's name.
 * `label` is the singular component name e.g. "material", "ingredient", "component".
 */
export const getMaterialWarnings = (
  material: Pick<TRawMaterial, "low_stock" | "has_expired_items">,
  label = "material",
): TMaterialWarning[] => {
  const warnings: TMaterialWarning[] = []

  if (material.has_expired_items) {
    warnings.push({
      key: "expired",
      icon: "danger",
      class: "text-error-500",
      tooltip: `One or more batches of this ${label} have expired.`,
    })
  }

  if (material.low_stock) {
    warnings.push({
      key: "low_stock",
      icon: "danger",
      class: "text-warning-500",
      tooltip: `This ${label} needs to be restocked.`,
    })
  }

  return warnings
}

export const getProdUsageUnit = (material: TConversionItem) => {
  const conversion = material.conversions?.[0]
  if (!conversion) return material.unit
  return conversion.from_unit
}

export const getPurchaseUnit = (material: TRawMaterial) => {
  const conversion = material.conversions?.[0]
  if (!conversion) return material.unit
  return conversion.to_unit
}

export const convertNumToUsageUnit = (quantity: number, material: TConversionItem) => {
  const conversion = material.conversions?.[0]
  if (!conversion) return quantity // No conversion, return original quantity

  return floatDecimal(quantity * Number(conversion.rate))
}

export const convertNumToPurchaseUnit = (quantity: number, material: TConversionItem) => {
  const conversion = material.conversions?.[0]
  if (!conversion) return quantity

  return floatDecimal(quantity / Number(conversion.rate))
}
