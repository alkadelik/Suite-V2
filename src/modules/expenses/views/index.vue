<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import DataTable from "@components/DataTable.vue"
import Tabs from "@components/Tabs.vue"
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import SectionHeader from "@components/SectionHeader.vue"
import PageHeader from "@components/PageHeader.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref, watch } from "vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Chip from "@components/Chip.vue"
import { TExpense, TExpenseFilters } from "../types"
import CreateExpenseDrawer from "../components/CreateExpenseDrawer.vue"
import {
  useBulkCompleteExpenses,
  useDeleteExpense,
  useEditExpense,
  useGetExpenseDashboard,
  useGetExpenses,
} from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import {
  EXPENSE_CATEGORY_ICON,
  EXPENSE_COLUMN,
  getExpenseStatusColor,
  isTaxCategory,
  isTaxLikeSubcategory,
  PAYABLE_STATUSES,
  PAYABLE_SUB_TABS,
  PAYABLE_SUB_TAB_NOUN,
} from "../constants"
import { useExpenseCategories } from "../composables"
import { useRoute } from "vue-router"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { usePremiumAccess } from "@/composables/usePremiumAccess"
import ExpenseCard from "../components/ExpenseCard.vue"
import Icon from "@components/Icon.vue"
import ExpenseDetailsDrawer from "../components/ExpenseDetailsDrawer.vue"
import StatCard from "@components/StatCard.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import ExpenseStackedBarChart from "../components/ExpenseStackedBarChart.vue"
import ExpenseFiltersDrawer from "../components/ExpenseFiltersDrawer.vue"

const { format, truncate } = useFormatCurrency()

const openCreate = ref(false)
const openDelete = ref(false)
const openVoid = ref(false)
const openMarkPaid = ref(false)
const openDetail = ref(false)
const selectedExpense = ref<TExpense | null>(null)

