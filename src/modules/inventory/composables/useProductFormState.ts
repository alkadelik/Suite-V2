import { ref, reactive, watch, onScopeDispose } from "vue"
import type { IProductVariant } from "../types"

/**
 * Product Form State Interface
 * Represents the complete form state for product creation/editing
 */
export interface IProductForm {
  name: string
  description: string
  category: { label: string; value: string } | null
  images: Array<File | string | null>
  story: string
  brand: string
  requires_approval: boolean
}

/**
 * Variant Configuration Interface
 * Represents a single variant type with its values
 */
export interface IVariantConfiguration {
  name: Record<string, unknown> | string | null
  customName: string
  values: { label: string; value: string }[]
}

/**
 * Composable for managing product form state
 *
 * Architectural decisions:
 * - Instance-scoped state: each call creates isolated state
 * - Reactive state with explicit typing for type safety
 * - Automatic variant initialization based on hasVariants flag
 * - Proper cleanup on scope disposal
 *
 * @returns Form state, variants, configuration, and control methods
 */
export function useProductFormState() {
  // Form state - reactive for nested property updates (instance-scoped)
  const form = reactive<IProductForm>({
    name: "",
    description: "",
    category: null,
    images: [],
    story: "",
    brand: "",
    requires_approval: false,
  })

  // Variant state (instance-scoped)
  const hasVariants = ref<boolean>(false)
  const variants = ref<IProductVariant[]>([])
  const variantConfiguration = ref<IVariantConfiguration[]>([
    {
      name: null,
      customName: "",
      values: [],
    },
  ])

  /**
   * Build a single non-variant default row. Kept as a factory so the toggle
   * watcher (and any reset) share exactly one definition.
   */
  const createDefaultVariant = (): IProductVariant => ({
    name: form.name || "Default",
    sku: "",
    price: "",
    promo_price: "",
    promo_expiry: "",
    cost_price: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    reorder_point: "",
    max_stock: "",
    opening_stock: "",
    is_active: true,
    is_default: true,
    batch_number: "",
    expiry_date: "",
    attributes: [],
  })

  /**
   * Keep `variants` consistent with the hasVariants toggle.
   * Prevents empty variant state that would fail validation, and — critically —
   * discards leftover multi-variant combinations when the user turns the switch
   * back OFF after having configured variants (otherwise the inventory/pricing
   * step renders those stale combinations instead of a single default row).
   */
  const stopVariantsWatcher = watch(hasVariants, (newValue) => {
    const isSingleDefaultVariant =
      variants.value.length === 1 && variants.value[0].attributes.length === 0

    if (!newValue) {
      // Simple (no-variant) product: ensure exactly one default row. Reset when
      // the array is empty OR still holds generated multi-variant combinations,
      // but preserve an already-clean single default so a user doesn't lose
      // pricing they already entered.
      if (!isSingleDefaultVariant) {
        variants.value = [createDefaultVariant()]
      }
    } else if (isSingleDefaultVariant) {
      // Switching to variants mode: drop the placeholder single default so the
      // generated combinations start clean.
      variants.value = []
    }
  })

  // Cleanup when the component scope is disposed
  onScopeDispose(() => {
    stopVariantsWatcher()
    // Reset state to prevent memory leaks and stale data
    Object.assign(form, {
      name: "",
      description: "",
      category: null,
      images: [],
      story: "",
      brand: "",
      requires_approval: false,
    })
    hasVariants.value = false
    variants.value = []
    variantConfiguration.value = []
  })

  /**
   * Reset all form state to initial values
   * Used when drawer closes or after successful submission
   */
  const resetFormState = (): void => {
    Object.assign(form, {
      name: "",
      description: "",
      category: null,
      images: [],
      story: "",
      brand: "",
      requires_approval: false,
    })

    hasVariants.value = false
    variants.value = []
    variantConfiguration.value = [
      {
        name: null,
        customName: "",
        values: [],
      },
    ]
  }

  /**
   * Populate form with existing product data
   * Used in edit mode to load current values
   */
  const populateFormState = (data: {
    name?: string
    description?: string
    story?: string
    brand?: string
    requires_approval?: boolean
    category?: { label: string; value: string } | null
    images?: Array<File | string | null>
    hasVariants?: boolean
    variants?: IProductVariant[]
    variantConfiguration?: IVariantConfiguration[]
  }): void => {
    if (data.name !== undefined) form.name = data.name
    if (data.description !== undefined) form.description = data.description
    if (data.story !== undefined) form.story = data.story
    if (data.brand !== undefined) form.brand = data.brand
    if (data.requires_approval !== undefined) form.requires_approval = data.requires_approval
    if (data.category !== undefined) form.category = data.category
    if (data.images !== undefined) form.images = data.images
    // Set variants before hasVariants to prevent watcher from clearing variants
    if (data.variants !== undefined) variants.value = data.variants
    if (data.variantConfiguration !== undefined)
      variantConfiguration.value = data.variantConfiguration
    if (data.hasVariants !== undefined) hasVariants.value = data.hasVariants
  }

  return {
    // State
    form,
    hasVariants,
    variants,
    variantConfiguration,

    // Methods
    resetFormState,
    populateFormState,
  }
}
