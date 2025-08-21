<template>
  <div>
    <div class="w-full overflow-x-auto px-1">
      <table class="min-w-[1000px] border-0">
        <thead class="bg-gray-200">
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
            class="rounded-xl shadow-xs"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :colSpan="header.colSpan"
              class="first:rounded-l-xl last:rounded-r-xl"
            >
              <span
                class="text-core-700 flex gap-1 px-4 py-3 text-left text-sm font-medium whitespace-nowrap capitalize"
              >
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </span>
            </th>
          </tr>
        </thead>
        <tr v-if="loading && data.length">
          <td :colspan="columns.length" class="px-0">
            <div class="bg-primary-50 h-1.5 w-full overflow-hidden">
              <div class="progress left-right bg-primary-500 h-full w-full rounded" />
            </div>
          </td>
        </tr>
        <tbody v-if="data.length" :class="{ 'opacity-60': loading }">
          <tr class="h-2">
            <td :colspan="columns.length" class="p-0"></td>
          </tr>
          <template v-for="row in table.getRowModel().rows" :key="row.id">
            <tr
              :class="[
                'text-core-800 rounded-xl bg-white shadow-xs',
                { 'cursor-pointer hover:bg-gray-50': !!onRowClick },
              ]"
              @click="props.onRowClick?.(row.original as TableRowData)"
            >
              <td
                v-for="(cell, cellIndex) in row.getVisibleCells()"
                :key="cell.id"
                :class="[
                  'p-4 text-sm',
                  {
                    'rounded-l-xl': cellIndex === 0,
                    'rounded-r-xl': cellIndex === row.getVisibleCells().length - 1,
                  },
                  (cell.column.columnDef.meta as { class?: string })?.class,
                ]"
              >
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </td>
            </tr>
            <tr class="h-2">
              <td :colspan="columns.length" class="p-0"></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <!--  -->
    <!-- MOBILE TABLE -->
    <!--  -->
    <div className="px-1 space-y-6 md:hidden">
      <!-- <label
        for="select-all"
        class="inline-flex items-center gap-1 rounded border border-gray4 py-1 px-3 text-sm"
        v-if="enableRowSelection"
      >
        <input
          type="checkbox"
          class="h-3.5 w-3.5 cursor-pointer"
          :checked="table.getIsAllRowsSelected()"
          :indeterminate="table.getIsSomeRowsSelected()"
          @change="table.getToggleAllRowsSelectedHandler()"
        />
        Select All
      </label> -->
      <div
        v-for="row in table.getRowModel().rows"
        :key="row.id"
        :class="[
          'rounded-lg border border-gray-200',
          { 'cursor-pointer hover:bg-gray-50': !!onRowClick },
        ]"
        @click="props.onRowClick?.(row.original as TableRowData)"
      >
        <div
          v-for="cell in row.getVisibleCells()"
          :key="cell.id"
          class="flex justify-between gap-4 border-b border-gray-200 px-4 py-3 text-sm last:border-0"
        >
          <span className="font-medium text-gray-600">
            <FlexRender :render="cell.column.columnDef.header" :props="cell.getContext()" />
          </span>
          <span className="text-right text-gray-900">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </span>
        </div>
      </div>
    </div>

    <!-- empty table -->
    <div v-if="!data.length" class="mx-auto flex w-full items-center justify-center px-4 py-16">
      <div v-if="loading" class="flex items-center justify-center">
        <Icon name="loader" class="text-primary-500 h-20 w-20 animate-spin" />
      </div>
      <div v-else class="flex max-w-screen-sm flex-col items-center gap-3 text-gray-600">
        <div class="relative h-24 w-24">
          <Icon name="star" class="h-28 w-28 text-gray-300" />
          <Icon name="box" class="absolute right-0 bottom-1 h-12 w-12 text-gray-900" />
        </div>
        <p class="text-base font-semibold">No Data Available</p>
        <p class="text-sm">There are currently no records to display.</p>
      </div>
    </div>

    <!--  -->
    <!-- pagination section -->
    <!--  -->
    <div
      v-if="data.length && showPagination"
      class="flex flex-col-reverse items-center justify-between gap-4 px-4 py-3 md:flex-row"
    >
      <!-- Select Entries PerPage -->
      <div class="inline-flex items-center gap-1 text-sm">
        Entries Per Page
        <select
          :value="table.getState().pagination.pageSize"
          @change="handlePageSizeChange"
          class="inline-flex h-8 cursor-pointer items-center rounded border border-gray-300 px-1 outline-none focus:ring-0"
        >
          <option v-for="pageSize in perPageOptions" :key="pageSize" :value="pageSize">
            {{ pageSize }}
          </option>
        </select>
      </div>

      <!-- Jump to page  -->
      <div class="inline-flex items-center gap-1 text-sm">
        <span class="flex items-center gap-1 text-sm">
          <div>Page</div>
          <strong>
            {{ table.getState().pagination.pageIndex + 1 }} of
            {{ table.getPageCount() }}
          </strong>
        </span>
        |
        <span class="inline-flex items-center gap-1 text-sm">
          Go to:
          <input
            type="number"
            :min="1"
            :max="table.getPageCount()"
            :value="goToPageNumber"
            @change="handleGoToPage"
            class="h-8 w-16 items-center rounded-[6px] border border-gray-300 px-3 outline-none focus:ring-0"
          />
        </span>
      </div>

      <!-- Pagination buttons -->
      <div class="flex items-center gap-2">
        <AppButton
          size="xs"
          variant="outlined"
          icon="chevron-first"
          @click="table.setPageIndex(0)"
          :disabled="!table.getCanPreviousPage()"
        />
        <AppButton
          size="xs"
          variant="outlined"
          icon="chevron-left"
          @click="table.previousPage()"
          :disabled="!table.getCanPreviousPage()"
        />
        <div className="text-sm" v-if="!serverPagination || (serverPagination && totalItemsCount)">
          <b>
            {{
              table.getState().pagination.pageIndex > 0
                ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
                : table.getState().pagination.pageIndex + 1
            }}
          </b>
          -
          <b>
            {{
              Math.min(
                table.getState().pagination.pageSize * (table.getState().pagination.pageIndex + 1),
                totalItemsCount || table.getCoreRowModel().rows.length,
              )
            }}
          </b>
          of
          <b>
            {{ totalItemsCount || table.getCoreRowModel().rows.length }}
          </b>
        </div>
        <AppButton
          size="xs"
          variant="outlined"
          icon="chevron-right"
          :disabled="!table.getCanNextPage()"
          @click="() => table.nextPage()"
        />
        <AppButton
          size="xs"
          variant="outlined"
          icon="chevron-last"
          @click="table.setPageIndex(table.getPageCount() - 1)"
          :disabled="!table.getCanNextPage()"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useVueTable,
  createColumnHelper,
  type Table,
  type Row,
} from "@tanstack/vue-table"
import { computed, h, onMounted, ref, useSlots, watch, type VNode } from "vue"
import Icon from "./Icon.vue"
import AppButton from "./AppButton.vue"

