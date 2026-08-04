import { defineComponent } from "vue"
import { flushPromises, mount, shallowMount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  user: {
    store_uid: "store-1",
    email: "owner@example.com",
    store: { store_name: "Smile Socks", address: "Lagos", phone: "08012345678" },
  },
  route: { path: "/onboarding", query: {} as Record<string, string> },
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  displayError: vi.fn(),
  updateStore: vi.fn(),
  updateSchedule: vi.fn(),
  setupShippingProfile: vi.fn(),
  updateShippingProfile: vi.fn(),
  updateStoreDetails: vi.fn(),
  createManual: vi.fn(),
  createExpress: vi.fn(),
  updateManual: vi.fn(),
  updateExpress: vi.fn(),
  deleteManual: vi.fn(),
  deleteExpress: vi.fn(),
  refetchManual: vi.fn(),
  refetchExpress: vi.fn(),
  refetchShippingProfile: vi.fn(),
  shippingProfile: { value: null as null | Record<string, unknown> },
  storeDetails: { value: { pickup_location: "12 Marina Road" } as Record<string, unknown> },
  schedules: {
    value: {
      results: [
        {
          uid: "monday",
          day_of_week: 0,
          day_of_week_display: "Monday",
          is_enabled: true,
          start_time: "09:00:00",
          end_time: "17:00:00",
        },
        {
          uid: "saturday",
          day_of_week: 5,
          day_of_week_display: "Saturday",
          is_enabled: false,
          start_time: null,
          end_time: null,
        },
      ],
    },
  },
  manualOptions: {
    value: [{ uid: "manual-1", location: "Lekki", amount: "5000" }],
  },
  expressOptions: { value: [] as Array<Record<string, string>> },
  couriers: {
    value: [
      { uid: "courier-1", name: "DHL", pin_image: "/dhl.png" },
      { uid: "courier-2", name: "FedEx", pin_image: "/fedex.png" },
      null,
    ],
  },
}))

vi.mock("@vueuse/core", () => ({ useMediaQuery: () => ({ value: false }) }))
vi.mock("@/components/GooglePlacesAutocomplete.vue", async () => {
  const { defineComponent } = await import("vue")
  return {
    default: defineComponent({
      name: "GooglePlacesAutocomplete",
      props: { modelValue: String },
      emits: ["update:modelValue"],
      template: '<input class="places-module-stub" :value="modelValue" />',
    }),
  }
})
vi.mock("@modules/auth/store", () => ({ useAuthStore: () => ({ user: mocks.user }) }))
vi.mock("vue-router", () => ({
  useRoute: () => mocks.route,
  useRouter: () => ({ push: mocks.routerPush, replace: mocks.routerReplace }),
}))
vi.mock("@/composables/useToast", () => ({
  toast: { error: mocks.toastError, success: mocks.toastSuccess },
}))
vi.mock("@/utils/error-handler", () => ({ displayError: mocks.displayError }))
vi.mock("@/modules/shared/utils/shipbubble-flow", () => ({
  shouldAutoEnableManagedDelivery: () => false,
  shouldReturnToRedirect: (redirect: unknown) =>
    typeof redirect === "string" && redirect.length > 0,
}))
vi.mock("@modules/settings/api", async () => {
  const { computed } = await import("vue")
  return {
    useUpdateStoreDetails: () => ({
      mutateAsync: mocks.updateStore,
      mutate: mocks.updateStoreDetails,
    }),
    useGetStoreDetails: () => ({
      data: computed(() => mocks.storeDetails.value),
      isPending: computed(() => false),
    }),
    useGetPickupSchedules: () => ({ data: computed(() => mocks.schedules.value) }),
    useUpdatePickupSchedule: () => ({ mutateAsync: mocks.updateSchedule }),
  }
})
vi.mock("@modules/shared/api", async () => {
  const { computed } = await import("vue")
  return {
    useGetShippingProfile: () => ({
      data: computed(() => mocks.shippingProfile.value),
      isPending: computed(() => false),
      refetch: mocks.refetchShippingProfile,
    }),
    useSetupShippingProfile: () => ({
      mutate: mocks.setupShippingProfile,
      isPending: computed(() => false),
    }),
    useUpdateShippingProfile: () => ({
      mutate: mocks.updateShippingProfile,
      isPending: computed(() => false),
    }),
    useGetManualDeliveryOptions: () => ({
      data: computed(() => mocks.manualOptions.value),
      isLoading: computed(() => false),
      refetch: mocks.refetchManual,
    }),
    useGetExpressDeliveryOptions: () => ({
      data: computed(() => mocks.expressOptions.value),
      isLoading: computed(() => false),
      refetch: mocks.refetchExpress,
    }),
    useCreateManualDeliveryOption: () => ({ mutateAsync: mocks.createManual }),
    useCreateExpressDeliveryOption: () => ({ mutateAsync: mocks.createExpress }),
    useUpdateManualDeliveryOption: () => ({ mutateAsync: mocks.updateManual }),
    useUpdateExpressDeliveryOption: () => ({ mutateAsync: mocks.updateExpress }),
    useDeleteManualDeliveryOption: () => ({ mutateAsync: mocks.deleteManual }),
    useDeleteExpressDeliveryOption: () => ({ mutateAsync: mocks.deleteExpress }),
    useGetCouriers: () => ({
      data: computed(() => mocks.couriers.value),
      isPending: computed(() => false),
    }),
  }
})

