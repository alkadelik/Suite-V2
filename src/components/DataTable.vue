<script setup lang="ts" generic="T extends Record<string, unknown> = Record<string, unknown>">
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
import EmptyState from "./EmptyState.vue"

// Type definitions
export interface TableColumn<T = Record<string, unknown>> {
  accessor: keyof T | string
  header: string
  cell?: (props: {
    value: unknown
    item: T
  }) => VNode | string | number | boolean | null | undefined
  class?: string
  maxWidth?: string
}

export type RowClass<T = Record<string, unknown>> = string | ((row: T) => string)

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
  /** Custom empty state props */
  emptyState?: {
    icon?: string
    title?: string
    description?: string
    actionLabel?: string
    actionIcon?: string
  }
  /** Additional CSS classes for the table container */
  class?: string

  /** Hide total items count in title */
  hideTotal?: boolean
  /** Fix the first column during horizontal scroll */
  fixFirstColumn?: boolean
  /** Fix the last column during horizontal scroll */
  fixLastColumn?: boolean
  /** CSS class(es) to apply to each row - can be a string or function that receives row data */
  rowClass?: RowClass<T>
}

// Define emits
interface Emits {
  /** Emitted when row selection changes */
  "row-selection-change": [selected: T[]]
  /** Emitted when a row is clicked */
  "row-click": [row: T]
  /** Emitted when pagination changes */
  "pagination-change": [params: PaginationChangeParams]
  /** Emitted when empty state action is clicked */
  "empty-action": []
}

interface DataTableSlots<T> {
  /** Custom mobile card rendering */
  mobile?: (props: { item: T }) => VNode[]
  /** Dynamic cell slots for custom cell rendering */
  [name: `cell:${string}`]: (props: {
    value: string | number | boolean | null | undefined | Record<string, unknown>
    item: T
  }) => VNode[]
}

defineSlots<DataTableSlots<T>>()

const emit = defineEmits<Emits>()

const props = withDefaults(defineProps<Props>(), {
  data: () => [] as T[],
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
  fixFirstColumn: false,
  fixLastColumn: false,
})

const rowSelection = ref<Record<string, boolean>>({})
const slots = useSlots()
const data = computed(() => props.data)
const columnHelper = createColumnHelper<T>()

// Handler functions
const handleRowClick = (row: T) => {
  emit("row-click", row)
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
      meta: { class: col.class, maxWidth: col.maxWidth },
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

// Computed property for pagination pages
const paginationPages = computed(() => {
  const currentPage = table.value.getState().pagination.pageIndex + 1
  const totalPages = table.value.getPageCount()
  const pages: (number | string)[] = []

  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    if (currentPage <= 4) {
      // Current page is near the beginning
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      pages.push("...")
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 3) {
      // Current page is near the end
      pages.push("...")
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Current page is in the middle
      pages.push("...")
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push("...")
      pages.push(totalPages)
    }
  }

  return pages
})

onMounted(() => {
  pagination.value = { pageIndex: props.currentPage - 1, pageSize: props.itemsPerPage }
})

// Helper function to determine if a column should be fixed
const isFixedColumn = (index: number, totalColumns: number) => {
  if (props.fixFirstColumn && index === 0) return "left"
  if (props.fixLastColumn && index === totalColumns - 1) return "right"
  return null
}

// Helper function to get fixed column classes
const getFixedColumnClasses = (position: "left" | "right" | null) => {
  if (!position) return ""
  const baseClasses = "sticky bg-white z-5"
  if (position === "left") {
    return `${baseClasses} left-0 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]`
  }
  return `${baseClasses} right-0 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]`
}

// Helper function to compute row classes
const getRowClasses = (row: T) => {
  if (!props.rowClass) return ""
  return typeof props.rowClass === "function" ? props.rowClass(row) : props.rowClass
}
</script>

