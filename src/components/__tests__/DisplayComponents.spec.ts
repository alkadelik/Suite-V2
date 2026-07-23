import { defineComponent } from "vue"
import { mount, shallowMount } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"

import AppSection from "@components/AppSection.vue"
import Avatar from "@components/Avatar.vue"
import BackButton from "@components/BackButton.vue"
import Collapsible from "@components/Collapsible.vue"
import Container from "@components/Container.vue"
import EmptyState from "@components/EmptyState.vue"
import Icon from "@components/Icon.vue"
import IconHeader from "@components/IconHeader.vue"
import InfoBox from "@components/InfoBox.vue"
import LoadingIcon from "@components/LoadingIcon.vue"
import PageHeader from "@components/PageHeader.vue"
import ProductAvatar from "@components/ProductAvatar.vue"
import SectionHeader from "@components/SectionHeader.vue"
import StatCard from "@components/StatCard.vue"
import SummaryCards from "@components/SummaryCards.vue"
import WarningBox from "@components/WarningBox.vue"
import ConfigureDeliverySkeleton from "@modules/shared/components/skeletons/ConfigureDeliverySkeleton.vue"
import OnboardingSkeleton from "@modules/shared/components/skeletons/OnboardingSkeleton.vue"

const IconStub = defineComponent({
  name: "Icon",
  props: { name: String },
  emits: ["click"],
  template: '<span class="icon-stub" :data-name="name" @click="$emit(\'click\')" />',
})

const ChipStub = defineComponent({
  name: "Chip",
  props: { label: String },
  template: '<span class="chip-stub">{{ label }}</span>',
})