import ConfigureDeliveryModal from "@modules/shared/components/ConfigureDeliveryModal.vue"
import ConfigurePickupModal from "@modules/shared/components/ConfigurePickupModal.vue"
import ManageManualDeliveryModal from "@modules/shared/components/ManageManualDeliveryModal.vue"
import ShipbubbleAccountSetup from "@modules/shared/components/ShipbubbleAccountSetup.vue"

const ModalStub = defineComponent({
  name: "Modal",
  props: { open: Boolean, title: String },
  emits: ["close"],
  template:
    '<section v-if="open"><button class="modal-close" @click="$emit(\'close\')"/><slot /></section>',
})

const AppButtonStub = defineComponent({
  name: "AppButton",
  inheritAttrs: false,
  props: { label: String, disabled: Boolean, loading: Boolean, type: String },
  emits: ["click"],
  template:
    '<button class="app-button" :type="type || \'button\'" :data-disabled="disabled" @click="$emit(\'click\')">{{ label }}</button>',
})

const TextFieldStub = defineComponent({
  name: "TextField",
  props: { modelValue: [String, Number] },
  emits: ["update:modelValue"],
  template:
    '<input class="text-field" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
})

const SwitchStub = defineComponent({
  name: "AppSwitch",
  props: { modelValue: Boolean },
  emits: ["update:modelValue"],
  template:
    '<button class="switch" @click="$emit(\'update:modelValue\', !modelValue)">{{ modelValue }}</button>',
})

const GooglePlacesStub = defineComponent({
  name: "GooglePlacesAutocomplete",
  props: { modelValue: String },
  emits: ["update:modelValue"],
  template:
    '<input class="places" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
})

const CheckboxStub = defineComponent({
  name: "Checkbox",
  props: { modelValue: Boolean },
  emits: ["update:modelValue"],
  template:
    '<button class="checkbox" @click="$emit(\'update:modelValue\', !modelValue)"><slot /></button>',
})

const ShipbubbleSetupStub = defineComponent({
  name: "ShipbubbleAccountSetup",
  props: { currentStep: Number, mode: String, authForm: Object, courierOptions: Array },
  emits: ["close", "submitAuthForm", "submitCouriers", "update:authForm", "update:courierOptions"],
  template: '<div class="shipbubble-setup">step {{ currentStep }}</div>',
})

const ManualModalStub = defineComponent({
  name: "ManageManualDeliveryModal",
  props: { modelValue: Boolean },
  emits: ["update:modelValue", "refresh"],
  template: '<div v-if="modelValue" class="manual-modal" />',
})

