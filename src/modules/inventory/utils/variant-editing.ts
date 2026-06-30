export const SINGLE_VARIANT_KEY = "__single_variant__"

export type TVariantAttributeLike = {
  attribute: string
  value: string
}

export type TVariantWithAttributes = {
  attributes?: TVariantAttributeLike[] | null
}

export const getVariantAttributeKey = (
  attributes: TVariantAttributeLike[] | null | undefined,
): string => {
  if (!attributes || attributes.length === 0) return SINGLE_VARIANT_KEY

  return attributes
    .map((attr) => `${attr.attribute}:${attr.value}`)
    .sort()
    .join("|")
}

export const getNewVariantAttributeKeys = <T extends TVariantWithAttributes>(
  variants: T[],
  originalKeys: Iterable<string>,
): string[] => {
  const existingKeys = new Set(originalKeys)
  const newKeys: string[] = []

  variants.forEach((variant) => {
    const key = getVariantAttributeKey(variant.attributes)
    if (!existingKeys.has(key) && !newKeys.includes(key)) {
      newKeys.push(key)
    }
  })

  return newKeys
}

export const filterVariantsByAttributeKeys = <T extends TVariantWithAttributes>(
  variants: T[],
  targetKeys: string[],
): T[] => {
  if (targetKeys.length === 0) return variants

  const targetKeySet = new Set(targetKeys)
  return variants.filter((variant) => targetKeySet.has(getVariantAttributeKey(variant.attributes)))
}
