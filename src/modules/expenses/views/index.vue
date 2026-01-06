<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import DataTable from "@components/DataTable.vue"
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import SectionHeader from "@components/SectionHeader.vue"
import PageHeader from "@components/PageHeader.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref, watch } from "vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Chip from "@components/Chip.vue"
import { TExpense } from "../types"
import CreateExpenseDrawer from "../components/CreateExpenseDrawer.vue"
import { useDeleteExpense, useGetExpenseDashboard, useGetExpenses } from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import { EXPENSE_COLUMN, getExpenseStatusColor } from "../constants"
import { useRoute } from "vue-router"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { usePremiumAccess } from "@/composables/usePremiumAccess"
import ExpenseCard from "../components/ExpenseCard.vue"
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import Icon from "@components/Icon.vue"
import ExpenseDetailsDrawer from "../components/ExpenseDetailsDrawer.vue"
import StatCard from "@components/StatCard.vue"
import { formatCurrency } from "@/utils/format-currency"

const openCreate = ref(false)
const openDelete = ref(false)
const openDetail = ref(false)
const selectedExpense = ref<TExpense | null>(null)

const { data: expenseDashboard, refetch: refetchStats } = useGetExpenseDashboard()

const expenseMetrics = computed(() => {
  const stat = expenseDashboard?.value

  const biggestExpenseCategory = stat?.category_breakdown.reduce((prev, current) =>
    current.total_amount > prev.total_amount ? current : prev,
  )?.category_name

  return [
    {
      label: "Total Expenses",
      value: formatCurrency(stat?.current.total_amount) || 0,
      icon: "user-octagon",
      iconClass: "md:text-green-700 md:!bg-green-50",
    },
    {
      label: "No. of Transactions",
      value: stat?.current.expense_count || 0,
      prev_value: stat?.previous.expense_count || 0,
      icon: "user-octagon",
      iconClass: "md:text-bloom-700 md:!bg-bloom-50",
    },
    {
      label: "Biggest Expense Category",
      chip: biggestExpenseCategory || "",
      chipColor: "purple",
      icon: "user-circle-add",
      iconClass: "md:text-bloom-700 md:!bg-bloom-50",
    },
  ]
})

const showFilter = ref(false)
const isMobile = useMediaQuery("(max-width: 768px)")

const page = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 750)

const computedParams = computed(() => {
  const params: Record<string, string> = {}
  if (debouncedSearch.value) params.search = debouncedSearch.value
  params.offset = ((page.value - 1) * itemsPerPage.value).toString()
  params.limit = itemsPerPage.value.toString()
  return params
})

const { data: expenses, isPending, isFetching, refetch } = useGetExpenses(computedParams)
const { checkPremiumAccess } = usePremiumAccess()

// Function to handle opening create order drawer
const handleOpenCreate = () => {
  // Check premium access before opening drawer
  if (!checkPremiumAccess()) return

  openCreate.value = true
}

const handleRefresh = () => {
  refetch()
  refetchStats()
}

const getActionItems = (item: TExpense) => [
  {
    label: "Edit expense",
    icon: "edit",
    action: () => {
      openCreate.value = true
      selectedExpense.value = item
    },
  },
  { divider: true },
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

const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense()

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
  <div class="p-6">
    <PageHeader title="Expenses" :count="expenses?.count" count-label="expenses" />

    <div class="flex flex-col gap-8">
      <div class="hidden lg:block">
        <SectionHeader title="Expenses" subtitle="Review your daily performance report." />
      </div>

      <EmptyState
        v-if="!expenses?.results?.length && !debouncedSearch && !isPending"
        title="You don’t have any expense yet!"
        description="Your expenses will be automatically added as they come in. You can also add one manually to get started."
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

      <section v-else class="flex flex-col gap-8">
        <!-- <MetricsGrid :items="expenseMetrics" /> -->

        <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard
            v-for="item in expenseMetrics"
            :key="item.label"
            :stat="item"
            :same-view="false"
          />
        </div>

        <div
          class="space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white"
        >
          <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
            <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
              All Expenses
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
                class="flex-shrink-0"
                :label="isMobile ? '' : 'Filter'"
                @click="showFilter = true"
              />

              <AppButton
                icon="add"
                size="sm"
                class="flex-shrink-0"
                :label="isMobile ? '' : 'Add Expense'"
                @click="handleOpenCreate"
              />
            </div>
          </div>

          <DataTable
            :data="expenses?.results ?? []"
            :columns="EXPENSE_COLUMN"
            :loading="isFetching"
            :enable-row-selection="false"
            :empty-state="{
              title: 'No Expense Found',
              description: searchQuery
                ? 'Try adjusting your filters or search query'
                : `Your expenses will be automatically added as they come in. You can also add one manually to get started.`,
            }"
            :show-pagination="true"
            :items-per-page="itemsPerPage"
            :total-items-count="expenses?.count || 0"
            :total-page-count="Math.ceil((expenses?.count || 0) / itemsPerPage) || 1"
            :server-pagination="true"
            @pagination-change="(d) => (page = d.currentPage)"
            @row-click="
              (row) => {
                selectedExpense = row
                openDetail = true
              }
            "
          >
            <template #cell:name="{ item }">
              <div class="flex max-w-48 items-center gap-2 truncate">
                <span
                  class="bg-core-200 flex size-10 shrink-0 items-center justify-center rounded-xl"
                >
                  <Icon name="receipt-text" :size="24" class="text-core-800" />
                </span>
                <h4 class="!font-outfit truncate text-left text-sm font-medium capitalize">
                  {{ item.name }}
                </h4>
              </div>
            </template>
            <template #cell:category_name="{ item }">
              <Chip :label="item.category_name" color="purple" icon="tag" />
            </template>
            <template #cell:status="{ item }">
              <Chip
                :color="getExpenseStatusColor(item.status)"
                :label="item.status"
                class="capitalize"
                show-dot
              />
            </template>

            <template #mobile="{ item }">
              <ExpenseCard
                :expense="item"
                @click="
                  () => {
                    selectedExpense = item
                    openDetail = true
                  }
                "
                @delete="
                  () => {
                    selectedExpense = item
                    openDelete = true
                  }
                "
                @edit="
                  () => {
                    selectedExpense = item
                    openCreate = true
                  }
                "
              />
            </template>
            <template #cell:actions="{ item }">
              <DropdownMenu :items="getActionItems(item)" />
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

    <DeleteConfirmationModal
      :model-value="openDelete"
      @update:model-value="() => (openDelete = false)"
      :loading="isDeleting"
      header="Delete Expense"
      @delete="handleDelete"
      action-label="Delete Expense"
    >
      <template #paragraph>
        <p class="mb-4 text-sm text-gray-600">
          Are you sure you want to delete this expense? This action cannot be undone.
        </p>
        <ExpenseCard v-if="selectedExpense" :expense="selectedExpense" :show-actions="false" />
      </template>
    </DeleteConfirmationModal>
  </div>
</template>