<template>
  <div class="w-full overflow-hidden" :class="props.class">
    <!--  -->
    <div class="hidden w-full overflow-x-auto md:block">
      <table class="min-w-full border-0" :class="props.layout">
        <thead class="bg-gray-50">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="(header, headerIndex) in headerGroup.headers"
              :key="header.id"
              :colSpan="header.colSpan"
              :class="getFixedColumnClasses(isFixedColumn(headerIndex, headerGroup.headers.length))"
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
        <template v-if="loading && (data.length || table.getPageCount() > 1)">
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
            :class="['text-core-700 border-t border-gray-200', getRowClasses(row.original as T)]"
            @click="handleRowClick(row.original as T)"
          >
            <td
              v-for="(cell, cellIndex) in row.getVisibleCells()"
              :key="cell.id"
              :class="[
                'p-4 text-sm',
                (cell.column.columnDef.meta as { class?: string })?.class,
                getFixedColumnClasses(isFixedColumn(cellIndex, row.getVisibleCells().length)),
              ]"
              :style="
                (cell.column.columnDef.meta as { maxWidth?: string })?.maxWidth
                  ? { maxWidth: (cell.column.columnDef.meta as { maxWidth?: string }).maxWidth }
                  : {}
              "
            >
              <div class="truncate">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-if="!data.length"
        class="mx-auto flex w-full flex-col items-center justify-center px-4 py-16 md:bg-white"
      >
        <div v-if="loading" class="flex items-center justify-center">
          <Icon name="loader" size="80" class="text-primary-500 animate-spin" />
        </div>
        <EmptyState
          v-else
          :icon="props.emptyState?.icon || 'box'"
          :title="props.emptyState?.title || 'No Data Available'"
          :description="
            props.emptyState?.description || 'There are currently no records to display.'
          "
          :action-label="props.emptyState?.actionLabel"
          :action-icon="props.emptyState?.actionIcon"
          size="md"
          class="!min-h-[auto] !shadow-none"
          @action="$emit('empty-action')"
        />
      </div>
    </div>

    <!--  -->
    <!-- MOBILE TABLE -->
    <!--  -->
    <div class="space-y-4 md:hidden">
      <!-- Loading progress bar for mobile when there's data -->
      <template v-if="loading && (data.length || table.getPageCount() > 1)">
        <div class="px-1">
          <div class="bg-primary-50 h-1.5 w-full overflow-hidden rounded-xl">
            <div class="progress left-right bg-primary-500 h-full w-full rounded" />
          </div>
        </div>
      </template>

      <!-- Mobile cards with loading opacity -->
      <div v-if="data.length" :class="[{ 'opacity-50': loading }, 'flex flex-col gap-4']">
        <div v-for="row in table.getRowModel().rows" :key="row.id">
          <!-- Custom mobile card slot -->
          <slot name="mobile" :item="row.original">
            <!-- default mobile card layout -->
            <div
              :class="[
                'my-3 rounded-lg border border-gray-200',
                { 'cursor-pointer hover:bg-gray-50': true },
                getRowClasses(row.original as T),
              ]"
              @click="handleRowClick(row.original as T)"
            >
              <div
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="flex justify-between gap-4 border-b border-gray-200 px-4 py-3 text-sm last:border-0"
              >
                <span class="text-core-600 font-medium">
                  <FlexRender :render="cell.column.columnDef.header" :props="cell.getContext()" />
                </span>
                <span class="text-core-800 text-right">
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </span>
              </div>
            </div>
          </slot>
        </div>
      </div>

      <!-- Empty state for mobile -->
      <div
        v-if="!data.length"
        class="mx-auto flex w-full flex-col items-center justify-center px-4 py-16"
      >
        <div v-if="loading" class="flex items-center justify-center">
          <Icon name="loader" size="80" class="text-primary-500 animate-spin" />
        </div>
        <EmptyState
          v-else
          :icon="props.emptyState?.icon || 'box'"
          :title="props.emptyState?.title || 'No Data Available'"
          :description="
            props.emptyState?.description || 'There are currently no records to display.'
          "
          :action-label="props.emptyState?.actionLabel"
          :action-icon="props.emptyState?.actionIcon"
          size="md"
          class="!min-h-[auto] !shadow-none"
          @action="$emit('empty-action')"
        />
      </div>
    </div>

    <!--  -->
    <!-- pagination Controls -->
    <!--  -->
    <div
      v-if="data.length && showPagination"
      class="text-core-800 items-center justify-between gap-4 border-gray-200 px-5 py-6 md:border-t"
      :class="`flex`"
    >
      <!-- Pagination buttons -->

      <!-- Previous button -->
      <AppButton
        size="xs"
        color="alt"
        @click="table.previousPage()"
        :disabled="!table.getCanPreviousPage()"
        icon="arrow-narrow-left"
        label="Previous"
      />

      <!-- Page numbers -->
      <div class="flex items-center gap-2">
        <template v-for="page in paginationPages" :key="page">
          <span v-if="page === '...'" class="px-2 py-1 text-sm text-gray-500">...</span>
          <AppButton
            v-else
            size="xs"
            color="alt"
            :variant="page === table.getState().pagination.pageIndex + 1 ? 'outlined' : 'text'"
            @click="table.setPageIndex(Number(page) - 1)"
            class="px-3 py-1"
          >
            {{ page }}
          </AppButton>
        </template>
      </div>

      <!-- Next button -->
      <AppButton
        size="xs"
        color="alt"
        :disabled="!table.getCanNextPage()"
        @click="() => table.nextPage()"
        icon="arrow-right"
        class="flex-row-reverse"
        label="Next"
      />
    </div>
  </div>
</template>

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
