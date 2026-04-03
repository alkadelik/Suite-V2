import test from "node:test"
import assert from "node:assert/strict"

import { shouldReturnToRedirect } from "./shipbubble-flow.js"

test("returns true when a non-empty redirect string is present", () => {
  assert.equal(shouldReturnToRedirect("/settings/delivery-options"), true)
})

test("returns false when redirect is missing", () => {
  assert.equal(shouldReturnToRedirect(undefined), false)
})

test("returns false when redirect is blank", () => {
  assert.equal(shouldReturnToRedirect("   "), false)
})
