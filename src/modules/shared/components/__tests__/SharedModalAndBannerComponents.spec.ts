import { defineComponent, nextTick } from "vue"
import { mount, shallowMount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  route: { path: "/settings/delivery" },
  routerPush: vi.fn(),
  gtag: vi.fn(),
}))

vi.mock("vue-router", () => ({ useRoute: () => mocks.route }))

import ConsentBanner from "@modules/shared/components/ConsentBanner.vue"
import ManageShipBubbleModal from "@modules/shared/components/ManageShipBubbleModal.vue"
import TrialActivationModal from "@modules/shared/components/TrialActivationModal.vue"
import WelcomeToTeamModal from "@modules/shared/components/WelcomeToTeamModal.vue"

const AppButtonStub = defineComponent({
  name: "AppButton",
  props: { label: String },
  emits: ["click"],
  template: '<button class="app-button" @click="$emit(\'click\')">{{ label }}</button>',
})

const ModalStub = defineComponent({
  name: "Modal",
  props: { open: Boolean, title: String },
  emits: ["close"],
  template:
    '<section v-if="open"><button class="close" @click="$emit(\'close\')"/><slot /></section>',
})

const MessageModalStub = defineComponent({
  name: "MessageModal",
  props: { open: Boolean },
  emits: ["close"],
  template:
    '<section v-if="open"><button class="close" @click="$emit(\'close\')"/><slot /></section>',
})

const IconStub = defineComponent({
  name: "Icon",
  props: { name: String },
  emits: ["click"],
  template: '<button class="icon" :data-name="name" @click="$emit(\'click\')" />',
})

describe("reusable shared banners and modals", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    Object.defineProperty(window, "gtag", { configurable: true, value: mocks.gtag })
  })

  afterEach(() => {
    localStorage.clear()
    delete (window as Window & { gtag?: unknown }).gtag
  })

  it("ConsentBanner stays hidden for prior consent and accepts either visible consent action", async () => {
    localStorage.setItem("user_consent", "granted")
    const hidden = mount(ConsentBanner, { global: { stubs: { AppButton: AppButtonStub } } })
    await nextTick()
    expect(hidden.text()).not.toContain("We use Cookies")
    hidden.unmount()

    localStorage.removeItem("user_consent")
    const wrapper = mount(ConsentBanner, { global: { stubs: { AppButton: AppButtonStub } } })
    await nextTick()
    expect(wrapper.text()).toContain("We use Cookies")
    expect(wrapper.find('img[alt="Cookies"]').attributes("src")).toBe("/images/cookie.png")
    await wrapper.findAllComponents(AppButtonStub)[1].trigger("click")
    expect(mocks.gtag).toHaveBeenCalledWith("consent", "update", {
      ad_storage: "granted",
      analytics_storage: "granted",
    })
    expect(localStorage.getItem("user_consent")).toBe("granted")
    expect(wrapper.text()).not.toContain("We use Cookies")
  })

  it("ConsentBanner also works when Google analytics is unavailable", async () => {
    delete (window as Window & { gtag?: unknown }).gtag
    const wrapper = mount(ConsentBanner, { global: { stubs: { AppButton: AppButtonStub } } })
    await nextTick()
    await wrapper.findComponent(AppButtonStub).trigger("click")
    expect(localStorage.getItem("user_consent")).toBe("granted")
  })

  it("ManageShipBubbleModal routes each action back through the current page and closes", async () => {
    const wrapper = shallowMount(ManageShipBubbleModal, {
      props: { modelValue: true },
      global: {
        mocks: { $router: { push: mocks.routerPush } },
        stubs: { Modal: ModalStub, AppButton: AppButtonStub },
      },
    })
    const buttons = wrapper.findAllComponents(AppButtonStub)
    await buttons[0].trigger("click")
    expect(mocks.routerPush).toHaveBeenCalledWith(
      "/onboarding?shipbubble=true&mode=edit&redirect=%2Fsettings%2Fdelivery",
    )
    await buttons[1].trigger("click")
    expect(mocks.routerPush).toHaveBeenLastCalledWith(
      "/onboarding?shipbubble=true&step=2&mode=edit&redirect=%2Fsettings%2Fdelivery",
    )
    await wrapper.find(".close").trigger("click")
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]])
  })

  it("TrialActivationModal renders active trial context and closes from every control", async () => {
    const wrapper = shallowMount(TrialActivationModal, {
      props: {
        open: true,
        subscription: {
          active_until: new Date(2026, 6, 31, 12).toISOString(),
          trial_mode: true,
        } as never,
      },
      global: { stubs: { Modal: ModalStub, AppButton: AppButtonStub, Icon: IconStub } },
    })
    expect(wrapper.text()).toContain("A little something for you")
    expect(wrapper.text()).toContain("Trial ends on:")
    expect(wrapper.text()).toContain("July 31, 2026")
    await wrapper.findComponent(IconStub).trigger("click")
    await wrapper.findComponent(AppButtonStub).trigger("click")
    await wrapper.find(".close").trigger("click")
    expect(wrapper.emitted("close")).toHaveLength(3)

    await wrapper.setProps({
      subscription: { active_until: "", trial_mode: false } as never,
    })
    expect(wrapper.text()).not.toContain("Trial ends on:")
  })

  it("WelcomeToTeamModal renders the shared welcome message and forwards close", async () => {
    const wrapper = shallowMount(WelcomeToTeamModal, {
      props: { modelValue: true },
      global: { stubs: { MessageModal: MessageModalStub, AppButton: AppButtonStub } },
    })
    expect(wrapper.text()).toContain("Welcome to Leyyow!")
    expect(wrapper.text()).toContain("Smile Socks Team")
    expect(wrapper.findComponent(AppButtonStub).props("label")).toBe("Great, let's go!")
    await wrapper.find(".close").trigger("click")
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]])
  })
})
