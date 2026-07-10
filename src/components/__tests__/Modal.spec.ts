import { mount } from "@vue/test-utils"
import { describe, it, expect, afterEach } from "vitest"
import Modal from "@components/Modal.vue"

describe("Modal", () => {
  afterEach(() => {
    document.body.style.overflow = ""
  })

  it("renders nothing when closed", () => {
    const wrapper = mount(Modal, { props: { open: false } })
    expect(wrapper.find("div").exists()).toBe(false)
  })

  it("renders title and body content when open", () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: "Confirm Action" },
      slots: { default: "<p>Modal body</p>" },
    })
    expect(wrapper.text()).toContain("Confirm Action")
    expect(wrapper.text()).toContain("Modal body")
  })

  it("emits close when the overlay is clicked", async () => {
    const wrapper = mount(Modal, { props: { open: true } })
    await wrapper.find("div.fixed").trigger("click")
    expect(wrapper.emitted("close")).toHaveLength(1)
  })

  it("does not emit close when the modal card is clicked", async () => {
    const wrapper = mount(Modal, { props: { open: true } })
    await wrapper.find("div.bg-white").trigger("click")
    expect(wrapper.emitted("close")).toBeUndefined()
  })

  it("emits close when the header close button is clicked", async () => {
    const wrapper = mount(Modal, { props: { open: true, title: "Details" } })
    await wrapper.find("button").trigger("click")
    expect(wrapper.emitted("close")).toHaveLength(1)
  })

  it("hides the header when showHeader is false", () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: "Hidden", showHeader: false },
    })
    expect(wrapper.text()).not.toContain("Hidden")
    expect(wrapper.find("button").exists()).toBe(false)
  })

  it("renders the footer slot when provided", () => {
    const wrapper = mount(Modal, {
      props: { open: true },
      slots: { footer: "<button>Save</button>" },
    })
    expect(wrapper.text()).toContain("Save")
  })

  it("locks body scroll while open and restores it on unmount", () => {
    const wrapper = mount(Modal, { props: { open: true } })
    expect(document.body.style.overflow).toBe("hidden")
    wrapper.unmount()
    expect(document.body.style.overflow).toBe("")
  })
})
