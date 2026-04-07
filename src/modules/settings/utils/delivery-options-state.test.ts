import test from "node:test"
import assert from "node:assert/strict"

import { syncDeliveryFormState } from "./delivery-options-state.js"

test("keeps an unsaved managed-delivery toggle on after a backend refetch", () => {
  const result = syncDeliveryFormState({
    previousForm: {
      allow_pickup: false,
      delivery_enabled: true,
      manual_delivery_enabled: false,
      express_delivery_enabled: false,
    },
    previousOriginalValues: {
      allow_pickup: false,
      delivery_enabled: false,
      manual_delivery_enabled: false,
      express_delivery_enabled: false,
    },
    previousCurrentDeliveryView: "automatic",
    nextStoreDetails: {
      pickup_location: "",
      delivery_enabled: false,
      manual_delivery_enabled: false,
      express_delivery_enabled: false,
    },
  })

  assert.equal(result.form.delivery_enabled, true)
  assert.equal(result.originalValues.delivery_enabled, false)
  assert.equal(result.currentDeliveryView, "automatic")
})

test("keeps an unsaved manual-delivery toggle on after a backend refetch", () => {
  const result = syncDeliveryFormState({
    previousForm: {
      allow_pickup: false,
      delivery_enabled: false,
      manual_delivery_enabled: true,
      express_delivery_enabled: false,
    },
    previousOriginalValues: {
      allow_pickup: false,
      delivery_enabled: false,
      manual_delivery_enabled: false,
      express_delivery_enabled: false,
    },
    previousCurrentDeliveryView: "manual",
    nextStoreDetails: {
      pickup_location: "",
      delivery_enabled: false,
      manual_delivery_enabled: false,
      express_delivery_enabled: false,
    },
  })

  assert.equal(result.form.manual_delivery_enabled, true)
  assert.equal(result.originalValues.manual_delivery_enabled, false)
  assert.equal(result.currentDeliveryView, "manual")
})

test("preserves a user-switched manual view when backend values have not changed", () => {
  const result = syncDeliveryFormState({
    previousForm: {
      allow_pickup: false,
      delivery_enabled: false,
      manual_delivery_enabled: false,
      express_delivery_enabled: false,
    },
    previousOriginalValues: {
      allow_pickup: false,
      delivery_enabled: false,
      manual_delivery_enabled: false,
      express_delivery_enabled: false,
    },
    previousCurrentDeliveryView: "manual",
    nextStoreDetails: {
      pickup_location: "",
      delivery_enabled: false,
      manual_delivery_enabled: false,
      express_delivery_enabled: false,
    },
  })

  assert.equal(result.currentDeliveryView, "manual")
})
