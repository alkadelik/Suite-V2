import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import Drawer from "@components/Drawer.vue"

describe("Drawer", () => {
  it("renders title and body content", () => {
    const wrapper = mount(Drawer, {
      props: { open: true, title: "Create Shipment" },
      slots: { default: "<p>Drawer body</p>" },
    })
    expect(wrapper.text()).toContain("Create Shipment")
    expect(wrapper.text()).toContain("Drawer body")
  })

  it("is translated off-screen when closed", () => {
    const wrapper = mount(Drawer, { props: { open: false } })
    expect(wrapper.find("aside").classes()).toContain("translate-x-full")
  })

  it("emits close when the backdrop is clicked", async () => {
    const wrapper = mount(Drawer, { props: { open: true } })
    await wrapper.find("div").trigger("click") // backdrop is the first element
    expect(wrapper.emitted("close")).toHaveLength(1)
  })

  it("emits close when the header close button is clicked", async () => {
    const wrapper = mount(Drawer, { props: { open: true, title: "Details" } })
    await wrapper.find("button").trigger("click")
    expect(wrapper.emitted("close")).toHaveLength(1)
  })

  it("renders the footer slot when provided", () => {
    const wrapper = mount(Drawer, {
      props: { open: true },
      slots: { footer: "<button>Submit</button>" },
    })
    expect(wrapper.text()).toContain("Submit")
  })
})
