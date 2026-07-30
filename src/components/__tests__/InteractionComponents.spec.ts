import { defineComponent } from "vue"
import { mount, shallowMount } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"

import ConfirmationModal from "@components/ConfirmationModal.vue"
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import ListFilterDrawer from "@components/ListFilterDrawer.vue"
import MessageModal from "@components/MessageModal.vue"
import ProductSelectionItem from "@components/ProductSelectionItem.vue"
import StepperWizard from "@components/StepperWizard.vue"
import SuccessModal from "@components/SuccessModal.vue"
import Tabs from "@components/Tabs.vue"
import WhatsNewModal from "@components/WhatsNewModal.vue"

const IconStub = defineComponent({
  name: "Icon",
  props: { name: String },
  template: '<span class="icon-stub" :data-name="name" />',
})

const AppButtonStub = defineComponent({
  name: "AppButton",
  props: { label: String, loading: Boolean },
  emits: ["click"],
  template:
    '<button class="app-button-stub" :data-loading="loading" @click="$emit(\'click\')">{{ label }}</button>',
})

const MessageModalStub = defineComponent({
  name: "MessageModal",
  props: { open: Boolean },
  emits: ["close"],
  template:
    '<div v-if="open" class="message-modal-stub"><button class="close-modal" @click="$emit(\'close\')">close</button><slot name="header"/><slot/><slot name="footer"/></div>',
})

const DrawerStub = defineComponent({
  name: "Drawer",
  props: { open: Boolean, position: String },
  emits: ["close"],
  template:
    '<div v-if="open" class="drawer-stub" :data-position="position"><slot/><slot name="footer"/></div>',
})

const DropdownStub = defineComponent({
  name: "Dropdown",
  props: { placement: String },
  emits: ["hide"],
  data: () => ({ shown: false }),
  methods: {
    toggle() {
      this.shown = !this.shown
    },
    hide() {
      this.shown = false
      this.$emit("hide")
    },
  },
  template:
    '<div class="dropdown-stub"><slot :toggle="toggle" :shown="shown"/><slot name="popper" :hide="hide"/></div>',
})