describe("layout and display components", () => {
  it("AppSection and Container preserve their layout contract and slot content", () => {
    const section = mount(AppSection, {
      props: { background: "bg-white", class: "custom-section" },
      slots: { default: "Section content" },
    })
    expect(section.classes()).toContain("bg-white")
    expect(section.find("div").classes()).toContain("custom-section")
    expect(section.text()).toBe("Section content")

    const container = mount(Container, {
      attrs: { id: "page-container" },
      slots: { default: "Contained content" },
    })
    expect(container.attributes("id")).toBe("page-container")
    expect(container.classes()).toContain("max-w-[1440px]")
    expect(container.text()).toBe("Contained content")
  })

  it("Avatar renders initials, optional details, sizing, and guarded clicks", async () => {
    const wrapper = mount(Avatar, {
      props: {
        name: "Ada Lovelace",
        extraText: "Owner",
        size: 48,
        clickable: true,
        status: "online",
      },
    })
    expect(wrapper.text()).toContain("AL")
    expect(wrapper.text()).toContain("Ada Lovelace")
    expect(wrapper.text()).toContain("Owner")
    expect(wrapper.find("span").attributes("style")).toContain("height: 48px")
    expect(wrapper.find("div.relative").classes()).toContain("after:bg-green-500")
    await wrapper.trigger("click")
    expect(wrapper.emitted("click")).toHaveLength(1)

    await wrapper.setProps({ clickable: false, url: "/avatar.png" })
    await wrapper.trigger("click")
    expect(wrapper.emitted("click")).toHaveLength(1)
    expect(wrapper.find("img").attributes("alt")).toBe("Ada Lovelace")
  })

  it("BackButton navigates to a target or falls back to router history", async () => {
    const push = vi.fn()
    const back = vi.fn()
    const mountButton = (to?: string) =>
      shallowMount(BackButton, {
        props: { to, label: "Return", centerOnMobile: true },
        global: { mocks: { $router: { push, back } }, stubs: { Icon: IconStub } },
      })

    const targeted = mountButton("/inventory")
    expect(targeted.text()).toContain("Return")
    expect(targeted.classes()).toContain("flex")
    await targeted.find("button").trigger("click")
    expect(push).toHaveBeenCalledWith("/inventory")

    await mountButton().find("button").trigger("click")
    expect(back).toHaveBeenCalledOnce()
  })

  it("Collapsible supports uncontrolled and controlled keyboard/click toggles", async () => {
    const uncontrolled = shallowMount(Collapsible, {
      props: { header: "Details", defaultOpen: false },
      slots: { body: "Hidden details" },
      global: { stubs: { Icon: IconStub, transition: false } },
    })
    const trigger = uncontrolled.find('[role="button"]')
    expect(trigger.attributes("aria-expanded")).toBe("false")
    await trigger.trigger("keydown", { key: "Enter" })
    expect(trigger.attributes("aria-expanded")).toBe("true")

    const controlled = shallowMount(Collapsible, {
      props: { modelValue: true },
      global: { stubs: { Icon: IconStub, transition: false } },
    })
    await controlled.find('[role="button"]').trigger("click")
    expect(controlled.emitted("update:modelValue")).toEqual([[false]])
  })

  it("EmptyState switches between loading and content and emits its action", async () => {
    const wrapper = shallowMount(EmptyState, {
      props: {
        title: "Nothing here",
        description: "Create the first item",
        actionLabel: "Create",
      },
      global: { stubs: { Icon: IconStub } },
    })
    expect(wrapper.text()).toContain("Nothing here")
    expect(wrapper.text()).toContain("Create the first item")
    wrapper.findComponent({ name: "AppButton" }).vm.$emit("click")
    expect(wrapper.emitted("action")).toHaveLength(1)

    await (
      wrapper as unknown as { setProps: (props: { loading: boolean }) => Promise<void> }
    ).setProps({ loading: true })
    expect(wrapper.text()).not.toContain("Nothing here")
    expect(wrapper.findComponent(IconStub).attributes("data-name")).toBe("loader")
  })

  it("Icon resolves known assets, applies sizing rules, and forwards clicks", async () => {
    const wrapper = mount(Icon, { props: { name: "add", size: 24 } })
    const icon = wrapper.find("svg")
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain("app-icon")
    expect(icon.attributes("width")).toBe("24px")
    await icon.trigger("click")
    expect(wrapper.emitted("click")).toHaveLength(1)

    const classSized = mount(Icon, {
      props: { name: "add", size: 40 },
      attrs: { class: "h-5 w-5 text-primary-600" },
    })
    expect(classSized.find("svg").attributes("width")).toBeUndefined()

    const swipeGesture = mount(Icon, { props: { name: "swipe-gesture", size: 18 } })
    expect(swipeGesture.find("svg").exists()).toBe(true)
    expect(swipeGesture.find("svg").attributes("width")).toBe("18px")
  })

  it("IconHeader, InfoBox, and WarningBox render their public content contracts", () => {
    const header = shallowMount(IconHeader, {
      props: { iconName: "shop-add", title: "Inventory", subtext: "Manage stock" },
      slots: { "header-content": "Header action" },
      global: { stubs: { Icon: IconStub } },
    })
    expect(header.text()).toContain("Inventory")
    expect(header.text()).toContain("Manage stock")
    expect(header.text()).toContain("Header action")
    expect(header.findComponent(IconStub).props("name")).toBe("shop-add")

    const info = shallowMount(InfoBox, {
      props: { title: "Heads up", message: "Review this", variant: "success" },
      slots: { default: "Extra context" },
      global: { stubs: { Icon: IconStub } },
    })
    expect(info.text()).toContain("Heads up")
    expect(info.text()).toContain("Review this")
    expect(info.text()).toContain("Extra context")
    expect(info.classes()).toContain("bg-success-25")

    const warning = shallowMount(WarningBox, {
      props: { header: "Warning" },
      slots: { default: "Take care" },
      global: { stubs: { Icon: IconStub } },
    })
    expect(warning.text()).toContain("Warning")
    expect(warning.text()).toContain("Take care")
  })

  it("LoadingIcon applies wrapper and SVG classes", () => {
    const wrapper = mount(LoadingIcon, {
      props: { class: "compact-loader", iconClass: "small-icon" },
    })
    expect(wrapper.classes()).toContain("compact-loader")
    expect(wrapper.find("svg").classes()).toContain("small-icon")
    expect(wrapper.findAll("animate")).toHaveLength(8)
  })

  it("PageHeader renders counts and routes inner headers back", async () => {
    const push = vi.fn()
    const back = vi.fn()
    const wrapper = shallowMount(PageHeader, {
      props: { title: "Products", count: 4, countLabel: "items", showTutorial: false },
      global: {
        mocks: { $router: { push, back } },
        stubs: { Icon: IconStub, Chip: ChipStub },
      },
    })
    expect(wrapper.text()).toContain("Products")
    expect(wrapper.text()).toContain("4 items")
    expect(wrapper.text()).not.toContain("Tutorial")

    await wrapper.setProps({ showTutorial: true })
    await wrapper.find('button[aria-label="Start tutorial"]').trigger("click")
    expect(wrapper.emitted("tutorial")).toHaveLength(1)

    await wrapper.setProps({ inner: true, backLink: "/inventory" })
    await wrapper.findComponent(IconStub).trigger("click")
    expect(push).toHaveBeenCalledWith("/inventory")
  })

  it("ProductAvatar handles placeholders, variants, custom size, and guarded clicks", async () => {
    const wrapper = shallowMount(ProductAvatar, {
      props: {
        name: "Red Shirt",
        extraText: "Clothing",
        variantsCount: 3,
        size: 52,
        clickable: true,
      },
      global: { stubs: { Icon: IconStub, Chip: ChipStub } },
    })
    expect(wrapper.text()).toContain("Red Shirt")
    expect(wrapper.text()).toContain("Clothing")
    expect(wrapper.text()).toContain("3 Variants")
    expect(wrapper.find("div.relative > div").attributes("style")).toContain("height: 52px")
    await wrapper.trigger("click")
    expect(wrapper.emitted("click")).toHaveLength(1)

    await wrapper.setProps({ url: "/product.png", clickable: false })
    expect(wrapper.find("img").attributes("alt")).toBe("Red Shirt")
    await wrapper.trigger("click")
    expect(wrapper.emitted("click")).toHaveLength(1)
  })

  it("SectionHeader renders prop/slot variants and action content", () => {
    const wrapper = mount(SectionHeader, {
      props: { title: "Orders", subtitle: "Fallback", size: "sm" },
      slots: { subtitle: "Slotted subtitle", action: "Add order" },
    })
    expect(wrapper.text()).toContain("Orders")
    expect(wrapper.text()).toContain("Slotted subtitle")
    expect(wrapper.text()).not.toContain("Fallback")
    expect(wrapper.text()).toContain("Add order")
    expect(wrapper.find("h3").classes()).toContain("text-md")
  })

  it("StatCard renders loading and populated variants", async () => {
    const wrapper = shallowMount(StatCard, {
      props: {
        stat: {
          icon: "sales",
          label: "Sales",
          value: 120,
          valueText: "orders",
          chip: "Healthy",
          chipToolTip: "Above target",
          percentage: 12,
        },
      },
      global: { stubs: { Icon: IconStub, Chip: ChipStub } },
    })
    expect(wrapper.text()).toContain("Sales")
    expect(wrapper.text()).toContain("120")
    expect(wrapper.text()).toContain("orders")
    expect(wrapper.text()).toContain("Healthy")
    expect(wrapper.text()).toContain("Above target")
    expect(wrapper.text()).toContain("12%")

    await (
      wrapper as unknown as { setProps: (props: { loading: boolean }) => Promise<void> }
    ).setProps({ loading: true })
    expect(wrapper.find(".animate-pulse").exists()).toBe(true)
    expect(wrapper.text()).not.toContain("Sales")
  })

  it("SummaryCards renders loading and item metadata", async () => {
    const wrapper = shallowMount(SummaryCards, {
      props: {
        items: [
          {
            icon: "sales",
            label: "Revenue",
            value: "₦12,000",
            labelTag: "Today",
            valueTag: "+5%",
          },
        ],
      },
      global: { stubs: { Icon: IconStub } },
    })
    expect(wrapper.text()).toContain("Revenue")
    expect(wrapper.text()).toContain("₦12,000")
    expect(wrapper.text()).toContain("Today")
    expect(wrapper.text()).toContain("+5%")

    await (
      wrapper as unknown as { setProps: (props: { loading: boolean }) => Promise<void> }
    ).setProps({ loading: true })
    expect(wrapper.text()).toContain("loading...")
    expect(wrapper.text()).not.toContain("Revenue")
  })

  it("both shared skeletons expose stable loading placeholders", () => {
    const delivery = mount(ConfigureDeliverySkeleton)
    const onboarding = mount(OnboardingSkeleton)
    expect(delivery.findAll(".animate-pulse").length).toBeGreaterThan(10)
    expect(onboarding.findAll(".animate-pulse").length).toBeGreaterThan(20)
  })
})
