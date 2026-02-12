import { defineConfig, devices } from "@playwright/test"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const STORAGE_STATE = path.resolve(__dirname, ".auth/user.json")

export default defineConfig({
  testDir: path.resolve(__dirname, "tests"),
  outputDir: path.resolve(__dirname, "test-results"),

  timeout: 30_000,
  expect: { timeout: 10_000 },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: process.env.CI
    ? [["github"], ["html", { outputFolder: path.resolve(__dirname, "playwright-report") }]]
    : [["html", { outputFolder: path.resolve(__dirname, "playwright-report"), open: "never" }]],

  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // Setup project: authenticates and saves storageState
    {
      name: "setup",
      testDir: path.resolve(__dirname),
      testMatch: /global-setup\.ts/,
    },

    // Main tests: run authenticated against Chromium (excludes auth tests)
    {
      name: "chromium",
      testIgnore: /auth\/.+\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE,
      },
      dependencies: ["setup"],
    },

    // Unauthenticated tests (login, guards): no storageState
    {
      name: "unauthenticated",
      testMatch: /auth\/.+\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: { cookies: [], origins: [] },
      },
    },
  ],
})
