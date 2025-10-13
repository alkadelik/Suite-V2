import { computed, type ComputedRef, type Ref } from "vue"
import { PRODUCT_DIMENSIONS } from "../constants"
import type { IProductDimension, IProductVariant } from "../types"

/**
 * Weight-based dimension mapping result
 */
export interface IWeightDimensionMapping {
  weight: string
  height: string
  length: string
  width: string
  dimension: IProductDimension
}

/**
 * Composable for weight-based dimension auto-population
 *
 * Architectural decisions:
 * - Pure computation functions for weight-to-dimension mapping
 * - Uses PRODUCT_DIMENSIONS as single source of truth
 * - Handles edge cases (out of range weights, invalid values)
 * - Type-safe with explicit return types
 * - No side effects - returns data for caller to apply
 *
 * Business logic:
 * - Maps weight values to appropriate dimension ranges
 * - Auto-populates height, width, depth based on weight category
 * - Supports both numeric and string weight inputs
 * - Falls back to largest dimension for weights exceeding ranges
 *
 * @returns Helper functions and computed properties for weight-based dimensions
 */
export function useWeightBasedDimensions() {
  /**
   * Sanitize weight value by removing units and extracting numeric value
   * Handles formats: "10", "10kg", "10 kg", "10.5kg", "10.5 kg", etc.
   *
   * @param weightValue - Raw weight value
   * @returns Numeric weight value or NaN if invalid
   */
  const sanitizeWeightValue = (weightValue: string | number | null | undefined): number => {
    if (!weightValue) return NaN

    // If already a number, return as-is
    if (typeof weightValue === "number") return weightValue

    // Remove common weight units and whitespace, then parse
    const sanitized = weightValue
      .toLowerCase()
      .replace(/\s*(kg|kgs|kilos|kilogram|kilograms)\s*/gi, "")
      .trim()

    return parseFloat(sanitized)
  }

  /**
   * Find the appropriate dimension for a given weight value
   * Uses the first dimension where weight <= max_weight
   *
   * @param weightValue - Weight in kg (string or number, with or without units)
   * @returns Matching dimension or null if invalid
   */
  const findDimensionForWeight = (
    weightValue: string | number | null | undefined,
  ): IProductDimension | null => {
    if (!weightValue) return null

    const weight = sanitizeWeightValue(weightValue)

    if (isNaN(weight) || weight <= 0) return null

    // Sort dimensions by max_weight ascending
    const sortedDimensions = [...PRODUCT_DIMENSIONS].sort((a, b) => a.max_weight - b.max_weight)

    // Find first dimension where weight fits in range
    const matchingDimension = sortedDimensions.find((dim) => weight <= dim.max_weight)

    // If weight exceeds all ranges, return the largest dimension
    return matchingDimension || sortedDimensions[sortedDimensions.length - 1]
  }

  /**
   * Generate complete dimension mapping from weight value
   * Includes all dimensional properties needed for variants
   *
   * @param weightValue - Weight in kg
   * @returns Complete dimension mapping or null
   */
  const mapWeightToDimensions = (
    weightValue: string | number | null | undefined,
  ): IWeightDimensionMapping | null => {
    const dimension = findDimensionForWeight(weightValue)

    if (!dimension) return null

    return {
      weight: typeof weightValue === "number" ? weightValue.toString() : weightValue || "0",
      height: dimension.height.toString(),
      length: dimension.depth.toString(),
      width: dimension.width.toString(),
      dimension,
    }
  }

  /**
   * Check if a weight value falls within a specific dimension range
   *
   * @param weightValue - Weight to check (with or without units)
   * @param dimension - Dimension to compare against
   * @returns True if weight matches this dimension's range
   */
  const isWeightInDimensionRange = (
    weightValue: string | number | null | undefined,
    dimension: IProductDimension,
  ): boolean => {
    if (!weightValue) return false

    const weight = sanitizeWeightValue(weightValue)

    if (isNaN(weight) || weight <= 0) return false

    // Get the previous dimension's max_weight as the lower bound
    const sortedDimensions = [...PRODUCT_DIMENSIONS].sort((a, b) => a.max_weight - b.max_weight)
    const dimensionIndex = sortedDimensions.findIndex((d) => d.name === dimension.name)

    if (dimensionIndex === -1) return false

    const lowerBound = dimensionIndex > 0 ? sortedDimensions[dimensionIndex - 1].max_weight : 0
    const upperBound = dimension.max_weight

    return weight > lowerBound && weight <= upperBound
  }

  /**
   * Get dimension label for a weight value
   * Useful for displaying weight category in UI
   *
   * @param weightValue - Weight value
   * @returns Human-readable dimension label or null
   */
  const getDimensionLabelForWeight = (
    weightValue: string | number | null | undefined,
  ): string | null => {
    const dimension = findDimensionForWeight(weightValue)
    return dimension ? dimension.label : null
  }

  /**
   * Validate if weight value is within acceptable ranges
   * Handles weight values with or without units (kg)
   *
   * @param weightValue - Weight to validate (e.g., "10", "10kg", "10 kg")
   * @returns Validation result with optional error message
   */
  const validateWeight = (
    weightValue: string | number | null | undefined,
  ): { valid: boolean; error?: string } => {
    if (!weightValue) {
      return { valid: false, error: "Weight is required" }
    }

    const weight = sanitizeWeightValue(weightValue)

    if (isNaN(weight)) {
      return { valid: false, error: "Weight must be a valid number" }
    }

    if (weight <= 0) {
      return { valid: false, error: "Weight must be greater than 0" }
    }

    // All weights are acceptable - we'll map to appropriate dimension
    return { valid: true }
  }

  /**
   * Extract weight values from variant attributes
   * Looks for the Weight (Kg) attribute and returns its value
   *
   * @param variant - Product variant with attributes
   * @param weightAttributeUid - UID of the Weight (Kg) attribute
   * @returns Weight value or null if not found
   */
  const extractWeightFromVariant = (
    variant: IProductVariant,
    weightAttributeUid: string,
  ): string | null => {
    if (!variant.attributes || variant.attributes.length === 0) {
      return null
    }

    const weightAttribute = variant.attributes.find((attr) => attr.attribute === weightAttributeUid)

    if (!weightAttribute) return null

    // Return the valueLabel (actual weight value) instead of UID
    return weightAttribute.valueLabel || weightAttribute.value
  }

  /**
   * Check if any variant has the Weight (Kg) attribute
   *
   * @param variants - Array of product variants
   * @param weightAttributeUid - UID of the Weight (Kg) attribute
   * @returns True if at least one variant has weight attribute
   */
  const hasWeightAttribute = (variants: IProductVariant[], weightAttributeUid: string): boolean => {
    return variants.some(
      (variant) =>
        variant.attributes &&
        variant.attributes.some((attr) => attr.attribute === weightAttributeUid),
    )
  }

  /**
   * Computed helper for dimension options with weight ranges
   * Useful for select dropdowns
   */
  const dimensionOptions = computed(() =>
    PRODUCT_DIMENSIONS.map((dim) => ({
      label: `${dim.shortLabel} (${dim.range}) — ${dim.examples}`,
      value: dim,
      dimension: dim,
    })),
  )

  return {
    // Core functions
    sanitizeWeightValue,
    findDimensionForWeight,
    mapWeightToDimensions,
    isWeightInDimensionRange,
    getDimensionLabelForWeight,
    validateWeight,

    // Variant-specific helpers
    extractWeightFromVariant,
    hasWeightAttribute,

    // Computed properties
    dimensionOptions,
  }
}

/**
 * Composable variant for reactive weight-based dimension updates
 * Watches weight values and automatically updates dimensions
 *
 * @param weightValue - Reactive weight value
 * @returns Reactive dimension mapping
 */
export function useReactiveWeightDimensions(
  weightValue: Ref<string | number | null> | ComputedRef<string | number | null>,
) {
  const { mapWeightToDimensions, getDimensionLabelForWeight } = useWeightBasedDimensions()

  const dimensionMapping = computed(() => {
    return mapWeightToDimensions(weightValue.value)
  })

  const dimensionLabel = computed(() => {
    return getDimensionLabelForWeight(weightValue.value)
  })

  const hasValidDimension = computed(() => {
    return dimensionMapping.value !== null
  })

  return {
    dimensionMapping,
    dimensionLabel,
    hasValidDimension,
  }
}
