import { defineComponent } from "vue"
import { shallowMount } from "@vue/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  fetchNextPage: vi.fn(() => Promise.resolve()),
  infiniteScrollCallback: undefined as undefined | (() => Promise<void>),
  infiniteScrollDistance: 0,
  hasNextPageRef: undefined as unknown as { value: boolean },
  fetchingNextPageRef: undefined as unknown as { value: boolean },
  productData: {
    pages: [
      {
        count: 40,
        next: "/inventory/catalog/?limit=20&offset=20",
        results: [
          { uid: "product-1", name: "Canvas Bag", images: [], variants: [] },
          { uid: "product-2", name: "Smile Socks", images: [], variants: [] },
        ],
      },
    ],
  },
}))

vi.mock("@vueuse/core", () => ({
  onClickOutside: vi.fn(),
  useInfiniteScroll: (
    _element: unknown,
    callback: () => Promise<void>,
    options: { distance: number },
  ) => {
    mocks.infiniteScrollCallback = callback
    mocks.infiniteScrollDistance = options.distance
  },
}))
vi.mock("@/composables/useDebouncedRef", () => ({ useDebouncedRef: (source: unknown) => source }))
vi.mock("@/composables/useFormatCurrency", () => ({
  useFormatCurrency: () => ({ format: (value: number) => `NGN ${value}` }),
}))
vi.mock("@modules/inventory/api", async () => {
  const { ref } = await import("vue")
  return {
    useGetProductCatalogsInfinite: () => {
      mocks.hasNextPageRef = ref(true)
      mocks.fetchingNextPageRef = ref(false)
      return {
        data: ref(mocks.productData),
        isPending: ref(false),
        isFetchingNextPage: mocks.fetchingNextPageRef,
        fetchNextPage: mocks.fetchNextPage,
        hasNextPage: mocks.hasNextPageRef,
      }
    },
    useGetCategories: () => ({ data: ref({ data: { results: [] } }), isFetching: ref(false) }),
  }
})

import TargetSelector from "./TargetSelector.vue"

const IconStub = defineComponent({
  name: "Icon",
  props: { name: String },
  template: '<span :data-icon="name" />',
})

describe("TargetSelector product pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.infiniteScrollCallback = undefined
    mocks.infiniteScrollDistance = 0
  })

  it("uses the shared infinite catalogue pagination and exposes next-page feedback", async () => {
    const wrapper = shallowMount(TargetSelector, {
      props: {
        modelValue: {
          mode: "products",
          productUids: [],
          variantSelections: {},
          categoryUids: [],
        },
      },
      global: { stubs: { Icon: IconStub } },
    })

    const productTrigger = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Select at least one"))!
    await productTrigger.trigger("click")
    expect(wrapper.findAll("li")).toHaveLength(2)
    expect(wrapper.text()).toContain("Canvas Bag")
    expect(mocks.infiniteScrollDistance).toBe(80)

    await mocks.infiniteScrollCallback?.()
    expect(mocks.fetchNextPage).toHaveBeenCalledOnce()

    mocks.fetchingNextPageRef.value = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain("Loading more products...")

    mocks.hasNextPageRef.value = false
    await mocks.infiniteScrollCallback?.()
    expect(mocks.fetchNextPage).toHaveBeenCalledOnce()
  })
})
