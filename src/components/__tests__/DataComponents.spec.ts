import { defineComponent, h } from "vue"
import { mount, shallowMount } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"

import DataTable from "@components/DataTable.vue"
import DonutChart from "@components/DonutChart.vue"
import MetricsGrid from "@components/MetricsGrid.vue"
import PageSummaryCards from "@components/PageSummaryCards.vue"

const IconStub = defineComponent({
  name: "Icon",
  props: { name: String },
  template: '<span class="icon-stub" :data-name="name" />',
})

const AppButtonStub = defineComponent({
  name: "AppButton",
  props: { label: String, disabled: Boolean, variant: String },
  emits: ["click"],
  template:
    '<button class="app-button-stub" :disabled="disabled" :data-variant="variant" @click="$emit(\'click\')"><slot>{{ label }}</slot></button>',
})

const EmptyStateStub = defineComponent({
  name: "EmptyState",
  props: { title: String, description: String, actionLabel: String },
  emits: ["action"],
  template:
    '<div class="empty-state-stub"><h3>{{ title }}</h3><p>{{ description }}</p><button v-if="actionLabel" @click="$emit(\'action\')">{{ actionLabel }}</button></div>',
})

const DoughnutStub = defineComponent({
  name: "Doughnut",
  props: { data: Object, options: Object },
  template: '<div class="doughnut-stub" />',
})

const BarStub = defineComponent({
  name: "Bar",
  props: { data: Object, options: Object },
  template: '<div class="bar-stub" />',
})

const ChipStub = defineComponent({
  name: "Chip",
  template: '<span class="chip-stub"><slot /></span>',
})

