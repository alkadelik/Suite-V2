import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import { createPinia } from "pinia"
import TextField from "@components/form/TextField.vue"
import { useSettingsStore } from "@modules/settings/store"
import type { IStoreDetails } from "@modules/settings/types"

// TextField reads the store currency for the ₦/$ prefix, so every mount gets a fresh Pinia
const mountField = (props: Record<string, unknown> = {}, currency?: string) => {
  const pinia = createPinia()
  if (currency) {
    useSettingsStore(pinia).storeDetails = { currency } as IStoreDetails
  }
  return mount(TextField, { props, global: { plugins: [pinia] } })
}

describe("TextField", () => {
  it("renders label with required asterisk", () => {
    const wrapper = mountField({ label: "Price", required: true })
    expect(wrapper.find("label").text()).toContain("Price")
    expect(wrapper.find("label").text()).toContain("*")
  })

  it("emits update:modelValue on input", async () => {
    const wrapper = mountField({ label: "Name" })
    await wrapper.find("input").setValue("Adanna")
    expect(wrapper.emitted("update:modelValue")).toEqual([["Adanna"]])
  })

  it("shows the error message capitalized", () => {
    const wrapper = mountField({ label: "Email", error: "email is required" })
    expect(wrapper.text()).toContain("Email is required")
  })

  describe("type=number sanitization", () => {
    it("strips non-numeric characters", async () => {
      const wrapper = mountField({ type: "number" })
      const input = wrapper.find("input")
      await input.setValue("12ab3")
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["123"])
    })

    it("collapses multiple decimal points into one", async () => {
      const wrapper = mountField({ type: "number" })
      await wrapper.find("input").setValue("1.2.3")
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["1.23"])
    })

    it("keeps a leading minus sign", async () => {
      const wrapper = mountField({ type: "number" })
      await wrapper.find("input").setValue("-50")
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["-50"])
    })

    it("removes a minus sign that is not at the start", async () => {
      const wrapper = mountField({ type: "number" })
      await wrapper.find("input").setValue("5-5")
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["55"])
    })

    it("sanitizes pasted text containing commas", async () => {
      const wrapper = mountField({ type: "number" })
      const input = wrapper.find("input")
      await input.trigger("paste", {
        clipboardData: { getData: () => "1,234" },
      })
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["1234"])
      expect(input.element.value).toBe("1234")
    })
  })

  describe("format=number (comma display, raw emit)", () => {
    it("renders as a text input so commas are allowed", () => {
      const wrapper = mountField({ type: "number", format: "number" })
      expect(wrapper.find("input").attributes("type")).toBe("text")
    })

    it("displays modelValue with thousand separators", () => {
      const wrapper = mountField({
        type: "number",
        format: "number",
        modelValue: "1234567",
      })
      expect(wrapper.find("input").element.value).toBe("1,234,567")
    })

    it("preserves decimals when formatting", () => {
      const wrapper = mountField({
        type: "number",
        format: "number",
        modelValue: "1234567.89",
      })
      expect(wrapper.find("input").element.value).toBe("1,234,567.89")
    })

    it("does not add separators to values under 1,000", () => {
      const wrapper = mountField({
        type: "number",
        format: "number",
        modelValue: "999.5",
      })
      expect(wrapper.find("input").element.value).toBe("999.5")
    })

    it("emits the raw value while displaying commas as the user types", async () => {
      const wrapper = mountField({ type: "number", format: "number" })
      const input = wrapper.find("input")
      await input.setValue("1234567.89")
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["1234567.89"])
      expect(input.element.value).toBe("1,234,567.89")
    })

    it("strips commas and reformats when comma-separated text is pasted", async () => {
      const wrapper = mountField({ type: "number", format: "number" })
      const input = wrapper.find("input")
      await input.trigger("paste", {
        clipboardData: { getData: () => "1,234,567.89" },
      })
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["1234567.89"])
      expect(input.element.value).toBe("1,234,567.89")
    })

    it("sanitizes garbage typed into a formatted field", async () => {
      const wrapper = mountField({ type: "number", format: "number" })
      const input = wrapper.find("input")
      await input.setValue("12a,b34.5.6")
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["1234.56"])
      expect(input.element.value).toBe("1,234.56")
    })
  })

  describe("format=currency", () => {
    it("shows the naira symbol by default", () => {
      const wrapper = mountField({ type: "number", format: "currency" })
      expect(wrapper.text()).toContain("₦")
    })

    it("shows the symbol for the store currency", () => {
      const wrapper = mountField({ type: "number", format: "currency" }, "USD")
      expect(wrapper.text()).toContain("$")
    })

    it("falls back to the currency code when there is no symbol", () => {
      const wrapper = mountField({ type: "number", format: "currency" }, "EUR")
      expect(wrapper.text()).toContain("EUR")
    })

    it("formats amounts with commas and emits raw", async () => {
      const wrapper = mountField({ type: "number", format: "currency" })
      const input = wrapper.find("input")
      await input.setValue("888000")
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["888000"])
      expect(input.element.value).toBe("888,000")
    })
  })
})
