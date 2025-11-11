import type { ComputedRef } from "vue"
import type { IVariantConfiguration } from "./useProductFormState"
import type { IProductVariant, IProductAttribute } from "../types"
import { WEIGHT_ATTRIBUTE_UID } from "../constants"
import { useWeightBasedDimensions } from "./useWeightBasedDimensions"

/**
 * Variant Combination Type
 * Represents a single combination of attribute values
 */
interface IVariantCombination {
  attributeUid: string
  valueUid: string
  valueLabel: string
}

/**
 * Composable for variant configuration management
 *
 * Architectural decisions:
 * - Pure computation functions for variant combinations
 * - No side effects - all transformations are deterministic
 * - Cartesian product algorithm for multi-variant generation
 * - Preserves existing variant data during regeneration
 *
 * @param variantConfiguration - Ref to variant configuration array
 * @param variants - Ref to variants array
 * @param productName - Product name for variant naming
 * @returns Helper functions for variant configuration
 */
export function useVariantConfiguration(
  variantConfiguration: ComputedRef<IVariantConfiguration[]> | { value: IVariantConfiguration[] },
  variants: { value: IProductVariant[] },
  productName: ComputedRef<string> | { value: string },
) {
  // Initialize weight-based dimensions composable
  const { mapWeightToDimensions } = useWeightBasedDimensions()
  /**
   * Extract value from variant name (handles object and string types)
   */
  const getVariantValue = (variant: IVariantConfiguration): string => {
    if (!variant?.name) return ""

    if (typeof variant.name === "object" && variant.name !== null) {
      return (variant.name.value as string) || ""
    }

    return variant.name
  }

  /**
   * Get display name for a variant (resolves custom types)
   */
  const getVariantDisplayName = (variant: IVariantConfiguration): string => {
    if (!variant) return ""

    const variantValue = getVariantValue(variant)

    if (variantValue === "custom_type") {
      return variant.customName?.trim() || ""
    }

    return variantValue
  }

  /**
   * Get normalized name for comparison (lowercase, trimmed)
   */
  const getVariantFinalName = (variant: IVariantConfiguration): string => {
    if (!variant) return ""

    const variantValue = getVariantValue(variant)

    if (variantValue === "custom_type") {
      return variant.customName?.trim().toLowerCase() || ""
    }

    return variantValue.toLowerCase()
  }

  /**
   * Get minimum values required for a variant
   * First variant needs at least 2 values, others need at least 1
   */
  const getMinimumValuesRequired = (index: number): number => {
    if (variantConfiguration.value.length === 1 || index === 0) {
      return 2
    }
    return 1
  }

  /**
   * Generate all possible combinations using Cartesian product
   * Handles both single and multiple variant configurations
   */
  const generateCombinations = (
    processedVariants: IVariantConfiguration[],
  ): IVariantCombination[][] => {
    if (processedVariants.length === 0) {
      return []
    }

    // Single variant - return each value as separate combination
    if (processedVariants.length === 1) {
      const variant = processedVariants[0]
      const attributeUid = typeof variant.name === "object" ? (variant.name?.value as string) : ""

      return variant.values.map((value) => [
        {
          attributeUid,
          valueUid:
            typeof value === "object" && value !== null && "value" in value ? value.value : "",
          valueLabel:
            typeof value === "object" && value !== null && "label" in value
              ? value.label
              : String(value),
        },
      ])
    }

    // Multiple variants - generate Cartesian product recursively
    const [firstVariant, ...remainingVariants] = processedVariants

    const firstAttributeUid =
      typeof firstVariant.name === "object" ? (firstVariant.name?.value as string) : ""

    const firstVariantCombinations = firstVariant.values.map((value) => ({
      attributeUid: firstAttributeUid,
      valueUid: typeof value === "object" && value !== null && "value" in value ? value.value : "",
      valueLabel:
        typeof value === "object" && value !== null && "label" in value
          ? value.label
          : String(value),
    }))

    const remainingCombinations = generateCombinations(remainingVariants)

    const allCombinations: IVariantCombination[][] = []

    firstVariantCombinations.forEach((firstCombination) => {
      remainingCombinations.forEach((remainingCombination) => {
        allCombinations.push([firstCombination, ...remainingCombination])
      })
    })

    return allCombinations
  }

  /**
   * Generate variant name from combination
   * Format: "ProductName - Value1 Value2 ..."
   */
  const generateVariantName = (combination: IVariantCombination[]): string => {
    const name = typeof productName === "object" ? productName.value : productName
    const valueLabels = combination.map((c) => c.valueLabel).join(" ")
    return `${name || "Product"} - ${valueLabels}`
  }

  /**
   * Generate variant attributes array from combination
   */
  const generateVariantAttributes = (combination: IVariantCombination[]): IProductAttribute[] => {
    return combination.map((item) => ({
      attribute: item.attributeUid,
      value: item.valueUid,
      valueLabel: item.valueLabel,
    }))
  }

  /**
   * Detect deleted variants by comparing existing variants with new combinations
   * Returns variants that exist in the current state but won't exist after regeneration
   */
  const detectDeletedVariants = (
    existingVariants: IProductVariant[],
    newCombinations: IVariantCombination[][],
  ): IProductVariant[] => {
    const deletedVariants: IProductVariant[] = []

    // For each existing variant, check if it matches any new combination
    existingVariants.forEach((existing) => {
      // Skip if no attributes (shouldn't happen in multi-variant scenario)
      if (!existing.attributes || existing.attributes.length === 0) {
        return
      }

      // Check if this variant exists in the new combinations
      const existsInNewCombinations = newCombinations.some((combination) => {
        // Variant matches if all attributes match
        if (combination.length !== existing.attributes.length) {
          return false
        }

        return combination.every((combAttr) =>
          existing.attributes.some(
            (existingAttr) =>
              existingAttr.attribute === combAttr.attributeUid &&
              existingAttr.value === combAttr.valueUid,
          ),
        )
      })

      // If it doesn't exist in new combinations, it's deleted
      if (!existsInNewCombinations) {
        deletedVariants.push(existing)
      }
    })

    return deletedVariants
  }

  /**
   * Generate all variant combinations from configuration
   * Preserves existing variant data where attributes match
   * Returns deleted variants (if any)
   */
  const generateVariantCombinations = (): IProductVariant[] => {
    const processedVariants = variantConfiguration.value.filter(
      (variant) => variant.values.length > 0,
    )

    if (processedVariants.length === 0) {
      return []
    }

    console.log("Generating variant combinations...")

    // Get all possible combinations
    const combinations = generateCombinations(processedVariants)

    // Store existing variants for matching
    const existingVariants = [...variants.value]

    // Detect deleted variants
    const deletedVariants = detectDeletedVariants(existingVariants, combinations)

    // Get default dimensions from first existing variant
    const defaultDimensions =
      existingVariants.length > 0
        ? {
            weight: existingVariants[0].weight || "0",
            length: existingVariants[0].length || "0",
            width: existingVariants[0].width || "0",
            height: existingVariants[0].height || "0",
          }
        : { weight: "0", length: "0", width: "0", height: "0" }

    // Clear and rebuild variants array
    variants.value = []

    // Create variant for each combination
    combinations.forEach((combination, index) => {
      const variantName = generateVariantName(combination)
      const attributes = generateVariantAttributes(combination)

      // Try to find matching existing variant
      const matchingVariant = existingVariants.find((existing) => {
        if (!existing.attributes || existing.attributes.length !== attributes.length) {
          return false
        }

        return attributes.every((attr) =>
          existing.attributes.some(
            (existingAttr) =>
              existingAttr.attribute === attr.attribute && existingAttr.value === attr.value,
          ),
        )
      })

      // Check if this combination contains the Weight (Kg) attribute
      const weightAttribute = attributes.find((attr) => attr.attribute === WEIGHT_ATTRIBUTE_UID)

      // Auto-populate dimensions from weight if weight attribute is present
      let dimensionsFromWeight: {
        weight: string
        height: string
        length: string
        width: string
      } = defaultDimensions

      if (weightAttribute && weightAttribute.valueLabel) {
        const weightValue = weightAttribute.valueLabel
        const dimensionMapping = mapWeightToDimensions(weightValue)

        if (dimensionMapping) {
          dimensionsFromWeight = {
            weight: dimensionMapping.weight,
            height: dimensionMapping.height,
            length: dimensionMapping.length,
            width: dimensionMapping.width,
          }

          console.log(
            `Auto-populated dimensions for weight ${weightValue}kg:`,
            dimensionMapping.dimension.shortLabel,
          )
        }
      }

      const newVariant: IProductVariant = {
        name: matchingVariant?.name || variantName,
        sku: matchingVariant?.sku || `SKU-${Date.now()}-${index + 1}`,
        price: matchingVariant ? (matchingVariant.price ?? "0") : "0",
        promo_price: matchingVariant?.promo_price || "",
        promo_expiry:
          matchingVariant?.promo_expiry ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cost_price: matchingVariant?.cost_price || "",
        // Use weight-based dimensions if weight attribute exists, otherwise use matching variant or defaults
        weight: matchingVariant?.weight || dimensionsFromWeight.weight,
        length: matchingVariant?.length || dimensionsFromWeight.length,
        width: matchingVariant?.width || dimensionsFromWeight.width,
        height: matchingVariant?.height || dimensionsFromWeight.height,
        reorder_point: matchingVariant?.reorder_point || "",
        max_stock: matchingVariant?.max_stock || "",
        opening_stock: matchingVariant?.opening_stock || "",
        is_active: matchingVariant?.is_active ?? true,
        is_default: matchingVariant?.is_default ?? index === 0,
        batch_number: matchingVariant?.batch_number || "",
        expiry_date:
          matchingVariant?.expiry_date ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        attributes,
      }

      variants.value.push(newVariant)
    })

    console.log(`Generated ${variants.value.length} variant combinations`)
    if (deletedVariants.length > 0) {
      console.log(`Detected ${deletedVariants.length} deleted variants`)
    }

    return deletedVariants
  }

  return {
    // Helper functions
    getVariantValue,
    getVariantDisplayName,
    getVariantFinalName,
    getMinimumValuesRequired,

    // Generation functions
    generateCombinations,
    generateVariantName,
    generateVariantAttributes,
    generateVariantCombinations,
    detectDeletedVariants,
  }
}