describe("data visualization and table components", () => {
  it("DataTable renders headers, fallback/custom cells, row classes, and row clicks", async () => {
    const rows = [
      { id: 1, name: "Ada", status: "active", note: "" },
      { id: 2, name: "Tobi", status: "paused", note: null },
    ]
    const wrapper = mount(DataTable, {
      props: {
        data: rows,
        columns: [
          { accessor: "name", header: "Name" },
          {
            accessor: "status",
            header: "Status",
            cell: ({ value }) => h("strong", { class: "status-cell" }, String(value)),
          },
          { accessor: "note", header: "Note" },
        ],
        showMobileView: false,
        showPagination: false,
        rowClass: (row) => `row-${String(row.status)}`,
        rowAttrs: (row) => ({ "data-row-id": row.id }),
      },
      global: {
        stubs: { Icon: IconStub, AppButton: AppButtonStub, EmptyState: EmptyStateStub },
      },
      attrs: { onRowClick: vi.fn() },
    })
    expect(wrapper.findAll("th").map((header) => header.text())).toEqual(["Name", "Status", "Note"])
    expect(wrapper.text()).toContain("Ada")
    expect(wrapper.findAll(".status-cell").map((cell) => cell.text())).toEqual(["active", "paused"])
    expect(wrapper.text()).toContain("--")
    expect(wrapper.find("tbody tr").classes()).toContain("row-active")
    expect(wrapper.find("tbody tr").classes()).toContain("cursor-pointer")
    expect(wrapper.find("tbody tr").attributes("data-row-id")).toBe("1")
    await wrapper.find("tbody tr").trigger("click")
    expect(wrapper.emitted("row-click")).toEqual([[rows[0]]])
  })

  it("DataTable renders custom slots and emits empty-state actions", async () => {
    const wrapper = mount(DataTable, {
      props: {
        data: [{ id: 1, name: "Bag" }],
        columns: [{ accessor: "name", header: "Product" }],
        showMobileView: false,
        showPagination: false,
      },
      slots: { "cell:name": ({ value }: { value: unknown }) => `Custom ${String(value)}` },
      global: {
        stubs: { Icon: IconStub, AppButton: AppButtonStub, EmptyState: EmptyStateStub },
      },
    })
    expect(wrapper.text()).toContain("Custom Bag")

    await wrapper.setProps({
      data: [],
      emptyState: { title: "No products", description: "Add one", actionLabel: "Add product" },
    })
    const empty = wrapper.findComponent(EmptyStateStub)
    expect(empty.text()).toContain("No products")
    await empty.find("button").trigger("click")
    expect(wrapper.emitted("empty-action")).toHaveLength(1)
  })

  it("DataTable emits selected rows and client pagination changes", async () => {
    const data = Array.from({ length: 6 }, (_, index) => ({
      id: index + 1,
      name: `Item ${index + 1}`,
    }))
    const wrapper = mount(DataTable, {
      props: {
        data,
        columns: [{ accessor: "name", header: "Name" }],
        enableRowSelection: true,
        showMobileView: false,
        itemsPerPage: 5,
      },
      global: {
        stubs: { Icon: IconStub, AppButton: AppButtonStub, EmptyState: EmptyStateStub },
      },
    })
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    await checkboxes[1].setValue(true)
    expect(wrapper.emitted("row-selection-change")?.at(-1)).toEqual([[data[0]]])

    const next = wrapper.findAll("button").at(-1)
    expect(next).toBeDefined()
    await next!.trigger("click")
    expect(wrapper.emitted("pagination-change")?.at(-1)).toEqual([
      { currentPage: 2, itemsPerPage: 5 },
    ])
  })

  it("DonutChart derives data, colors, radius, and size from its props", async () => {
    const wrapper = shallowMount(DonutChart, {
      props: { percentage: 65, label: "Complete", color: "#123456", size: "sm" },
      global: { stubs: { Doughnut: DoughnutStub, DoughnutChart: DoughnutStub } },
    })
    expect(wrapper.text()).toContain("65%")
    expect(wrapper.text()).toContain("Complete")
    expect(wrapper.attributes("style")).toContain("width: 200px")
    expect(wrapper.find("anonymous-stub").exists()).toBe(true)

    await wrapper.setProps({ percentage: 0 })
    expect(wrapper.text()).toContain("0%")
  })

  it("MetricsGrid renders values, comparisons, tags, charts, and loading feedback", async () => {
    const wrapper = shallowMount(MetricsGrid, {
      props: {
        items: [
          {
            label: "Revenue",
            value: "₦30,000",
            prev_value: "₦20,000",
            icon: "sales",
            chartData: [1, 3, 2],
            chartColor: "#b65702",
            labelTag: "Today",
            valueTag: "+10%",
          },
        ],
      },
      global: { stubs: { Icon: IconStub, Bar: BarStub, BarChart: BarStub } },
    })
    expect(wrapper.text()).toContain("Revenue")
    expect(wrapper.text()).toContain("₦30,000")
    expect(wrapper.text()).toContain("vs. ₦20,000 last mth")
    expect(wrapper.text()).toContain("Today")
    expect(wrapper.text()).toContain("+10%")
    expect(wrapper.find("anonymous-stub").exists()).toBe(true)

    await wrapper.setProps({ loading: true })
    expect(wrapper.text()).toContain("loading...")
  })

  it("PageSummaryCards formats number-led content and balances remainder layouts", () => {
    const wrapper = shallowMount(PageSummaryCards, {
      props: {
        defaultIcon: "sales",
        items: [
          {
            label: "Orders",
            value: { text: "12 orders", boldNumbers: true },
            prev_value: 8,
            icon: "box",
            chipText: { text: "4 pending", boldNumbers: true },
          },
          { label: "Revenue", value: "₦20,000", prev_value: "₦10,000", icon: "sales" },
          { label: "Customers", value: 5, prev_value: 3, icon: "users" },
        ],
      },
      global: { stubs: { Icon: IconStub, Chip: ChipStub } },
    })
    expect(wrapper.text()).toContain("Orders")
    expect(wrapper.find("strong").text()).toBe("12")
    expect(wrapper.find(".chip-stub").text()).toContain("4 pending")
    expect(wrapper.findAll(".grid > div")[2].classes()).toContain("col-span-2")
    expect(wrapper.text()).toContain("vs. 8 last wk")
  })
})
