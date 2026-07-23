import { describe, expect, it } from "vitest"
import { ref } from "vue"

import type { IProductVariant } from "../types"
import type { IProductForm } from "./useProductFormState"
import { useVariantValidation } from "./useVariantValidation"

const productForm: IProductForm = {
  name: "Shirt",
  description: "",
  category: { label: "Clothing", value: "clothing" },
  images: [],
  story: "",
  brand: "",
  requires_approval: false,
}

const newVariant = (): IProductVariant => ({
  name: "Large",
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
  is_default: false,
  batch_number: "",
  expiry_date: "",
  attributes: [{ attribute: "size", value: "large" }],
})

describe("manage-variants pricing validation", () => {
  it("requires both cost and selling prices for newly added variants", () => {
    const pricingVariants = ref([newVariant()])
    const { currentStepValidation } = useVariantValidation({
      form: productForm,
      hasVariants: ref(true),
      variantConfiguration: ref([]),
      variants: pricingVariants,
      pricingVariants,
      step: ref(3),
      editMode: "variants",
    })

    expect(currentStepValidation.value.valid).toBe(false)
    expect(currentStepValidation.value.inventoryErrors.variants[0]).toEqual({
      cost_price: "Enter a valid cost price.",
      price: "Enter a valid selling price.",
    })

    pricingVariants.value[0].cost_price = "100"
    pricingVariants.value[0].price = "150"

    expect(currentStepValidation.value.valid).toBe(true)
  })
})