describe("reusable delivery components", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.route.path = "/onboarding"
    mocks.route.query = {}
    mocks.shippingProfile.value = null
    mocks.storeDetails.value = { pickup_location: "12 Marina Road" }
    mocks.manualOptions.value = [{ uid: "manual-1", location: "Lekki", amount: "5000" }]
    mocks.expressOptions.value = []
    mocks.updateStore.mockResolvedValue(undefined)
    mocks.updateSchedule.mockResolvedValue(undefined)
    mocks.createManual.mockResolvedValue(undefined)
    mocks.createExpress.mockResolvedValue(undefined)
    mocks.updateManual.mockResolvedValue(undefined)
    mocks.updateExpress.mockResolvedValue(undefined)
    mocks.deleteManual.mockResolvedValue(undefined)
    mocks.deleteExpress.mockResolvedValue(undefined)
    mocks.refetchManual.mockResolvedValue(undefined)
    mocks.refetchExpress.mockResolvedValue(undefined)
  })

  afterEach(() => {
    document.body.style.overflow = ""
    vi.useRealTimers()
  })

  it("ConfigurePickupModal hydrates API schedules and only saves changed days", async () => {
    const wrapper = shallowMount(ConfigurePickupModal, {
      props: { modelValue: true },
      global: {
        stubs: {
          Modal: ModalStub,
          AppButton: AppButtonStub,
          Switch: SwitchStub,
          GooglePlacesAutocomplete: GooglePlacesStub,
        },
      },
    })
    expect(wrapper.findComponent(GooglePlacesStub).props("modelValue")).toBe("12 Marina Road")
    expect(wrapper.text()).toContain("Monday")
    expect(wrapper.text()).toContain("Saturday")
    await wrapper.findAllComponents(SwitchStub)[1].trigger("click")
    await wrapper.findAllComponents(AppButtonStub).at(-1)!.trigger("click")
    await flushPromises()

    expect(mocks.updateStore).toHaveBeenCalledWith({
      id: "store-1",
      body: { pickup_location: "12 Marina Road" },
    })
    expect(mocks.updateSchedule).toHaveBeenCalledTimes(1)
    expect(mocks.updateSchedule).toHaveBeenCalledWith({
      uid: "saturday",
      body: { is_enabled: true, start_time: "09:00", end_time: "17:00" },
    })
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Pickup settings saved!")
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]])
    expect(wrapper.emitted("refresh")).toHaveLength(1)
  })

  it("ConfigurePickupModal blocks saving when every pickup day is disabled", async () => {
    const wrapper = shallowMount(ConfigurePickupModal, {
      props: { modelValue: true },
      global: {
        stubs: {
          Modal: ModalStub,
          AppButton: AppButtonStub,
          Switch: SwitchStub,
          GooglePlacesAutocomplete: GooglePlacesStub,
        },
      },
    })
    for (const toggle of wrapper.findAllComponents(SwitchStub)) {
      if (toggle.props("modelValue")) await toggle.trigger("click")
    }
    await wrapper.findAllComponents(AppButtonStub).at(-1)!.trigger("click")
    expect(mocks.toastError).toHaveBeenCalledWith(
      "Enable at least one pickup day to turn on pickups.",
    )
    expect(mocks.updateStore).not.toHaveBeenCalled()
  })

  it("ManageManualDeliveryModal validates rows and updates only changed manual options", async () => {
    const wrapper = shallowMount(ManageManualDeliveryModal, {
      props: { modelValue: true, mode: "manual" },
      global: { stubs: { Modal: ModalStub, AppButton: AppButtonStub, TextField: TextFieldStub } },
    })
    const fields = wrapper.findAllComponents(TextFieldStub)
    await fields[0].find("input").setValue("")
    await wrapper.findAllComponents(AppButtonStub).at(-1)!.trigger("click")
    expect(mocks.toastError).toHaveBeenCalledWith("Please fill in all location and price fields")

    await fields[0].find("input").setValue("Victoria Island")
    await fields[1].find("input").setValue("6000")
    await wrapper.findAllComponents(AppButtonStub).at(-1)!.trigger("click")
    await flushPromises()
    expect(mocks.updateManual).toHaveBeenCalledWith({
      uid: "manual-1",
      body: { location: "Victoria Island", amount: "6000" },
    })
    expect(mocks.updateStoreDetails).toHaveBeenCalledWith({
      id: "store-1",
      body: { manual_delivery_enabled: true },
    })
    expect(mocks.refetchManual).toHaveBeenCalled()
    expect(wrapper.emitted("refresh")).toHaveLength(1)
  })

  it("ManageManualDeliveryModal creates and deletes express locations in a single save", async () => {
    mocks.expressOptions.value = [{ uid: "express-1", location: "Ikeja", amount: "4000" }]
    const wrapper = shallowMount(ManageManualDeliveryModal, {
      props: { modelValue: true, mode: "express" },
      global: { stubs: { Modal: ModalStub, AppButton: AppButtonStub, TextField: TextFieldStub } },
    })
    const add = wrapper
      .findAllComponents(AppButtonStub)
      .find((button) => button.props("label") === "+ Add location")!
    await add.trigger("click")
    const removeButtons = wrapper
      .findAllComponents(AppButtonStub)
      .filter((button) => button.props("label") === "-")
    await removeButtons[0].trigger("click")
    const fields = wrapper.findAllComponents(TextFieldStub)
    await fields[0].find("input").setValue("Yaba")
    await fields[1].find("input").setValue("3500")
    await wrapper.findAllComponents(AppButtonStub).at(-1)!.trigger("click")
    await flushPromises()
    expect(mocks.deleteExpress).toHaveBeenCalledWith("express-1")
    expect(mocks.createExpress).toHaveBeenCalledWith({ location: "Yaba", amount: "3500" })
    expect(mocks.updateStoreDetails).toHaveBeenCalledWith({
      id: "store-1",
      body: { express_delivery_enabled: true },
    })
    expect(mocks.refetchExpress).toHaveBeenCalled()
  })

  it("ConfigureDeliveryModal opens manual setup and preserves the parent refresh contract", async () => {
    const wrapper = shallowMount(ConfigureDeliveryModal, {
      props: { modelValue: true },
      global: {
        stubs: {
          Modal: ModalStub,
          AppButton: AppButtonStub,
          ShipbubbleAccountSetup: ShipbubbleSetupStub,
          ManageManualDeliveryModal: ManualModalStub,
        },
      },
    })
    await wrapper.findAll(".cursor-pointer")[1].trigger("click")
    const continueButton = wrapper
      .findAllComponents(AppButtonStub)
      .find((button) => button.props("label") === "Continue")!
    await continueButton.trigger("click")
    expect(wrapper.findComponent(ManualModalStub).props("modelValue")).toBe(true)
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]])
    wrapper.findComponent(ManualModalStub).vm.$emit("refresh")
    expect(wrapper.emitted("refresh")).toHaveLength(1)
  })

  it("ConfigureDeliveryModal skips account creation for an existing ShipBubble profile and closes to redirect", async () => {
    mocks.shippingProfile.value = {
      uid: "profile-1",
      preferred_couriers: [{ uid: "courier-1" }],
      store_name: "Smile Socks",
    }
    mocks.route.query = { redirect: "/settings/delivery" }
    const wrapper = shallowMount(ConfigureDeliveryModal, {
      props: { modelValue: true },
      global: {
        stubs: {
          Modal: ModalStub,
          AppButton: AppButtonStub,
          ShipbubbleAccountSetup: ShipbubbleSetupStub,
          ManageManualDeliveryModal: ManualModalStub,
        },
      },
    })
    const continueButton = wrapper
      .findAllComponents(AppButtonStub)
      .find((button) => button.props("label") === "Continue")!
    await continueButton.trigger("click")
    const setup = wrapper.findComponent(ShipbubbleSetupStub)
    expect(setup.props("currentStep")).toBe(2)
    expect(setup.props("courierOptions")).toEqual(["courier-1"])
    setup.vm.$emit("close")
    await flushPromises()
    expect(mocks.routerPush).toHaveBeenCalledWith("/settings/delivery")
  })

  it("ConfigureDeliveryModal normalizes a Nigerian phone number before account creation", async () => {
    mocks.storeDetails.value = {
      name: "Smile Socks",
      store_email: "owner@example.com",
      store_phone: "08012345678",
      locations: [{ address: "Lagos" }],
    }
    const wrapper = shallowMount(ConfigureDeliveryModal, {
      props: { modelValue: true },
      global: {
        stubs: {
          Modal: ModalStub,
          AppButton: AppButtonStub,
          ShipbubbleAccountSetup: ShipbubbleSetupStub,
          ManageManualDeliveryModal: ManualModalStub,
        },
      },
    })
    const continueButton = wrapper
      .findAllComponents(AppButtonStub)
      .find((button) => button.props("label") === "Continue")!
    await continueButton.trigger("click")
    wrapper.findComponent(ShipbubbleSetupStub).vm.$emit("submitAuthForm")
    expect(mocks.setupShippingProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        store_name: "Smile Socks",
        phone: "+2348012345678",
        preferred_couriers: [],
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })

  it("ShipbubbleAccountSetup validates account details, submits, and restores body scrolling", async () => {
    const validForm = {
      business_name: "Smile Socks",
      email: "owner@example.com",
      phone: "08012345678",
      password: "secret",
      address: "Lagos",
    }
    const wrapper = mount(ShipbubbleAccountSetup, {
      props: { authForm: validForm, currentStep: 1 },
      global: { stubs: { AppButton: AppButtonStub, GooglePlacesAutoComplete: GooglePlacesStub } },
    })
    expect(document.body.style.overflow).toBe("hidden")
    expect(wrapper.findComponent(AppButtonStub).props("disabled")).toBe(false)
    await wrapper.find("form").trigger("submit")
    expect(wrapper.emitted("submitAuthForm")).toHaveLength(1)
    await wrapper.setProps({ authForm: { ...validForm, business_name: "Shop 24" } })
    expect(wrapper.text()).toContain("Business name cannot contain numbers")
    expect(wrapper.findComponent(AppButtonStub).props("disabled")).toBe(true)
    await wrapper.find("button").trigger("click")
    expect(wrapper.emitted("close")).toHaveLength(1)
    wrapper.unmount()
    expect(document.body.style.overflow).toBe("")
  })

  it("ShipbubbleAccountSetup filters couriers, toggles selection, and emits completion", async () => {
    const selected: string[] = []
    const wrapper = mount(ShipbubbleAccountSetup, {
      props: { currentStep: 2, courierOptions: selected },
      global: { stubs: { AppButton: AppButtonStub, Checkbox: CheckboxStub } },
    })
    expect(wrapper.findAllComponents(CheckboxStub)).toHaveLength(2)
    await wrapper.find('input[name="search"]').setValue("fed")
    expect(wrapper.findAllComponents(CheckboxStub)).toHaveLength(1)
    expect(wrapper.text()).toContain("FedEx")
    await wrapper.findComponent(CheckboxStub).trigger("click")
    expect(selected).toEqual(["courier-2"])
    const complete = wrapper
      .findAllComponents(AppButtonStub)
      .find((button) => button.props("label") === "Complete Setup")!
    await complete.trigger("click")
    expect(wrapper.emitted("submitCouriers")).toEqual([[selected]])
  })

  it("ShipbubbleAccountSetup renders its terminal success state", () => {
    const wrapper = shallowMount(ShipbubbleAccountSetup, { props: { currentStep: 3 } })
    expect(wrapper.text()).toContain("Setup Complete!")
    expect(wrapper.text()).toContain("Returning to Leyyow...")
  })
})
