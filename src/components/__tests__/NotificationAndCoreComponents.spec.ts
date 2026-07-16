import { defineComponent } from "vue"
import { shallowMount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  closeSupportModal: vi.fn(),
  clipboardCopy: vi.fn(),
  removeToast: vi.fn(),
  setPlanUpgradeModal: vi.fn(),
  route: { path: "/dashboard" },
  settings: {
    isInternational: false,
    liveStatus: { is_live: false },
    storeDetails: { slug: "test-store" },
  },
  authUser: { store_slug: "auth-store" },
  liveStatusData: {
    value: { data: { criteria: { subscription: { status: false } } } },
  },
  liveStatusPending: { value: false },
}))

vi.mock("@vueuse/core", () => ({ useMediaQuery: () => ({ value: false }) }))
vi.mock("@modules/auth/store", () => ({
  useAuthStore: () => ({ user: mocks.authUser, logout: mocks.logout }),
}))
vi.mock("@modules/settings/store", () => ({
  useSettingsStore: () => ({
    ...mocks.settings,
    setPlanUpgradeModal: mocks.setPlanUpgradeModal,
  }),
}))
vi.mock("@modules/shared/api", async () => {
  const { computed } = await import("vue")
  return {
    useGetLiveStatus: () => ({
      data: computed(() => mocks.liveStatusData.value),
      isPending: computed(() => mocks.liveStatusPending.value),
    }),
  }
})
vi.mock("@modules/shared/store", () => ({
  useSharedStore: () => ({ isSupportModalOpen: true, closeSupportModal: mocks.closeSupportModal }),
}))
vi.mock("vue-router", () => ({ useRoute: () => mocks.route }))
vi.mock("@/utils/others", () => ({ clipboardCopy: mocks.clipboardCopy }))
vi.mock("@/composables/useToast", () => ({
  useToast: () => ({
    toasts: [
      { id: "success-1", type: "success", title: "Saved", message: "Changes applied" },
      { id: "error-1", type: "error", title: "Failed", message: "Try again" },
    ],
    removeToast: mocks.removeToast,
  }),
}))

import NotificationItem from "@components/NotificationItem.vue"
import NotificationModal from "@components/NotificationModal.vue"
import NotificationsDrawer from "@components/NotificationsDrawer.vue"
import StorefrontNotLiveBanner from "@components/StorefrontNotLiveBanner.vue"
import LogoutModal from "@components/core/LogoutModal.vue"
import SupportModal from "@components/core/SupportModal.vue"
import ToastContainer from "@components/core/ToastContainer.vue"

const IconStub = defineComponent({
  name: "Icon",
  props: { name: String },
  template: '<span class="icon-stub" :data-name="name" />',
})

const DrawerStub = defineComponent({
  name: "Drawer",
  props: { open: Boolean, title: String, maxWidth: String },
  emits: ["close"],
  template:
    '<div v-if="open" class="drawer-stub"><button class="close-drawer" @click="$emit(\'close\')">Close</button><slot /></div>',
})

const NotificationItemStub = defineComponent({
  name: "NotificationItem",
  props: { notification: Object },
  emits: ["click", "action"],
  template:
    '<div class="notification-item-stub"><button class="item-click" @click="$emit(\'click\', notification)">Open</button><button class="item-action" @click="$emit(\'action\', notification)">Act</button></div>',
})

const EmptyStateStub = defineComponent({
  name: "EmptyState",
  props: { title: String },
  template: '<div class="empty-state-stub">{{ title }}</div>',
})

const ChipStub = defineComponent({
  name: "Chip",
  props: { label: String },
  template: '<span class="chip-stub">{{ label }}</span>',
})

const ConfirmationModalStub = defineComponent({
  name: "ConfirmationModal",
  props: { modelValue: Boolean, header: String },
  emits: ["update:modelValue", "confirm"],
  template:
    '<div><button class="cancel" @click="$emit(\'update:modelValue\', false)">Cancel</button><button class="confirm" @click="$emit(\'confirm\')">Confirm</button></div>',
})

const ModalStub = defineComponent({
  name: "Modal",
  props: { open: Boolean, title: String },
  emits: ["close"],
  template: '<div v-if="open" class="modal-stub"><slot /></div>',
})