// Type definitions
export interface TableColumn {
  accessor: string
  header: string
  cell?: (props: { value: unknown; item: unknown }) => VNode
  class?: string
}

interface PaginationChangeParams {
  currentPage: number
  itemsPerPage: number
}

interface TableRowData {
  [key: string]: unknown
}

interface Props {
  data: TableRowData[]
  columns: TableColumn[]
  emptyTableData?: Record<string, unknown>
  loading?: boolean
  enableRowSelection?: boolean
  onRowSelectionChange?: (selected: TableRowData[]) => void
  onRowClick?: (row: TableRowData) => void
  searchFilter?: string
  setSearchFilter?: (filter: string) => void
  serverPagination?: boolean
  showPagination?: boolean
  currentPage?: number
  itemsPerPage?: number
  perPageOptions?: number[]
  totalPageCount?: number
  totalItemsCount?: number
  onPaginationChange?: (params: PaginationChangeParams) => void
  layout?: "table-auto" | "table-fixed"
}

const goToPageNumber = ref<number>()
const rowSelection = ref<Record<string, boolean>>({})

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  emptyTableData: () => ({}),
  loading: false,
  enableRowSelection: false,
  onRowSelectionChange: () => () => {},
  searchFilter: "",
  serverPagination: false,
  showPagination: true,
  currentPage: 1,
  itemsPerPage: 10,
  perPageOptions: () => [5, 10, 25, 50, 100],
  totalPageCount: -1,
  onPaginationChange: () => () => {},
  layout: "table-auto",
})

