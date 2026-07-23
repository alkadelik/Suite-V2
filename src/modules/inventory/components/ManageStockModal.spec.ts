import { defineComponent, reactive } from "vue"
import { shallowMount } from "@vue/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  resetForm: vi.fn(),
  setFieldValue: vi.fn(),
  stockChanged: vi.fn(),
  transferChanged: vi.fn(),
}))

vi.mock("vee-validate", () => ({
  useForm: () => ({
    handleSubmit: (callback: (values: unknown) => unknown) => callback,
    resetForm: mocks.resetForm,
    values: reactive({
      action: null,
      quantity: 0,
      unit_cost: "",
      note: "",
      loss_type: null,
      to_location: null,
    }),
    setFieldValue: mocks.setFieldValue,
  }),
}))
vi.mock("@vueuse/core", async () => {
  const { ref } = await import("vue")
  return { useMediaQuery: () => ref(false) }
})
vi.mock("@tanstack/vue-query", () => ({ useQueryClient: () => ({}) }))
vi.mock("../api", async () => {
  const { ref } = await import("vue")
  const mutation = () => ({ mutate: vi.fn(), isPending: ref(false) })
  return {
    useAddStock: mutation,
    useReduceStock: mutation,
    useDirectStockTransfer: mutation,
    useRequestStockTransfer: mutation,
  }
})
vi.mock("../cache", () => ({
  inventoryCache: {
    stockChanged: mocks.stockChanged,
    transferChanged: mocks.transferChanged,
  },
}))
vi.mock("@modules/settings/store", () => ({
  useSettingsStore: () => ({
    activeLocation: { uid: "location-1", is_hq: true },
    locations: [{ uid: "location-1", name: "HQ" }],
  }),
}))
vi.mock("@/composables/useFormatCurrency", () => ({
  useFormatCurrency: () => ({ format: (value: number) => `NGN ${value}` }),
}))
vi.mock("@/utils/product-attributes", () => ({
  getProductAttributesForSelect: () => [],
  findVariantByAttributes: () => null,
}))
vi.mock("../stock-form", () => ({
  getAddStockDefaults: () => ({ recordExpense: true, note: "", unitCost: "" }),
}))
vi.mock("@/composables/useToast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock("@/utils/error-handler", () => ({ displayError: vi.fn() }))

import ManageStockModal from "./ManageStockModal.vue"
import ManageStockSkeleton from "./skeletons/ManageStockSkeleton.vue"

const ModalStub = defineComponent({
  name: "Modal",
  props: { open: Boolean, title: String },
  emits: ["close"],
  template: '<section v-if="open"><slot/><footer><slot name="footer"/></footer></section>',
})

describe("ManageStockModal loading contract", () => {
  beforeEach(() => vi.clearAllMocks())

  it("opens immediately with a skeleton until product details are available", async () => {
    const wrapper = shallowMount(ManageStockModal, {
      props: { open: true, product: null, loading: true },
      global: { stubs: { Modal: ModalStub, Drawer: ModalStub } },
    })

    expect(wrapper.findComponent(ModalStub).props("open")).toBe(true)
    expect(wrapper.findComponent(ManageStockSkeleton).exists()).toBe(true)
    expect(wrapper.findComponent({ name: "FormField" }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: "AppButton" }).exists()).toBe(false)

    await wrapper.setProps({
      loading: false,
      product: {
        uid: "product-1",
        name: "Canvas Bag",
        images: [],
        variants: [
          {
            uid: "variant-1",
            price: "5000",
            sellable_stock: 10,
            available_stock: 10,
          },
        ],
      } as never,
    })

    expect(wrapper.findComponent(ManageStockSkeleton).exists()).toBe(false)
    expect(wrapper.findComponent({ name: "FormField" }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: "AppButton" }).exists()).toBe(true)
    expect(mocks.resetForm).toHaveBeenCalled()
  })

  it("replaces a failed load with a retry action", () => {
    const wrapper = shallowMount(ManageStockModal, {
      props: { open: true, product: null, loading: false, error: true },
      global: { stubs: { Modal: ModalStub, Drawer: ModalStub } },
    })

    expect(wrapper.findComponent(ManageStockSkeleton).exists()).toBe(false)
    expect(wrapper.text()).toContain("Unable to load stock details")
    const retry = wrapper
      .findAllComponents({ name: "AppButton" })
      .find((button) => button.props("label") === "Try Again")!
    retry.vm.$emit("click")
    expect(wrapper.emitted("retry")).toHaveLength(1)
  })
})
