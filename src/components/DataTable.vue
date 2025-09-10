<template>
  <div>
    <!-- table header and title -->
    <div v-if="props.title" class="hidden items-center justify-between px-1 py-4 md:flex">
      <h2 class="text-lg font-semibold">{{ props.title }}</h2>
    </div>
    <!--  -->
    <div class="hidden w-full overflow-x-auto px-px md:block">
      <table class="min-w-full border-0" :class="props.layout">
        <thead class="bg-gray-200">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th v-for="header in headerGroup.headers" :key="header.id" :colSpan="header.colSpan">
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
        <template v-if="loading && data.length">
          <tr>
            <td :colspan="columns.length" class="px-1 pt-2">
              <div class="bg-primary-50 h-1.5 w-full overflow-hidden rounded-xl">
                <div class="progress left-right bg-primary-500 h-full w-full rounded" />
              </div>
            </td>
          </tr>
        </template>
        <tbody v-if="data.length" :class="{ 'opacity-50': loading }">
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :class="[
              'text-core-800 cursor-pointer border-b border-gray-200 bg-white hover:bg-gray-50',
              { 'last:border-0': !showPagination },
            ]"
            @click="handleRowClick(row.original as T)"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="['p-4 text-sm', (cell.column.columnDef.meta as { class?: string })?.class]"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE TABLE with Responsive Slots -->
    <div class="space-y-4 md:hidden">
      <div
        v-for="row in table.getRowModel().rows"
        :key="row.id"
        :class="[
          'border-core-300 bg-core-25 rounded-xl border p-3',
          { 'cursor-pointer hover:bg-gray-50': true },
        ]"
        @click="handleRowClick(row.original as T)"
      >
        <!-- Custom mobile row layout (highest priority) -->
        <slot name="mobile-row" :item="row.original" :cells="getCellsForRow(row)" :row="row">
          <div class="flex items-start gap-3">
            <!-- Content Area (middle) -->
            <div class="min-w-0 flex-1">
              <slot
                name="mobile-content"
                :item="row.original"
                :cells="getCellsForRow(row)"
                :row="row"
              >
                <!-- Default content layout -->
                <div class="space-y-2">
                  <!-- Primary info -->
                  <div class="font-medium text-gray-900">
                    {{
                      getDisplayValue(row.original, "name") ||
                      getDisplayValue(row.original, "firstName") ||
                      "Unknown"
                    }}
                  </div>
                  <!-- Secondary info -->
                  <div class="space-y-1 text-sm text-gray-600">
                    <div v-if="getDisplayValue(row.original, 'email')">
                      {{ getDisplayValue(row.original, "email") }}
                    </div>
                    <div v-if="getDisplayValue(row.original, 'role')">
                      Role: {{ getDisplayValue(row.original, "role") }}
                    </div>
                  </div>
                </div>
              </slot>
            </div>

            <!-- Actions Section (right side) - Only render if slot has content -->
            <div
              v-if="$slots['mobile-actions'] || hasMobileActionsContent(row)"
              class="flex-shrink-0"
            >
              <slot
                name="mobile-actions"
                :item="row.original"
                :cells="getCellsForRow(row)"
                :row="row"
              >
                <!-- Default actions fallback -->
                <button class="rounded-md p-1.5 hover:bg-gray-100">
                  <Icon name="more-vertical" size="16" class="text-gray-500" />
                </button>
              </slot>
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- empty table -->
    <div v-if="!data.length" class="mx-auto flex w-full items-center justify-center px-4 py-16">
      <div v-if="loading" class="flex items-center justify-center">
        <Icon name="loader" size="80" class="text-primary-500 animate-spin" />
      </div>
      <div v-else class="flex max-w-screen-sm flex-col items-center">
        <Icon name="box" size="64" class="mb-3" />
        <h4 class="text-base font-semibold">No Data Available</h4>
        <p class="text-core-600 text-sm">There are currently no records to display.</p>
      </div>
    </div>

    <!-- pagination Controls -->
    <div
      v-if="data.length && showPagination"
      class="text-core-800 flex flex-col-reverse items-center justify-between gap-4 px-4 py-3 md:flex-row"
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

<script setup lang="ts" generic="T extends Record<string, unknown> = Record<string, unknown>">
import {
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useVueTable,
  createColumnHelper,
  type Table,
  type Row,
  type Cell,
} from "@tanstack/vue-table"
import { computed, h, onMounted, ref, useSlots, watch, type VNode } from "vue"
import Icon from "./Icon.vue"
import AppButton from "./AppButton.vue"

// Type definitions
export interface TableColumn<T = Record<string, unknown>> {
  accessor: keyof T | string
  header: string
  cell?: (props: {
    value: unknown
    item: T
  }) => VNode | string | number | boolean | null | undefined
  class?: string
}

interface PaginationChangeParams {
  currentPage: number
  itemsPerPage: number
}

