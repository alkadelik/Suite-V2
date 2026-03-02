import type { Page } from "@playwright/test"

const API_BASE_URL = process.env.E2E_API_BASE_URL || "https://bpi.leyyow.com/api/v2"

/**
 * Direct API helper for test data setup and teardown.
 * Extracts auth tokens and store context from the browser's localStorage
 * to make authenticated API calls without going through the UI.
 */
export class ApiHelper {
  constructor(
    private accessToken: string,
    private storeUid: string,
    private locationUid: string,
  ) {}

  /** Create an ApiHelper by reading auth state from the browser page */
  static async fromStorageState(page: Page): Promise<ApiHelper> {
    // Navigate to a page first so localStorage is accessible
    const currentUrl = page.url()
    if (currentUrl === "about:blank") {
      await page.goto("/")
    }

    const authState = await page.evaluate(() => {
      const authRaw = localStorage.getItem("auth")
      const settingsRaw = localStorage.getItem("settings")
      return { auth: authRaw, settings: settingsRaw }
    })

    const auth = authState.auth ? JSON.parse(authState.auth) : null
    const settings = authState.settings ? JSON.parse(authState.settings) : null

    const accessToken = auth?.accessToken || ""
    const storeUid = auth?.user?.store_uid || ""
    const locationUid = settings?.activeLocation?.uid || settings?.activeLocation?.id || ""

    return new ApiHelper(accessToken, storeUid, locationUid)
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.accessToken}`,
    }
    if (this.storeUid) h["X-Store-Id"] = this.storeUid
    if (this.locationUid) h["X-Location-Id"] = this.locationUid
    return h
  }

  private async request(method: string, path: string, body?: unknown) {
    const url = `${API_BASE_URL}${path}`
    const res = await fetch(url, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`API ${method} ${path} failed (${res.status}): ${text}`)
    }
    const contentType = res.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      return res.json()
    }
    return null
  }

  // ─── Products ─────────────────────────────────────────

  async createProduct(data: {
    name: string
    category?: string
    is_active?: boolean
    is_variable?: boolean
    variants?: Array<{
      sku: string
      price: string | number
      opening_stock?: number
      is_active?: boolean
    }>
  }) {
    return this.request("POST", "/inventory/products/", {
      description: "",
      story: "",
      brand: "",
      is_active: true,
      is_variable: false,
      requires_approval: false,
      variants: [
        {
          sku: `TEST-${Date.now()}`,
          price: "1000",
          opening_stock: 10,
          is_active: true,
        },
      ],
      ...data,
    })
  }

  async deleteProduct(uid: string) {
    return this.request("DELETE", `/inventory/products/${uid}/`)
  }

  // ─── Customers ────────────────────────────────────────

  async createCustomer(data: {
    first_name: string
    last_name: string
    phone?: string
    email?: string
  }) {
    return this.request("POST", "/customers/", data)
  }

  async deleteCustomer(uid: string) {
    return this.request("DELETE", `/customers/${uid}/`)
  }

  // ─── Orders ───────────────────────────────────────────

  async deleteOrder(uid: string) {
    return this.request("DELETE", `/orders/${uid}/`)
  }
}