const AppButtonStub = defineComponent({
  name: "AppButton",
  props: { label: String },
  emits: ["click"],
  template: '<button class="app-button-stub" @click="$emit(\'click\')">{{ label }}</button>',
})

const notifications = [
  {
    uid: "notification-1",
    title: "New order",
    message: "Order #101 was placed",
    type: "order",
    is_read: false,
    created_at: "2026-07-16T09:59:00.000Z",
  },
  {
    uid: "notification-2",
    title: "System update",
    message: "Maintenance complete",
    type: "system",
    is_read: true,
    created_at: "2026-07-15T10:00:00.000Z",
  },
]

describe("notification and core shared components", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-16T10:00:00.000Z"))
    mocks.settings.isInternational = false
    mocks.settings.liveStatus = { is_live: false }
    mocks.route.path = "/dashboard"
    mocks.liveStatusData.value = {
      data: { criteria: { subscription: { status: false } } },
    }
    mocks.liveStatusPending.value = false
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.style.overflow = ""
    vi.unstubAllGlobals()
  })

  it("NotificationItem maps icons/actions, formats age, and separates row/action events", async () => {
    const wrapper = shallowMount(NotificationItem, {
      props: { notification: notifications[0] },
      global: { stubs: { Icon: IconStub } },
    })
    expect(wrapper.text()).toContain("New order")
    expect(wrapper.text()).toContain("Order #101 was placed")
    expect(wrapper.text()).toContain("1m ago")
    expect(wrapper.text()).toContain("View Order")
    expect(wrapper.find('[aria-label="Unread"]').exists()).toBe(true)
    expect(wrapper.findComponent(IconStub).props("name")).toBe("bag")

    await wrapper.find("button").trigger("click")
    expect(wrapper.emitted("action")).toEqual([[notifications[0]]])
    expect(wrapper.emitted("click")).toBeUndefined()
    await wrapper.trigger("click")
    expect(wrapper.emitted("click")).toEqual([[notifications[0]]])
  })

  it("NotificationModal limits its stack, dismisses the first item, and controls scroll", async () => {
    const fourNotifications = [
      ...notifications,
      { ...notifications[0], uid: "3" },
      { ...notifications[0], uid: "4" },
    ]
    const wrapper = shallowMount(NotificationModal, {
      props: { open: true, notifications: fourNotifications },
      global: { stubs: { Icon: IconStub, Transition: false, TransitionGroup: false } },
    })
    expect(document.body.style.overflow).toBe("hidden")
    expect(wrapper.findAll(".notification-card")).toHaveLength(3)
    expect(wrapper.text()).toContain("4")
    await wrapper.find("button").trigger("click")
    expect(wrapper.emitted("dismiss")).toEqual([["notification-1"]])
    await wrapper.find(".fixed").trigger("click")
    expect(wrapper.emitted("close")).toHaveLength(1)
    await wrapper.setProps({ open: false })
    expect(document.body.style.overflow).toBe("")
  })

  it("NotificationsDrawer reports unread counts and routes item events", async () => {
    const wrapper = shallowMount(NotificationsDrawer, {
      props: { open: true, notifications },
      global: {
        stubs: {
          Teleport: true,
          Drawer: DrawerStub,
          Chip: ChipStub,
          EmptyState: EmptyStateStub,
          NotificationItem: NotificationItemStub,
        },
      },
    })
    expect(wrapper.findComponent(DrawerStub).props("title")).toBe("Notifications (1)")
    expect(wrapper.text()).toContain("1 unread")
    await wrapper.find("button.text-sm").trigger("click")
    expect(wrapper.emitted("mark-all-read")).toHaveLength(1)

    const items = wrapper.findAllComponents(NotificationItemStub)
    await items[0].find(".item-click").trigger("click")
    await items[0].find(".item-action").trigger("click")
    expect(wrapper.emitted("mark-read")).toEqual([["notification-1"], ["notification-1"]])
    expect(wrapper.emitted("navigate")).toEqual([[notifications[0]]])

    await items[1].find(".item-click").trigger("click")
    expect(wrapper.emitted("mark-read")).toHaveLength(2)
  })

  it("NotificationsDrawer renders its empty state and forwards close", async () => {
    const wrapper = shallowMount(NotificationsDrawer, {
      props: { open: true, notifications: [] },
      global: {
        stubs: {
          Teleport: true,
          Drawer: DrawerStub,
          Chip: ChipStub,
          EmptyState: EmptyStateStub,
          NotificationItem: NotificationItemStub,
        },
      },
    })
    expect(wrapper.text()).toContain("No notifications yet")
    await wrapper.find(".close-drawer").trigger("click")
    expect(wrapper.emitted("close")).toHaveLength(1)
  })

  it("LogoutModal closes without logout on cancel and logs out on confirmation", async () => {
    const wrapper = shallowMount(LogoutModal, {
      props: { open: true },
      global: { stubs: { ConfirmationModal: ConfirmationModalStub } },
    })
    await wrapper.find(".cancel").trigger("click")
    expect(wrapper.emitted("close")).toHaveLength(1)
    expect(mocks.logout).not.toHaveBeenCalled()

    await wrapper.find(".confirm").trigger("click")
    expect(mocks.logout).toHaveBeenCalledOnce()
    expect(wrapper.emitted("close")).toHaveLength(2)
  })

  it("SupportModal exposes all channels, opens WhatsApp, copies details, and closes", async () => {
    const open = vi.fn()
    vi.stubGlobal("open", open)
    const wrapper = shallowMount(SupportModal, {
      global: { stubs: { Modal: ModalStub, Icon: IconStub } },
    })
    expect(wrapper.text()).toContain("hello@leyyow.com")
    expect(wrapper.text()).toContain("+2349049653326")
    expect(wrapper.text()).toContain("WhatsApp")
    const cards = wrapper.findAll(".group")
    await cards[2].trigger("click")
    expect(open).toHaveBeenCalledWith(
      "https://wa.me/2349049653326?text=Hi%2C%20I%20need%20help%20with%20my%20Leyyow%20account.",
      "_blank",
    )
    await wrapper.find('button[title="Copy email"]').trigger("click")
    expect(mocks.clipboardCopy).toHaveBeenCalledWith("hello@leyyow.com")
  })

  it("ToastContainer renders severity semantics and dismisses individual toasts", async () => {
    const wrapper = shallowMount(ToastContainer, {
      global: { stubs: { Teleport: true, TransitionGroup: false, Icon: IconStub } },
    })
    const alerts = wrapper.findAll('[role="alert"]')
    expect(alerts).toHaveLength(2)
    expect(alerts[0].attributes("aria-live")).toBe("polite")
    expect(alerts[1].attributes("aria-live")).toBe("assertive")
    expect(wrapper.text()).toContain("Changes applied")
    await alerts[0].find("button").trigger("click")
    expect(mocks.removeToast).toHaveBeenCalledWith("success-1")
  })

  it("StorefrontNotLiveBanner drives upgrade/setup paths and hides for exempt states", async () => {
    const upgrade = shallowMount(StorefrontNotLiveBanner, {
      global: {
        mocks: { $router: { push: vi.fn() } },
        stubs: { Icon: IconStub, AppButton: AppButtonStub },
      },
    })
    expect(upgrade.text()).toContain("Your storefront is no longer live!")
    expect(upgrade.findComponent(AppButtonStub).props("label")).toBe("Upgrade now")
    await upgrade.findComponent(AppButtonStub).trigger("click")
    expect(mocks.setPlanUpgradeModal).toHaveBeenCalledWith(true)

    mocks.liveStatusData.value = {
      data: { criteria: { subscription: { status: true } } },
    }
    const push = vi.fn()
    const setup = shallowMount(StorefrontNotLiveBanner, {
      global: { mocks: { $router: { push } }, stubs: { Icon: IconStub, AppButton: AppButtonStub } },
    })
    expect(setup.text()).toContain("Your storefront isn't live yet!")
    await setup.findComponent(AppButtonStub).trigger("click")
    expect(push).toHaveBeenCalledWith("/onboarding")

    mocks.settings.isInternational = true
    const hidden = shallowMount(StorefrontNotLiveBanner, {
      global: { mocks: { $router: { push } }, stubs: { Icon: IconStub, AppButton: AppButtonStub } },
    })
    expect(hidden.html()).toBe("<!--v-if-->")
  })
})