describe("interactive reusable components", () => {
  afterEach(() => {
    document.body.style.overflow = ""
  })

  it("ConfirmationModal derives variant content and emits cancel/confirm", async () => {
    const wrapper = shallowMount(ConfirmationModal, {
      props: { modelValue: true, header: "Delete product", variant: "error", loading: true },
      global: {
        stubs: { MessageModal: MessageModalStub, AppButton: AppButtonStub, Icon: IconStub },
      },
    })
    expect(wrapper.text()).toContain("Delete product")
    expect(wrapper.text()).toContain("This action cannot be reversed.")
    const buttons = wrapper.findAllComponents(AppButtonStub)
    expect(buttons.map((button) => button.props("label"))).toEqual(["Cancel", "Delete"])
    expect(buttons[1].props("loading")).toBe(true)
    await buttons[0].trigger("click")
    await buttons[1].trigger("click")
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]])
    expect(wrapper.emitted("confirm")).toHaveLength(1)

    await wrapper.findComponent(MessageModalStub).find(".close-modal").trigger("click")
    expect(wrapper.emitted("update:modelValue")).toEqual([[false], [false]])
  })

  it("DeleteConfirmationModal supports custom content and emits delete", async () => {
    const wrapper = shallowMount(DeleteConfirmationModal, {
      props: {
        modelValue: true,
        header: "Remove item",
        loading: false,
        actionLabel: "Remove",
      },
      slots: { paragraph: "Custom paragraph", warning: "Custom warning" },
      global: {
        stubs: { MessageModal: MessageModalStub, AppButton: AppButtonStub, Icon: IconStub },
      },
    })
    expect(wrapper.text()).toContain("Custom paragraph")
    expect(wrapper.text()).toContain("Custom warning")
    const buttons = wrapper.findAllComponents(AppButtonStub)
    expect(buttons[1].props("label")).toBe("Remove")
    await buttons[1].trigger("click")
    expect(wrapper.emitted("delete")).toHaveLength(1)
  })

  it("MessageModal handles variants, custom widths, overlay close, and scroll locking", async () => {
    const wrapper = shallowMount(MessageModal, {
      props: { open: true, title: "Details", variant: "bottom-nav", maxWidth: "520px" },
      slots: { default: "Body", footer: "Footer" },
      global: { stubs: { Icon: IconStub, Transition: false } },
    })
    expect(document.body.style.overflow).toBe("hidden")
    expect(wrapper.text()).toContain("Details")
    expect(wrapper.text()).toContain("Body")
    expect(wrapper.text()).toContain("Footer")
    expect(wrapper.find(".fixed").classes()).toContain("items-end")
    expect(wrapper.find(".relative.bg-white").classes()).toContain("max-w-[520px]")
    await wrapper.find(".fixed").trigger("click")
    expect(wrapper.emitted("close")).toHaveLength(1)
    await wrapper.setProps({ open: false })
    expect(document.body.style.overflow).toBe("")
  })

  it("SuccessModal closes from its header, CTA, or underlying modal", async () => {
    const wrapper = shallowMount(SuccessModal, {
      props: { modelValue: true, title: "Saved", subtitle: "Changes applied" },
      global: {
        stubs: { MessageModal: MessageModalStub, AppButton: AppButtonStub, Icon: IconStub },
      },
    })
    expect(wrapper.text()).toContain("Saved")
    expect(wrapper.text()).toContain("Changes applied")
    expect(wrapper.findComponent(AppButtonStub).props("label")).toBe("Awesome!")
    await wrapper.findComponent(AppButtonStub).trigger("click")
    await wrapper.find("button:not(.app-button-stub)").trigger("click")
    await wrapper.findComponent(MessageModalStub).find(".close-modal").trigger("click")
    expect(wrapper.emitted("update:modelValue")).toEqual([[false], [false], [false]])
  })

  it("WhatsNewModal presents both walkthroughs and acknowledges each desktop item in order", async () => {
    const wrapper = shallowMount(WhatsNewModal, {
      props: { open: true },
      global: { stubs: { Teleport: true, Transition: false, Icon: IconStub } },
    })
    expect(wrapper.text()).toContain("What’s new on Leyyow")
    expect(wrapper.text()).toContain("Pickup Times")
    expect(wrapper.text()).toContain("Discounts & Coupons")
    const showButtons = wrapper.findAll("button").filter((button) => button.text() === "Show Me")
    await showButtons[0].trigger("click")
    expect(wrapper.emitted("show")).toEqual([["pickup-times"]])
    const gotIt = wrapper.find("[data-whats-new-desktop-got-it]")
    await gotIt.trigger("click")
    expect(wrapper.emitted("close")).toBeUndefined()
    expect(wrapper.find("h2").text()).toBe("Create discounts in minutes")
    await gotIt.trigger("click")
    expect(wrapper.emitted("close")).toHaveLength(1)
  })

  it("keeps the mobile intro outside its two-feature carousel and supports pointer swipes", async () => {
    const wrapper = shallowMount(WhatsNewModal, {
      props: { open: true },
      global: { stubs: { Teleport: true, Transition: false, Icon: IconStub } },
    })

    expect(wrapper.find("[data-mobile-intro]").exists()).toBe(true)
    expect(wrapper.findAll('[aria-label^="Show "]')).toHaveLength(0)
    expect(wrapper.findComponent(IconStub).attributes("data-name")).toBe("swipe-gesture")

    const swipeRegion = wrapper.find("[data-mobile-swipe-region]")
    await swipeRegion.trigger("pointerdown", {
      pointerId: 1,
      pointerType: "touch",
      clientX: 280,
      clientY: 300,
    })
    await swipeRegion.trigger("pointerup", {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120,
      clientY: 304,
    })

    expect(wrapper.find("[data-mobile-feature]").exists()).toBe(true)
    expect(wrapper.findAll('[aria-label^="Show "]')).toHaveLength(2)
    expect(wrapper.find("[data-mobile-controls]").classes()).toContain("shrink-0")
    expect(wrapper.find("[data-mobile-feature] h2").text()).toBe(
      "Pickup times just got more flexible",
    )

    await swipeRegion.trigger("pointerdown", {
      pointerId: 2,
      pointerType: "mouse",
      button: 0,
      clientX: 280,
      clientY: 300,
    })
    await swipeRegion.trigger("pointerup", {
      pointerId: 2,
      pointerType: "mouse",
      button: 0,
      clientX: 120,
      clientY: 304,
    })
    expect(wrapper.find("[data-mobile-feature] h2").text()).toBe("Create discounts in minutes")
  })

  it("can reopen mobile directly on the completed feature screen", () => {
    const wrapper = shallowMount(WhatsNewModal, {
      props: { open: true, initialFeature: "discounts", mobileStartView: "features" },
      global: { stubs: { Teleport: true, Transition: false, Icon: IconStub } },
    })

    expect(wrapper.find("[data-mobile-intro]").exists()).toBe(false)
    expect(wrapper.find("[data-mobile-feature] h2").text()).toBe("Create discounts in minutes")
    expect(wrapper.findAll('[aria-label^="Show "]')).toHaveLength(2)
  })

  it("Tabs normalizes string tabs, renders counts, switches slots, and emits selection", async () => {
    const wrapper = mount(Tabs, {
      props: {
        tabs: ["All Products", { title: "Low stock", key: "low", count: 2 }],
        modelValue: "all_products",
        variant: "pills",
      },
      slots: { all_products: () => "All content", low: () => "Low content" },
      global: { stubs: { Transition: { template: "<div><slot /></div>" } } },
    })
    expect(wrapper.text()).toContain("All Products")
    expect(wrapper.text()).toContain("Low stock")
    expect(wrapper.text()).toContain("2")
    expect(wrapper.text()).toContain("All content")
    await wrapper.findAll("button")[1].trigger("click")
    expect(wrapper.emitted("update:modelValue")).toEqual([["low"]])
    const lowTab = mount(Tabs, {
      props: { tabs: ["All Products", { title: "Low stock", key: "low" }], modelValue: "low" },
      slots: { all_products: () => "All content", low: () => "Low content" },
      global: { stubs: { Transition: { template: "<div><slot /></div>" } } },
    })
    expect(lowTab.text()).toContain("Low content")
  })

  it("StepperWizard exposes bounded navigation and progress through its slot", async () => {
    const wrapper = mount(StepperWizard, {
      props: { modelValue: 0, steps: ["Details", "Pricing", "Review"], showLabels: true },
      slots: {
        default: `<template #default="{ step, onPrev, onNext }">
          <span class="current-step">{{ step }}</span>
          <button class="previous" @click="onPrev">Previous</button>
          <button class="next" @click="onNext">Next</button>
        </template>`,
      },
    })
    expect(wrapper.find(".current-step").text()).toBe("0")
    expect(wrapper.find("[style]").attributes("style")).toContain("33.333")
    await wrapper.find(".previous").trigger("click")
    expect(wrapper.emitted("update:modelValue")).toBeUndefined()
    await wrapper.find(".next").trigger("click")
    expect(wrapper.emitted("update:modelValue")).toEqual([[1]])
    await (
      wrapper as unknown as { setProps: (props: { modelValue: number }) => Promise<void> }
    ).setProps({ modelValue: 2 })
    await wrapper.find(".next").trigger("click")
    expect(wrapper.emitted("update:modelValue")).toEqual([[1]])
  })

  it("ProductSelectionItem supports grid/list presentation, slots, and disabled clicks", async () => {
    const wrapper = shallowMount(ProductSelectionItem, {
      props: { name: "Canvas Bag", selected: true },
      slots: { primaryInfo: "₦5,000", secondaryInfo: "4 in stock" },
      global: { stubs: { Icon: IconStub } },
    })
    expect(wrapper.text()).toContain("Canvas Bag")
    expect(wrapper.text()).toContain("₦5,000")
    expect(wrapper.find('input[type="checkbox"]').attributes()).toHaveProperty("checked")
    await wrapper.find("div.rounded-xl").trigger("click")
    expect(wrapper.emitted("click")).toHaveLength(1)

    await wrapper.setProps({ disabled: true, viewMode: "list", imageUrl: "/bag.png" })
    expect(wrapper.find("img").attributes("alt")).toBe("Canvas Bag")
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false)
    await wrapper.find("div.flex.items-center").trigger("click")
    expect(wrapper.emitted("click")).toHaveLength(1)
  })

  it("DropdownMenu emits selection, respects disabled entries, and closes sync actions", async () => {
    const action = vi.fn()
    const items = [
      { id: "edit", label: "Edit", icon: "edit", action },
      { id: "disabled", label: "Disabled", disabled: true },
      { divider: true },
    ]
    const wrapper = mount(DropdownMenu, {
      props: { items },
      global: {
        stubs: { Dropdown: DropdownStub, VDropdown: DropdownStub, Icon: IconStub },
      },
    })
    const menuButtons = wrapper.findAll("button").slice(1)
    expect(menuButtons[0].text()).toContain("Edit")
    expect(menuButtons[1].attributes()).toHaveProperty("disabled")
    await menuButtons[0].trigger("click")
    expect(wrapper.emitted("select")?.[0]?.[0]).toMatchObject({ id: "edit" })
    expect(wrapper.emitted("select")?.[0]?.[1]).toBe(0)
    expect(action).toHaveBeenCalledOnce()
    expect(wrapper.findComponent(DropdownStub).emitted("hide")).toHaveLength(1)
  })

  it("ListFilterDrawer collects radio/date filters and supports apply and clear", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 500 })
    const wrapper = shallowMount(ListFilterDrawer, {
      props: {
        modelValue: true,
        filterGroups: [
          {
            key: "status",
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
          {
            key: "dates",
            label: "Dates",
            type: "date-range",
            startKey: "start",
            endKey: "end",
          },
        ],
      },
      global: {
        stubs: { Drawer: DrawerStub, AppButton: AppButtonStub, Chip: true },
      },
    })
    expect(wrapper.findComponent(DrawerStub).props("position")).toBe("bottom")
    await wrapper.find('input[type="radio"]').setValue()
    const dates = wrapper.findAll('input[type="date"]')
    await dates[0].setValue("2026-07-01")
    await dates[1].setValue("2026-07-31")
    const buttons = wrapper.findAllComponents(AppButtonStub)
    await buttons[1].trigger("click")
    expect(wrapper.emitted("apply")?.[0]?.[0]).toEqual({
      status: "active",
      start: "2026-07-01",
      end: "2026-07-31",
    })
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]])

    await buttons[0].trigger("click")
    expect(wrapper.emitted("apply")?.[1]?.[0]).toEqual({})
  })
})
