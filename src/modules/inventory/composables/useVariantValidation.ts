import { computed, type Ref } from "vue"
import type { IVariantConfiguration, IProductForm } from "./useProductFormState"
import type { IProductVariant } from "../types"

interface IVariantValidationOptions {
  form: IProductForm
  hasVariants: Ref<boolean>
  variantConfiguration: Ref<IVariantConfiguration[]>
  variants: Ref<IProductVariant[]>
  step: Ref<number>
  editMode?: string
}

export interface IProductDetailsValidationErrors {
  name?: string
  category?: string
}

export interface IVariantConfigurationFieldErrors {
  name?: string
  customName?: string
  values?: string
}

export interface IVariantConfigurationValidationErrors {
  global?: string
  variants: IVariantConfigurationFieldErrors[]
}

export interface IInventoryVariantValidationErrors {
  opening_stock?: string
  cost_price?: string
  price?: string
}

export interface IInventoryValidationErrors {
  weight?: string
  dimensions?: string
  dimensionFields: {
    height?: string
    length?: string
    width?: string
  }
  variants: IInventoryVariantValidationErrors[]
}

export interface ICurrentProductStepValidation {
  valid: boolean
  firstErrorTarget?: string
  productDetailsErrors: IProductDetailsValidationErrors
  variantConfigurationErrors: IVariantConfigurationValidationErrors
  inventoryErrors: IInventoryValidationErrors
}

const EMPTY_PRODUCT_DETAILS_ERRORS = (): IProductDetailsValidationErrors => ({})

const EMPTY_VARIANT_CONFIGURATION_ERRORS = (
  count: number,
): IVariantConfigurationValidationErrors => ({
  global: undefined,
  variants: Array.from({ length: count }, () => ({})),
})

const EMPTY_INVENTORY_ERRORS = (count: number): IInventoryValidationErrors => ({
  weight: undefined,
  dimensions: undefined,
  dimensionFields: {
    height: undefined,
    length: undefined,
    width: undefined,
  },
  variants: Array.from({ length: count }, () => ({})),
})

