import test from "node:test"
import assert from "node:assert/strict"

import { shouldAutoEnableManagedDelivery, shouldReturnToRedirect } from "./shipbubble-flow.js"

test("returns true when a non-empty redirect string is present", () => {
  assert.equal(shouldReturnToRedirect("/settings/delivery-options"), true)
})

test("returns false when redirect is missing", () => {
  assert.equal(shouldReturnToRedirect(undefined), false)
})

test("returns false when redirect is blank", () => {
  assert.equal(shouldReturnToRedirect("   "), false)
})

test("auto-enables managed delivery from onboarding without a redirect", () => {
  assert.equal(
    shouldAutoEnableManagedDelivery({
      pathname: "/onboarding",
      redirect: undefined,
    }),
    true,
  )
})

test("does not auto-enable managed delivery when returning to settings", () => {
  assert.equal(
    shouldAutoEnableManagedDelivery({
      pathname: "/onboarding",
      redirect: "/settings/delivery-options",
    }),
    false,
  )
})

test("does not auto-enable managed delivery from the settings page", () => {
  assert.equal(
    shouldAutoEnableManagedDelivery({
      pathname: "/settings/delivery-options",
      redirect: undefined,
    }),
    false,
  )
})
