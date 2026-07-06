import { floatDecimal } from "@/utils/others"
import { TConversion, TRawMaterial } from "./types"

export type TConversionItem = { unit: string; conversions?: TConversion[] }

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
