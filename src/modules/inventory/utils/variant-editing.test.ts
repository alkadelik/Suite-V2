import assert from "node:assert/strict"
import test from "node:test"
import {
  SINGLE_VARIANT_KEY,
  filterVariantsByAttributeKeys,
  getNewVariantAttributeKeys,
  getVariantAttributeKey,
  shouldUseSingleVariantLayout,
} from "./variant-editing.js"

const sizeRed = [
  { attribute: "size", value: "small" },
  { attribute: "color", value: "red" },
]

const redSize = [
  { attribute: "color", value: "red" },
  { attribute: "size", value: "small" },
]

test("variant keys are stable regardless of attribute order", () => {
  assert.equal(getVariantAttributeKey(sizeRed), getVariantAttributeKey(redSize))
})

test("variants without attributes use the single variant key", () => {
  assert.equal(getVariantAttributeKey([]), SINGLE_VARIANT_KEY)
  assert.equal(getVariantAttributeKey(null), SINGLE_VARIANT_KEY)
})

test("new variant keys exclude existing attribute combinations", () => {
  const originalKeys = [getVariantAttributeKey(sizeRed)]
  const variants = [
    { name: "Existing", attributes: redSize },
    { name: "New", attributes: [{ attribute: "size", value: "large" }] },
  ]

  assert.deepEqual(getNewVariantAttributeKeys(variants, originalKeys), ["size:large"])
})

test("filtering targets only selected variant keys when provided", () => {
  const variants = [
    { name: "Existing", attributes: sizeRed },
    { name: "New", attributes: [{ attribute: "size", value: "large" }] },
  ]

  assert.deepEqual(filterVariantsByAttributeKeys(variants, ["size:large"]), [variants[1]])
})

test("filtering returns all variants when no target keys are provided", () => {
  const variants = [
    { name: "Existing", attributes: sizeRed },
    { name: "New", attributes: [{ attribute: "size", value: "large" }] },
  ]

  assert.deepEqual(filterVariantsByAttributeKeys(variants, []), variants)
})

test("single variant layout can be disabled for one variant in a variant-product flow", () => {
  assert.equal(shouldUseSingleVariantLayout({ variantCount: 1, forceVariantLayout: false }), true)
  assert.equal(shouldUseSingleVariantLayout({ variantCount: 1, forceVariantLayout: true }), false)
  assert.equal(shouldUseSingleVariantLayout({ variantCount: 2, forceVariantLayout: false }), false)
})