export function useVariantValidation(options: IVariantValidationOptions) {
  const { form, hasVariants, variantConfiguration, variants, step, editMode } = options

  const getVariantValue = (variant: IVariantConfiguration): string => {
    if (!variant?.name) return ""

    if (typeof variant.name === "object" && variant.name !== null) {
      return (variant.name.value as string) || ""
    }

    return variant.name
  }

  const getVariantDisplayName = (variant: IVariantConfiguration): string => {
    if (!variant) return ""

    const variantValue = getVariantValue(variant)

    if (variantValue === "custom_type") {
      return variant.customName?.trim() || ""
    }

    return variantValue
  }

  const getVariantFinalName = (variant: IVariantConfiguration): string => {
    if (!variant) return ""

    const variantValue = getVariantValue(variant)

    if (variantValue === "custom_type") {
      return variant.customName?.trim().toLowerCase() || ""
    }

    return variantValue.toLowerCase()
  }

  const getMinimumValuesRequired = (index: number): number => {
    if (variantConfiguration.value.length === 1 || index === 0) {
      return 2
    }
    return 1
  }

  const isValidPositiveNumber = (value: string): boolean => {
    if (!value || value.trim() === "") return false
    const num = parseFloat(value)
    return !isNaN(num) && isFinite(num) && num > 0
  }

  const isValidNonNegativeNumber = (value: string): boolean => {
    if (!value || value.trim() === "") return false
    const num = parseFloat(value)
    return !isNaN(num) && isFinite(num) && num >= 0
  }

  const isValidNonNegativeInteger = (value: string): boolean => {
    if (!value || value.trim() === "") return false
    const num = Number(value)
    return Number.isInteger(num) && num >= 0
  }

  const buildProductDetailsValidation = (): ICurrentProductStepValidation => {
    const errors = EMPTY_PRODUCT_DETAILS_ERRORS()
    let firstErrorTarget: string | undefined

    if (!form.name.trim()) {
      errors.name = "Enter a product name."
      firstErrorTarget = "product_name"
    }

    if (!form.category) {
      errors.category = "Select a product category."
      firstErrorTarget ??= "product_category"
    }

    return {
      valid: !errors.name && !errors.category,
      firstErrorTarget,
      productDetailsErrors: errors,
      variantConfigurationErrors: EMPTY_VARIANT_CONFIGURATION_ERRORS(
        variantConfiguration.value.length,
      ),
      inventoryErrors: EMPTY_INVENTORY_ERRORS(variants.value.length),
    }
  }

  const buildVariantConfigurationValidation = (): ICurrentProductStepValidation => {
    const errors = EMPTY_VARIANT_CONFIGURATION_ERRORS(variantConfiguration.value.length)
    let firstErrorTarget: string | undefined

    variantConfiguration.value.forEach((variant, index) => {
      const variantValue = getVariantValue(variant)
      const displayName = getVariantDisplayName(variant)
      const minimumRequired = getMinimumValuesRequired(index)

      if (!variantValue) {
        errors.variants[index].name = "Select an option type."
        firstErrorTarget ??= `variant-name-${index}`
        return
      }

      if (variantValue === "custom_type" && !variant.customName?.trim()) {
        errors.variants[index].customName = "Enter an option name."
        firstErrorTarget ??= `variant-custom-name-${index}`
      }

      if (displayName && variant.values.length < minimumRequired) {
        const plural = minimumRequired > 1 ? "options" : "option"
        errors.variants[index].values = `Add at least ${minimumRequired} variant ${plural}.`
        firstErrorTarget ??= `variant-values-${index}`
      }
    })

    const names = variantConfiguration.value
      .map((variant) => getVariantFinalName(variant))
      .filter((name) => name && typeof name === "string" && name.trim() !== "")

    const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index)

    if (duplicateNames.length > 0) {
      errors.global =
        "Variant names must be unique. Please choose different names for your variants."

      if (!firstErrorTarget) {
        const duplicateIndex = variantConfiguration.value.findIndex((variant) => {
          const finalName = getVariantFinalName(variant)
          return finalName && duplicateNames.includes(finalName)
        })

        firstErrorTarget =
          duplicateIndex >= 0 ? `variant-name-${duplicateIndex}` : "variant-configuration"
      }
    }

    const hasErrors =
      !!errors.global || errors.variants.some((variant) => Object.values(variant).some(Boolean))

    return {
      valid: !hasErrors,
      firstErrorTarget,
      productDetailsErrors: EMPTY_PRODUCT_DETAILS_ERRORS(),
      variantConfigurationErrors: errors,
      inventoryErrors: EMPTY_INVENTORY_ERRORS(variants.value.length),
    }
  }

  const buildInventoryValidation = (config: {
    requireStock: boolean
    requirePrice: boolean
    requireWeight: boolean
    requireDimensions: boolean
  }): ICurrentProductStepValidation => {
    const errors = EMPTY_INVENTORY_ERRORS(variants.value.length)
    let firstErrorTarget: string | undefined

    const firstVariant = variants.value[0]

    if (config.requireWeight && !isValidPositiveNumber(firstVariant?.weight || "")) {
      errors.weight = "Select a product weight to generate dimensions."
      firstErrorTarget = "product-weight"
    }

    if (config.requireDimensions) {
      const height = firstVariant?.height || ""
      const length = firstVariant?.length || ""
      const width = firstVariant?.width || ""

      if (!isValidPositiveNumber(height)) {
        errors.dimensionFields.height = "Enter a valid height."
        firstErrorTarget ??= "product-dimensions"
      }

      if (!isValidPositiveNumber(length)) {
        errors.dimensionFields.length = "Enter a valid length."
        firstErrorTarget ??= "product-dimensions"
      }

      if (!isValidPositiveNumber(width)) {
        errors.dimensionFields.width = "Enter a valid width."
        firstErrorTarget ??= "product-dimensions"
      }

      if (!height && !length && !width) {
        // All dimensions empty — show group-level error only
        errors.dimensions = "Enter valid product dimensions before continuing."
        errors.dimensionFields = { height: undefined, length: undefined, width: undefined }
      }
    }

    variants.value.forEach((variant, index) => {
      if (config.requireStock && !isValidNonNegativeInteger(variant.opening_stock)) {
        errors.variants[index].opening_stock = "Enter a valid stock quantity."
        firstErrorTarget ??= `variant-opening-stock-${index}`
      }

      if (variant.cost_price && variant.cost_price.trim() !== "") {
        if (!isValidNonNegativeNumber(variant.cost_price)) {
          errors.variants[index].cost_price = "Enter a valid cost price."
          firstErrorTarget ??= `variant-cost-price-${index}`
        }
      }

      if (config.requirePrice && !isValidNonNegativeNumber(variant.price)) {
        errors.variants[index].price = "Enter a valid selling price."
        firstErrorTarget ??= `variant-price-${index}`
      }
    })

    const hasErrors =
      !!errors.weight ||
      !!errors.dimensions ||
      Object.values(errors.dimensionFields).some(Boolean) ||
      errors.variants.some((variant) => Object.values(variant).some(Boolean))

    return {
      valid: !hasErrors,
      firstErrorTarget,
      productDetailsErrors: EMPTY_PRODUCT_DETAILS_ERRORS(),
      variantConfigurationErrors: EMPTY_VARIANT_CONFIGURATION_ERRORS(
        variantConfiguration.value.length,
      ),
      inventoryErrors: errors,
    }
  }

  const currentStepValidation = computed<ICurrentProductStepValidation>(() => {
    if (editMode === "product-details") {
      return buildProductDetailsValidation()
    }

    if (editMode === "variant-details") {
      return buildInventoryValidation({
        requireStock: false,
        requirePrice: true,
        requireWeight: true,
        requireDimensions: true,
      })
    }

    if (editMode === "variants") {
      if (step.value === 1) {
        return buildVariantConfigurationValidation()
      }

      return {
        valid: variants.value.length > 0,
        firstErrorTarget: variants.value.length > 0 ? undefined : "variant-configuration",
        productDetailsErrors: EMPTY_PRODUCT_DETAILS_ERRORS(),
        variantConfigurationErrors: EMPTY_VARIANT_CONFIGURATION_ERRORS(
          variantConfiguration.value.length,
        ),
        inventoryErrors: EMPTY_INVENTORY_ERRORS(variants.value.length),
      }
    }

    if (step.value === 1) {
      return buildProductDetailsValidation()
    }

    if (step.value === 2 && hasVariants.value) {
      return buildVariantConfigurationValidation()
    }

    if ((step.value === 2 && !hasVariants.value) || (step.value === 3 && hasVariants.value)) {
      return buildInventoryValidation({
        requireStock: true,
        requirePrice: true,
        requireWeight: true,
        requireDimensions: true,
      })
    }

    return {
      valid: true,
      firstErrorTarget: undefined,
      productDetailsErrors: EMPTY_PRODUCT_DETAILS_ERRORS(),
      variantConfigurationErrors: EMPTY_VARIANT_CONFIGURATION_ERRORS(
        variantConfiguration.value.length,
      ),
      inventoryErrors: EMPTY_INVENTORY_ERRORS(variants.value.length),
    }
  })

  const canProceed = computed<boolean>(() => currentStepValidation.value.valid)

  const validateAllUIDs = (): boolean => {
    for (const variant of variantConfiguration.value) {
      if (variant.values.length === 0) {
        continue
      }

      for (const value of variant.values) {
        const isObject =
          typeof value === "object" && value !== null && "label" in value && "value" in value
        const hasUID = isObject && value.label !== value.value && value.value !== "custom_type"

        if (!hasUID) {
          console.error("Value missing UID:", value)
          return false
        }
      }
    }

    return true
  }

  return {
    canProceed,
    currentStepValidation,
    validateAllUIDs,
  }
}
