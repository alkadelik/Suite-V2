import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import Chip from "@components/Chip.vue"

describe("Chip", () => {
  it("renders the label", () => {
    const wrapper = mount(Chip, { props: { label: "Active" } })
    expect(wrapper.text()).toContain("Active")
  })

  it("applies outlined color classes by default", () => {
    const wrapper = mount(Chip, { props: { label: "Failed", color: "error" } })
    expect(wrapper.classes()).toContain("bg-red-50")
    expect(wrapper.classes()).toContain("text-red-700")
  })

  it("applies filled color classes", () => {
    const wrapper = mount(Chip, {
      props: { label: "Done", color: "success", variant: "filled" },
    })
    expect(wrapper.classes()).toContain("bg-green-600")
    expect(wrapper.classes()).toContain("text-white")
  })

  it("shows a dot instead of an icon when showDot is set", () => {
    const wrapper = mount(Chip, {
      props: { label: "Pending", showDot: true, icon: "check-circle" },
    })
    expect(wrapper.find("svg").exists()).toBe(false)
    expect(wrapper.find("div.rounded-full").exists()).toBe(true)
  })

  it("renders numeric labels", () => {
    const wrapper = mount(Chip, { props: { label: 12 } })
    expect(wrapper.text()).toContain("12")
  })
})