const slots = useSlots()
const data = computed(() => props.data)
const columnHelper = createColumnHelper<TableRowData>()

const columns = [
  ...(props.enableRowSelection
    ? [
        {
          id: "select" as const,
          header: ({ table }: { table: Table<TableRowData> }) => {
            return h("input", {
              type: "checkbox",
              class: "h-3.5 w-3.5 cursor-pointer hidden md:inline-block",
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            })
          },
          cell: ({ row }: { row: Row<TableRowData> }) => {
            return h("input", {
              type: "checkbox",
              class: "h-3.5 w-3.5 cursor-pointer",
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              onChange: row.getToggleSelectedHandler(),
            })
          },
        },
      ]
    : []),
  ...props.columns.map((col) =>
    columnHelper.accessor(col.accessor, {
      header: col.header,
      meta: { class: col.class },
      cell: (info) => {
        const cellSlotName = `cell:${col.accessor}`
        const [value, item] = [info.getValue(), info.row.original]
        return slots[cellSlotName]
          ? slots[cellSlotName]({ value, item })
          : col.cell
            ? col.cell({ value, item })
            : value || "--"
      },
    }),
  ),
]

const pagination = ref({ pageIndex: 0, pageSize: 10 })

const table = computed(() =>
  useVueTable<TableRowData>({
    get data() {
      return data.value
    },
    columns,
    state: {
      get rowSelection() {
        return rowSelection.value
      },
      get pagination() {
        return pagination.value
      },
    },
    enableRowSelection: props.enableRowSelection,
    onRowSelectionChange: (updateOrValue) => {
      rowSelection.value =
        typeof updateOrValue === "function" ? updateOrValue(rowSelection.value) : updateOrValue
    },
    onPaginationChange: (updater) => {
      pagination.value = updater instanceof Function ? updater(pagination.value) : updater
    },
    getCoreRowModel: getCoreRowModel(),
    ...(props.serverPagination
      ? { manualPagination: true, pageCount: props.totalPageCount }
      : { getPaginationRowModel: getPaginationRowModel() }),
  }),
)

watch(
  () => pagination.value.pageSize,
  (newVal, oldVal) => {
    console.log({ newVal, oldVal })
    if (newVal !== oldVal) {
      props.onPaginationChange?.({ currentPage: 1, itemsPerPage: newVal })
    }
  },
)

watch(
  () => pagination.value.pageIndex,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      const [currentPage, itemsPerPage] = [newVal + 1, pagination.value.pageSize]
      props.onPaginationChange?.({ currentPage, itemsPerPage })
    }
  },
)

// listen to rowSelection Changes
watch(rowSelection, (newVal) => {
  const selected = Object.keys(newVal)
    .map((n) => props.data[+n])
    .filter(Boolean)
  props.onRowSelectionChange?.(selected)
})

const handleGoToPage = (e: Event) => {
  const target = e.target as HTMLInputElement
  let page = target.value ? Number(target.value) - 1 : 0
  // prevent entering page beyond max page
  if (page >= table.value.getPageCount()) {
    page = table.value.getPageCount() - 1
  }
  goToPageNumber.value = page + 1
  table.value.setPageIndex(page)
}

const handlePageSizeChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  table.value.setPageSize(Number(target.value))
}

onMounted(() => {
  pagination.value = {
    pageIndex: props.currentPage - 1,
    pageSize: props.itemsPerPage,
  }
})
</script>

<style scoped>
.progress {
  animation: progress 1.5s infinite linear;
}
.left-right {
  transform-origin: 0% 50%;
}
@keyframes progress {
  0% {
    transform: translateX(0) scaleX(0);
  }
  40% {
    transform: translateX(0) scaleX(0.4);
  }
  100% {
    transform: translateX(100%) scaleX(0.5);
  }
}
</style>