interface Props {
  /** Optional title for the table */
  title?: string
  /** Array of data to display in the table */
  data: T[]
  /** Column definitions for the table */
  columns: TableColumn<T>[]
  /** Data to show when table is empty */
  emptyTableData?: Record<string, unknown>
  /** Whether the table is in loading state */
  loading?: boolean
  /** Enable row selection functionality */
  enableRowSelection?: boolean
  /** Search filter string for filtering table data */
  searchFilter?: string
  /** Function to set the search filter */
  setSearchFilter?: (filter: string) => void
  /** Enable server-side pagination */
  serverPagination?: boolean
  /** Show pagination controls */
  showPagination?: boolean
  /** Current page number (1-based) */
  currentPage?: number
  /** Number of items per page */
  itemsPerPage?: number
  /** Available options for items per page */
  perPageOptions?: number[]
  /** Total number of pages (for server pagination) */
  totalPageCount?: number
  /** Total number of items (for server pagination) */
  totalItemsCount?: number
  /** Table layout style */
  layout?: "table-auto" | "table-fixed"
}

// Define emits
interface Emits {
  /** Emitted when row selection changes */
  "row-selection-change": [selected: T[]]
  /** Emitted when a row is clicked */
  "row-click": [row: T]
  /** Emitted when pagination changes */
  "pagination-change": [params: PaginationChangeParams]
}

interface DataTableSlots<T> {
  [name: `cell:${string}`]: (props: {
    value: string | number | boolean | null | undefined | Record<string, unknown>
    item: T
  }) => VNode[]
  "mobile-row": (props: {
    item: T
    cells: Record<string, Cell<T, unknown>>
    row: Row<T>
  }) => VNode[]
  "mobile-avatar": (props: {
    item: T
    cells: Record<string, Cell<T, unknown>>
    row: Row<T>
  }) => VNode[]
  "mobile-content": (props: {
    item: T
    cells: Record<string, Cell<T, unknown>>
    row: Row<T>
  }) => VNode[]
  "mobile-actions": (props: {
    item: T
    cells: Record<string, Cell<T, unknown>>
    row: Row<T>
  }) => VNode[]
}

defineSlots<DataTableSlots<T>>()

const emit = defineEmits<Emits>()

const props = withDefaults(defineProps<Props>(), {
  data: () => [] as T[],
  emptyTableData: () => ({}),
  loading: false,
  enableRowSelection: false,
  searchFilter: "",
  serverPagination: false,
  showPagination: true,
  currentPage: 1,
  itemsPerPage: 10,
  perPageOptions: () => [5, 10, 25, 50, 100],
  totalPageCount: -1,
  layout: "table-auto",
})

const goToPageNumber = ref<number>()
const rowSelection = ref<Record<string, boolean>>({})
const slots = useSlots()
const data = computed(() => props.data)
const columnHelper = createColumnHelper<T>()

// Handler functions
const handleRowClick = (row: T) => {
  emit("row-click", row)
}

// Helper function to get cells organized by accessor for mobile slots
const getCellsForRow = (row: Row<T>) => {
  const cellsMap: Record<string, Cell<T, unknown>> = {}
  row.getVisibleCells().forEach((cell) => {
    cellsMap[String(cell.column.id)] = cell
  })
  return cellsMap
}

// Helper function to get display value from row data
const getDisplayValue = (item: T, key: string): string => {
  const value = item[key]
  if (value == null) return ""
  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch {
      return ""
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return String(value)
}

// Helper function to check if mobile actions slot has content
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const hasMobileActionsContent = (_row: Row<T>): boolean => {
  // This is a fallback check - in practice, the v-if="$slots['mobile-actions']" should handle most cases
  // But we keep this for any edge cases where we might want to conditionally show actions based on row data
  return false
}

const columns = [
  ...(props.enableRowSelection
    ? [
        {
          id: "select" as const,
          header: ({ table }: { table: Table<T> }) => {
            return h("input", {
              type: "checkbox",
              class: "h-3.5 w-3.5 cursor-pointer hidden md:inline-block accent-primary-600",
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            })
          },
          cell: ({ row }: { row: Row<T> }) => {
            return h("input", {
              type: "checkbox",
              class: "h-3.5 w-3.5 cursor-pointer accent-primary-600",
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              onChange: row.getToggleSelectedHandler(),
            })
          },
        },
      ]
    : []),
  ...props.columns.map((col) =>
    // @ts-expect-error - TanStack table has complex accessor typing that conflicts with our generic approach
    columnHelper.accessor(col.accessor, {
      header: col.header,
      meta: { class: col.class },
      cell: (info) => {
        const cellSlotName = `cell:${String(col.accessor)}`
        const [value, item] = [info.getValue(), info.row.original]

        if (slots[cellSlotName]) {
          return slots[cellSlotName]({ value, item })
        }

        if (col.cell) {
          const result = col.cell({ value, item })
          // If the result is already a VNode, return it as is
          // Otherwise, convert primitive values to text VNodes
          if (typeof result === "object" && result !== null) {
            return result // Assume it's a VNode
          }
          // Convert primitives to string and return as text
          return String(result)
        }

        return value || "--"
      },
    }),
  ),
]

const pagination = ref({ pageIndex: 0, pageSize: 10 })

const table = computed(() =>
  useVueTable<T>({
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
    if (newVal !== oldVal) {
      emit("pagination-change", { currentPage: 1, itemsPerPage: newVal })
    }
  },
)

watch(
  () => pagination.value.pageIndex,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      const [currentPage, itemsPerPage] = [newVal + 1, pagination.value.pageSize]
      emit("pagination-change", { currentPage, itemsPerPage })
    }
  },
)

// listen to rowSelection Changes
watch(rowSelection, (newVal) => {
  const selected = Object.keys(newVal)
    .map((n) => props.data[+n])
    .filter(Boolean)
  emit("row-selection-change", selected)
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
