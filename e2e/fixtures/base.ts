import { test as base, expect, type Page } from "@playwright/test"
import { ApiHelper } from "../helpers/api"

/**
 * Extended test fixtures for Leyyow Suite E2E tests.
 *
 * - `page`: standard authenticated page (storageState loaded by project config)
 * - `apiHelper`: direct API client for test data setup/teardown
 */
type Fixtures = {
  apiHelper: ApiHelper
}

export const test = base.extend<Fixtures>({
  apiHelper: async ({ page }, use) => {
    const helper = await ApiHelper.fromStorageState(page)
    await use(helper)
  },
})

export { expect }
