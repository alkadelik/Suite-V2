import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import AppButton from "@components/AppButton.vue"

describe("AppButton", () => {
  it("renders the label", () => {
    const wrapper = mount(AppButton, { props: { label: "Save" } })
    expect(wrapper.text()).toContain("Save")
  })

  it("emits click when pressed", async () => {
    const wrapper = mount(AppButton, { props: { label: "Save" } })
    await wrapper.trigger("click")
    expect(wrapper.emitted("click")).toHaveLength(1)
  })

  it("does not emit click when disabled", async () => {
    const wrapper = mount(AppButton, { props: { label: "Save", disabled: true } })
    await wrapper.trigger("click")
    expect(wrapper.emitted("click")).toBeUndefined()
    expect(wrapper.attributes("disabled")).toBeDefined()
  })

  it("shows loading text and blocks clicks while loading", async () => {
    const wrapper = mount(AppButton, {
      props: { label: "Save", loading: true, loadingText: "Saving..." },
    })
    expect(wrapper.text()).toContain("Saving...")
    await wrapper.trigger("click")
    expect(wrapper.emitted("click")).toBeUndefined()
  })

  it("renders a badge when provided", () => {
    const wrapper = mount(AppButton, { props: { label: "Filter", badge: 3 } })
    expect(wrapper.text()).toContain("3")
  })

  it("renders slot content over the label", () => {
    const wrapper = mount(AppButton, {
      props: { label: "Fallback" },
      slots: { default: "Custom content" },
    })
    expect(wrapper.text()).toContain("Custom content")
    expect(wrapper.text()).not.toContain("Fallback")
  })
})
