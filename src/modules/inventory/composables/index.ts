/**
 * Product Form Composables
 *
 * Centralized exports for all product form composables.
 * These composables provide reusable logic for ProductFormDrawer and ProductEditDrawer.
 */

export { useProductFormState } from "./useProductFormState"
export type { IProductForm, IVariantConfiguration } from "./useProductFormState"

export { useVariantConfiguration } from "./useVariantConfiguration"

export { useVariantValidation } from "./useVariantValidation"

export { useVariantProcessing } from "./useVariantProcessing"

export { useProductDrawerUtilities } from "./useProductDrawerUtilities"