const currentMonthRange = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const pad = (n: number) => String(n).padStart(2, "0")
  const dateAfter = `${year}-${pad(month + 1)}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const dateBefore = `${year}-${pad(month + 1)}-${pad(lastDay)}`
  return { date_after: dateAfter, date_before: dateBefore }
})

const currentMonthLabel = computed(() =>
  new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
)

const isMobile = useMediaQuery("(max-width: 1024px)")

const showFilter = ref(false)

const pageTabs = [
  { title: "All", key: "all" },
  { title: "Payables", key: "payables" },
]
const activeTab = ref("all")
const isPayablesTab = computed(() => activeTab.value === "payables")

// Payables is segmented by what's owed for. Taxes are a category of their own;
// shipping is the "Shipping and handling" sub-category under Sales Expenses — both
// resolved to uids by name so nothing is hardcoded.
const payablesSubTab = ref(PAYABLE_SUB_TABS[0].key)
const { taxCategoryUids, shippingSubCategoryUids } = useExpenseCategories()

const subTabNoun = computed(() => PAYABLE_SUB_TAB_NOUN[payablesSubTab.value] || "payables")

/** Taxes/Shipping — a bucket that is itself a category filter */
const isBucketSubTab = computed(() => isPayablesTab.value && payablesSubTab.value !== "all")

// The bucket's own filter, layered on top of the payable statuses
const subTabParams = computed<TExpenseFilters>(() => {
  const params: TExpenseFilters = {}
  if (!isPayablesTab.value) return params
  if (payablesSubTab.value === "taxes") params.category = [...taxCategoryUids.value]
  else if (payablesSubTab.value === "shipping")
    params.sub_category = [...shippingSubCategoryUids.value]
  return params
})

// Until the categories land there's no uid to filter on, and querying without one
// would show every payable under a bucket heading.
const isSubTabReady = computed(() => {
  if (!isPayablesTab.value) return true
  if (payablesSubTab.value === "taxes") return taxCategoryUids.value.length > 0
  if (payablesSubTab.value === "shipping") return shippingSubCategoryUids.value.length > 0
  return true
})

const page = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 750)
const activeFilters = ref<TExpenseFilters>({})

// Multi-value facets live under a single key, so count the selections themselves —
// three statuses should read as 3 on the badge, not 1.
const activeFilterCount = computed(() =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  Object.values(activeFilters.value).reduce<number>(
    (total, value) => total + (Array.isArray(value) ? value.length : 1),
    0,
  ),
)

const handleApplyFilters = (filters: TExpenseFilters) => {
  activeFilters.value = filters
  page.value = 1
}

// All tab: current-month summary. Payables tab: totals for outstanding expenses
// matching the applied filters/search (no date range)
const statsParams = computed(() => {
  if (isPayablesTab.value) {
    const params: TExpenseFilters = { ...activeFilters.value, status: PAYABLE_STATUSES }
    if (debouncedSearch.value) params.search = debouncedSearch.value
    return params
  }
  return currentMonthRange.value
})

const {
  data: expenseDashboard,
  isPending: isLoadingStats,
  refetch: refetchStats,
} = useGetExpenseDashboard(statsParams)

// The payables cards break the same total down by bucket. Taxes and shipping each need
// their own aggregate — the stats response only breaks down by category, which can't
// isolate a sub-category — and "other" is whatever the two don't account for.
const taxStatsParams = computed<TExpenseFilters>(() => ({
  ...statsParams.value,
  category: [...taxCategoryUids.value],
}))
const shippingStatsParams = computed<TExpenseFilters>(() => ({
  ...statsParams.value,
  sub_category: [...shippingSubCategoryUids.value],
}))

const { data: taxStats, refetch: refetchTaxStats } = useGetExpenseDashboard(
  taxStatsParams,
  () => isPayablesTab.value && taxCategoryUids.value.length > 0,
)
const { data: shippingStats, refetch: refetchShippingStats } = useGetExpenseDashboard(
  shippingStatsParams,
  () => isPayablesTab.value && shippingSubCategoryUids.value.length > 0,
)

const payableBuckets = computed(() => {
  const total = {
    amount: expenseDashboard.value?.current.total_amount || 0,
    count: expenseDashboard.value?.current.expense_count || 0,
  }
  const taxes = {
    amount: taxStats.value?.current.total_amount || 0,
    count: taxStats.value?.current.expense_count || 0,
  }
  const shipping = {
    amount: shippingStats.value?.current.total_amount || 0,
    count: shippingStats.value?.current.expense_count || 0,
  }
  return {
    total,
    taxes,
    shipping,
    other: {
      amount: Math.max(total.amount - taxes.amount - shipping.amount, 0),
      count: Math.max(total.count - taxes.count - shipping.count, 0),
    },
  }
})

const expenseCountChip = (count: number) => `${count} expense${count === 1 ? "" : "s"}`

const expenseMetrics = computed(() => {
  const stat = expenseDashboard?.value

  if (isPayablesTab.value) {
    const { total, taxes, shipping, other } = payableBuckets.value
    const amount = (value: number) => (isMobile.value ? truncate(value) : format(value))

    return [
      {
        label: "Total Payables",
        value: amount(total.amount),
        chip: expenseCountChip(total.count),
        chipColor: "blue",
        icon: "wallet-money",
        iconClass: "md:text-orange-700",
      },
      {
        label: "Unpaid Taxes",
        value: amount(taxes.amount),
        chip: expenseCountChip(taxes.count),
        chipColor: "blue",
        icon: "receipt-text",
        iconClass: "md:text-blue-700",
      },
      {
        label: "Unpaid Shipping",
        value: amount(shipping.amount),
        chip: expenseCountChip(shipping.count),
        chipColor: "blue",
        icon: "truck-fast",
        iconClass: "md:text-purple-700",
      },
      {
        label: "Other Unpaid",
        value: amount(other.amount),
        chip: expenseCountChip(other.count),
        chipColor: "blue",
        icon: "category",
        iconClass: "md:text-green-700",
      },
    ]
  }

  const biggestExpenseCategory = stat?.category_breakdown?.length
    ? stat.category_breakdown.reduce((prev, current) =>
        current.total_amount > prev.total_amount ? current : prev,
      )
    : null

  return [
    {
      label: "Total Expenses",
      value: isMobile.value
        ? truncate(stat?.current.total_amount || 0)
        : format(stat?.current.total_amount || 0),
      icon: "wallet-money",
      iconClass: "md:text-green-700",
      // percentage: stat?.change.total_amount_pct || undefined,
    },
    {
      label: isMobile.value ? "Biggest Category" : "Largest Category",
      value: format(biggestExpenseCategory?.total_amount || 0),
      chip: biggestExpenseCategory ? biggestExpenseCategory.category_name : "N/A",
      chipColor: "blue",
      icon: "moneys-solid",
      iconClass: "md:text-blue-700",
    },
  ]
})

const computedParams = computed(() => {
  const params: TExpenseFilters = {}
  if (debouncedSearch.value) params.search = debouncedSearch.value
  params.offset = ((debouncedSearch.value ? 0 : page.value - 1) * itemsPerPage.value).toString()
  params.limit = itemsPerPage.value.toString()
  Object.assign(params, activeFilters.value)
  // Payables shows only outstanding expenses — this overrides any status picked in the filter drawer
  if (isPayablesTab.value) params.status = PAYABLE_STATUSES
  // The sub-tab owns the bucket, so it wins over a category picked in the drawer too
  Object.assign(params, subTabParams.value)
  return params
})

// Switching tabs restarts pagination and drops filters, search and selection.
// The table owns the checkboxes, so clear there and let it emit the empty selection.
watch(activeTab, () => {
  page.value = 1
  payablesSubTab.value = PAYABLE_SUB_TABS[0].key
  activeFilters.value = {}
  searchQuery.value = ""
  dataTableRef.value?.clearRowSelection()
  selectedPayables.value = []
})

// A bucket is its own category filter, so one carried over from All would be invisible
// in the drawer and could contradict the bucket. Drop it on the way in.
watch(isBucketSubTab, (isBucket) => {
  if (!isBucket) return
  const rest = { ...activeFilters.value }
  delete rest.category
  delete rest.sub_category
  activeFilters.value = rest
})

// Switching bucket keeps the filters/search but restarts paging, and the selection
// can't carry over — those rows are no longer on screen to unselect.
watch(payablesSubTab, () => {
  page.value = 1
  dataTableRef.value?.clearRowSelection()
  selectedPayables.value = []
})

const {
  data: expenses,
  isPending,
  isFetching,
  refetch,
} = useGetExpenses(computedParams, isSubTabReady)
const { checkPremiumAccess } = usePremiumAccess()

// Payables multi-select (rows come from DataTable's row-selection)
const dataTableRef = ref<{ selectAllRows: () => void; clearRowSelection: () => void } | null>(null)
const selectedPayables = ref<TExpense[]>([])
const openBulkPaid = ref(false)

const { mutate: bulkCompleteExpenses, isPending: isBulkCompleting } = useBulkCompleteExpenses()

const selectedPayablesTotal = computed(() =>
  selectedPayables.value.reduce((total, expense) => total + Number(expense.amount || 0), 0),
)

const handleBulkMarkPaid = () => {
  const count = selectedPayables.value.length
  bulkCompleteExpenses(
    { expense_uids: selectedPayables.value.map((expense) => expense.uid) },
    {
      onSuccess: () => {
        toast.success(`${count} expense${count === 1 ? "" : "s"} marked as paid`)
        openBulkPaid.value = false
        dataTableRef.value?.clearRowSelection()
        handleRefresh()
      },
      onError: displayError,
    },
  )
}

// Function to handle opening create order drawer
const handleOpenCreate = () => {
  // Check premium access before opening drawer
  if (!checkPremiumAccess()) return

  selectedExpense.value = null
  openCreate.value = true
}

const handleRefresh = () => {
  refetch()
  refetchStats()
  if (isPayablesTab.value) {
    refetchTaxStats()
    refetchShippingStats()
  }
}

const getActionItems = (item: TExpense) => [
  ...(item.entry_type === "auto"
    ? []
    : [
        {
          label: "Edit expense",
          icon: "edit",
          action: () => {
            openCreate.value = true
            selectedExpense.value = item
          },
        },
        { divider: true },
      ]),
  // Manual expenses can always be settled by hand; auto entries can't, except for
  // taxes, which are remitted outside the app and still need marking.
  ...(item.status !== "paid" && (item.entry_type === "manual" || isTaxCategory(item.category_name))
    ? [
        {
          label: "Mark as paid",
          icon: "tick-circle",
          class: "text-green-600 hover:bg-green-50",
          iconClass: "text-green-600",
          action: () => {
            openMarkPaid.value = true
            selectedExpense.value = item
          },
        },
        { divider: true },
      ]
    : []),
  {
    label: "Void expense",
    icon: "close-circle",
    class: "text-orange-600 hover:bg-orange-50",
    iconClass: "text-orange-600",
    action: () => {
      openVoid.value = true
      selectedExpense.value = item
    },
  },
  ...(item.entry_type === "manual"
    ? [
        {
          label: "Delete expense",
          icon: "trash",
          class: "text-red-600 hover:bg-red-50",
          iconClass: "text-red-600",
          action: () => {
            openDelete.value = true
            selectedExpense.value = item
          },
        },
      ]
    : []),
]

const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense()
const { mutate: voidExpense, isPending: isVoiding } = useEditExpense()
const { mutate: markAsPaidExpense, isPending: isMarkingPaid } = useEditExpense()

const handleMarkAsPaid = () => {
  markAsPaidExpense(
    {
      id: selectedExpense.value?.uid || "",
      payload: { status: "paid" },
    },
    {
      onSuccess: () => {
        toast.success("Expense marked as paid successfully")
        openMarkPaid.value = false
        selectedExpense.value = null
        handleRefresh()
      },
      onError: displayError,
    },
  )
}

const handleDelete = () => {
  deleteExpense(selectedExpense.value?.uid || "", {
    onSuccess: () => {
      toast.success("Expense deleted successfully")
      openDelete.value = false
      selectedExpense.value = null
      handleRefresh()
    },
    onError: displayError,
  })
}

const handleVoid = () => {
  voidExpense(
    {
      id: selectedExpense.value?.uid || "",
      payload: { status: "void" },
    },
    {
      onSuccess: () => {
        toast.success("Expense voided successfully")
        openVoid.value = false
        selectedExpense.value = null
        handleRefresh()
      },
      onError: displayError,
    },
  )
}

const route = useRoute()

// Watch for route query to open create modal/drawer
watch(
  () => route.query.create,
  (newVal) => {
    if (newVal === "true") {
      handleOpenCreate()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="px-3 pt-4 pb-6">
    <PageHeader title="Expenses" :count="expenses?.count" count-label="records" />

    <div class="flex flex-col gap-6">
      <div class="hidden lg:block">
        <SectionHeader title="Expenses" subtitle="Review your expenses." />
      </div>

      <Tabs v-model="activeTab" :tabs="pageTabs" class="max-w-xs" />

      <EmptyState
        v-if="
          !isPayablesTab &&
          !expenses?.results?.length &&
          !debouncedSearch &&
          !isPending &&
          activeFilterCount === 0
        "
        :title="`No expenses recorded yet`"
        :description="`Your expenses will be automatically added as they come in. You can also add one manually to get started.`"
        action-label="Add an expense"
        action-icon="add"
        :loading="isPending"
        @action="handleOpenCreate"
      >
        <template #image>
          <img
            src="@/assets/images/empty-expense.svg?url"
            alt="Empty Expense"
            class="mx-auto mb-4"
          />
        </template>
      </EmptyState>

      <section v-else class="flex flex-col gap-5 lg:gap-8">
        <div
          v-if="!isMobile && (isPayablesTab || expenseDashboard?.current.total_amount)"
          class="rounded-xl border border-gray-200 bg-white p-4"
        >
          <div class="mb-4">
            <h3 class="text-core-800 flex items-center gap-2 text-base font-medium">
              Summary
              <Chip v-if="isPayablesTab" label="Outstanding" color="warning" />
              <Chip v-else :label="currentMonthLabel" color="blue" />
            </h3>
            <p class="text-core-600 mt-1 text-sm">
              <span v-if="isPayablesTab">
                Sum of all pending and unpaid expenses matching your applied filters
              </span>
              <span v-else>
                See <b class="text-core-800">Menu > Reports</b> for previous months
              </span>
            </p>
          </div>

          <div class="grid-cols-4 gap-4 lg:grid">
            <StatCard
              v-for="item in expenseMetrics"
              :key="item.label"
              :stat="item"
              :loading="isLoadingStats"
            />
            <!-- Payables fills the row with its four buckets instead -->
            <ExpenseStackedBarChart
              v-if="!isPayablesTab"
              class="col-span-2"
              show-label
              :category_breakdown="expenseDashboard?.category_breakdown"
            />
          </div>
        </div>

        <div v-if="isMobile && isPayablesTab" class="grid grid-cols-2 gap-3">
          <StatCard
            v-for="item in expenseMetrics"
            :key="item.label"
            :stat="item"
            :loading="isLoadingStats"
          />
        </div>

        <div v-else-if="isMobile && expenseDashboard?.current.total_amount">
          <ExpenseStackedBarChart
            :total-expense="expenseDashboard?.current.total_amount || 0"
            :category_breakdown="expenseDashboard?.category_breakdown"
          />
        </div>

        <Tabs
          v-if="isPayablesTab"
          v-model="payablesSubTab"
          :tabs="PAYABLE_SUB_TABS"
          class="max-w-md"
        />

        <div
          class="space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white"
        >
          <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
            <h3
              class="mb-2 hidden items-center gap-1 text-lg font-semibold capitalize md:mb-0 lg:flex"
            >
              {{ isPayablesTab ? `All ${subTabNoun}` : "All Expenses" }}
              <Chip v-if="expenses?.count" :label="expenses?.count" />
            </h3>
            <div class="flex items-center gap-2">
              <TextField
                left-icon="search-lg"
                size="sm"
                class="w-full md:min-w-64"
                placeholder="Search by name"
                v-model="searchQuery"
              />

              <AppButton
                icon="filter-lines"
                size="sm"
                color="alt"
                class="relative flex-shrink-0"
                :label="isMobile ? '' : 'Filter'"
                :badge="activeFilterCount ? activeFilterCount : ''"
                @click="showFilter = true"
              />

              <AppButton
                v-if="isPayablesTab"
                icon="tick-circle"
                size="sm"
                color="success"
                class="flex-shrink-0"
                label="Mark as Paid"
                :disabled="!selectedPayables.length"
                @click="openBulkPaid = true"
              />

              <AppButton
                v-else
                icon="add"
                size="sm"
                class="flex-shrink-0"
                :label="isMobile ? '' : 'Add Expense'"
                @click="handleOpenCreate"
              />
            </div>
          </div>

          <!-- Selection is per page, so say so rather than let the count read as the whole bucket -->
          <div
            v-if="isPayablesTab && selectedPayables.length"
            class="border-primary-200 bg-primary-25 flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm md:mx-4 md:rounded-lg"
          >
            <p class="text-core-700">
              <b>{{ selectedPayables.length }}</b>
              <span class="lowercase"> {{ subTabNoun }} </span>
              selected on this page
              <span class="text-core-400">•</span>
              <b>{{ format(selectedPayablesTotal, { kobo: true }) }}</b>
            </p>
            <button
              type="button"
              class="text-primary-700 font-medium underline underline-offset-2"
              @click="dataTableRef?.clearRowSelection()"
            >
              Clear selection
            </button>
          </div>

          <DataTable
            :key="`${activeTab}-${payablesSubTab}`"
            ref="dataTableRef"
            :data="expenses?.results ?? []"
            :columns="EXPENSE_COLUMN"
            :loading="isFetching"
            :enable-row-selection="isPayablesTab"
            @row-selection-change="(rows) => (selectedPayables = rows)"
            :empty-state="{
              title: isPayablesTab ? `No ${subTabNoun} found` : 'No Expense Found',
              description:
                searchQuery || activeFilterCount
                  ? 'Try adjusting your filters or search query'
                  : isPayablesTab
                    ? `You have no outstanding ${subTabNoun} right now. Pending and unpaid ones will appear here.`
                    : `Your expenses will be automatically added as they come in. You can also add one manually to get started.`,
            }"
            :row-class="
              (row) => (row.status === 'void' ? 'opacity-70! bg-gray-100! grayscale!' : '')
            "
            :show-pagination="true"
            :items-per-page="itemsPerPage"
            :total-items-count="expenses?.count || 0"
            :total-page-count="Math.ceil((expenses?.count || 0) / itemsPerPage) || 1"
            :server-pagination="true"
            @pagination-change="
              (d) => {
                page = d.currentPage
                itemsPerPage = d.itemsPerPage
              }
            "
            @row-click="
              (row) => {
                selectedExpense = row
                openDetail = true
              }
            "
          >
            <template #cell:name="{ item }">
              <div class="flex max-w-52 items-center gap-2 truncate">
                <span
                  class="bg-core-200 relative flex size-10 shrink-0 items-center justify-center rounded-xl"
                >
                  <Icon
                    :name="EXPENSE_CATEGORY_ICON[item.category_name] || 'receipt-text'"
                    :size="24"
                    class="text-core-800"
                  />
                  <Icon
                    v-if="item.entry_type === 'auto'"
                    name="flash"
                    class="text-primary-600 absolute -right-1 -bottom-1"
                  />
                </span>

                <h4
                  v-if="
                    item.linked_order_number &&
                    item.sub_category_name &&
                    isTaxLikeSubcategory(item.sub_category_name)
                  "
                  class="!font-outfit truncate text-left text-sm font-medium capitalize"
                >
                  <span>{{ isTaxLikeSubcategory(item.sub_category_name) }}</span>
                  <span> ({{ item.linked_order_number }}) </span>
                </h4>

                <h4 v-else class="!font-outfit truncate text-left text-sm font-medium capitalize">
                  {{ item.name || item.category_name }}
                  <span v-if="item.produced_item_name"> ({{ item.produced_item_name }}) </span>
                </h4>
              </div>
            </template>
            <template #cell:category_name="{ item }">
              <div class="max-w-48">
                <Chip :label="item.category_name" color="purple" icon="tag" />
              </div>
            </template>
            <template #cell:sub_category_name="{ item }">
              <div class="max-w-48">
                <Chip
                  v-if="item.sub_category_name"
                  :label="item.sub_category_name"
                  color="pink"
                  icon="tag"
                />
                <span v-else>---</span>
              </div>
            </template>
            <template #cell:status="{ item }">
              <Chip
                :color="getExpenseStatusColor(item.status)"
                :label="item.status"
                class="capitalize"
                show-dot
              />
            </template>

            <!-- Expense action should be on -->
            <template #mobile="{ item }">
              <ExpenseCard
                :expense="item"
                class="border-t border-gray-200 py-4!"
                @toggle="() => (selectedExpense = item)"
                @click="() => (openDetail = true)"
                @delete="() => (openDelete = true)"
                @void="() => (openVoid = true)"
                @edit="() => (openCreate = true)"
                @mark-paid="
                  () => {
                    selectedExpense = item
                    openMarkPaid = true
                  }
                "
              />
            </template>
            <template #cell:actions="{ item }">
              <DropdownMenu v-if="item.status !== 'void'" :items="getActionItems(item)" />
            </template>
          </DataTable>
        </div>
      </section>
    </div>
    <!--  -->
    <CreateExpenseDrawer
      :open="openCreate"
      :expense="selectedExpense"
      @close="
        () => {
          openCreate = false
          selectedExpense = null
          $router.replace({ name: 'Expenses', query: {} })
        }
      "
      @refresh="handleRefresh"
    />

    <ExpenseDetailsDrawer
      v-if="selectedExpense"
      :open="openDetail"
      :expense="selectedExpense"
      @close="openDetail = false"
      @refresh="handleRefresh"
    />

    <ConfirmationModal
      :model-value="openDelete || openVoid"
      @update:model-value="
        () => {
          openDelete = false
          openVoid = false
        }
      "
      :loading="isDeleting || isVoiding"
      :header="openDelete ? 'Delete Expense' : 'Void Expense'"
      @confirm="openDelete ? handleDelete() : handleVoid()"
      :action-label="openDelete ? 'Delete Expense' : 'Void Expense'"
      :variant="openDelete ? 'error' : 'warning'"
    >
      <template #paragraph>
        <p class="mb-4 text-sm text-gray-600">
          <template v-if="openDelete">
            Are you sure you want to delete this expense? This action cannot be undone.
          </template>
          <template v-else>
            Are you sure you want to void this expense? This will mark the expense as voided.
          </template>
        </p>
        <ExpenseCard
          v-if="selectedExpense"
          :expense="selectedExpense"
          class="bg-core-25! rounded-2xl px-3"
          :show-actions="false"
        />
      </template>
    </ConfirmationModal>

    <ConfirmationModal
      v-model="openMarkPaid"
      :loading="isMarkingPaid"
      header="Mark Expense as Paid"
      action-label="Mark as Paid"
      variant="success"
      @confirm="handleMarkAsPaid"
    >
      <template #paragraph>
        <p class="mb-4 text-sm text-gray-600">
          Are you sure you want to mark this expense as paid? This will update the expense status to
          paid.
        </p>
        <ExpenseCard
          v-if="selectedExpense"
          :expense="selectedExpense"
          class="bg-core-25! rounded-2xl px-3"
          :show-actions="false"
        />
      </template>
    </ConfirmationModal>

    <ConfirmationModal
      v-model="openBulkPaid"
      max-width="md"
      :loading="isBulkCompleting"
      header-icon="receipt-text"
      :header="`Mark ${selectedPayables.length} ${subTabNoun} as paid?`"
      action-label="Confirm"
      info-message="This action cannot be undone."
      info-box-variant="error"
      @confirm="handleBulkMarkPaid"
    >
      <template #paragraph>
        <p class="mt-2 text-xs md:text-sm">
          This updates their status to Paid and logs the settlement date.
        </p>

        <div class="border-core-300 bg-core-25 mt-4 w-full rounded-xl border p-4 text-left">
          <p class="text-core-600 text-xs">Total Amount</p>
          <p class="text-core-800 mt-1 text-lg font-semibold">
            {{ format(selectedPayablesTotal, { kobo: true }) }}
          </p>
        </div>
      </template>
    </ConfirmationModal>

    <ExpenseFiltersDrawer
      :open="showFilter"
      :hide-status="isPayablesTab"
      :hide-categories="isBucketSubTab"
      @close="showFilter = false"
      @apply="handleApplyFilters"
    />
  </div>
</template>
