<script setup lang="ts">
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useMediaQuery } from "@vueuse/core"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import Icon from "@components/Icon.vue"
import DataTable from "@components/DataTable.vue"
import TextField from "@components/form/TextField.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import AppButton from "@components/AppButton.vue"
import CreateRunDrawer from "./components/ProductionRunDrawer.vue"
// ProductionRunData imported from types below
import { PROD_RUNS_COLUMN } from "@modules/production/constant"
import { useGetProdRuns } from "@modules/production/api"
import type { TProdRun, ProdRunStatus, ProductionRunData } from "@modules/production/types"

const router = useRouter()
const isMobile = useMediaQuery("(max-width: 1024px)")

// ── API ────────────────────────────────────────────────────────────────────────

const limit = ref(100)
const offset = ref(0)

const { data: runsData, isLoading } = useGetProdRuns(
  computed(() => ({ limit: limit.value, offset: offset.value })),
)

const allRuns = computed<TProdRun[]>(() => (runsData.value?.results ?? []) as TProdRun[])
const totalCount = computed(() => runsData.value?.count ?? 0)

// ── Drawers ────────────────────────────────────────────────────────────────────

const showCreateDrawer = ref(false)
const showEditDrawer = ref(false)
const runToEdit = ref<ProductionRunData | null>(null)

const openEditRun = (run: TProdRun) => {
  runToEdit.value = {
    uid: run.uid,
    output_item_name: run.output_item_name,
    recipe_uid: run.recipe ?? undefined,
    quantity_produced:
      run.quantity_to_produce != null ? Number(run.quantity_to_produce) : undefined,
    quantity_damaged: run.damaged_quantity != null ? Number(run.damaged_quantity) : undefined,
    selling_price:
      run.selling_price_per_unit != null ? String(run.selling_price_per_unit) : undefined,
  }
  showEditDrawer.value = true
}

const closeEditDrawer = () => {
  showEditDrawer.value = false
  runToEdit.value = null
}

const viewRun = (run: TProdRun) => {
  void router.push(`/production/runs/${run.uid}`)
}

// ── Search & filter ────────────────────────────────────────────────────────────

const searchQuery = ref("")
const showFilter = ref(false)
const activeStatus = ref<"" | ProdRunStatus>("")

const filterOptions: { label: string; value: ProdRunStatus }[] = [
  { label: "Completed", value: "completed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Draft", value: "draft" },
]

const hasActiveFilters = computed(() => !!activeStatus.value)

const selectFilter = (v: ProdRunStatus) => {
  activeStatus.value = activeStatus.value === v ? "" : v
  showFilter.value = false
}

const clearFilters = () => {
  activeStatus.value = ""
  showFilter.value = false
}

const filteredRuns = computed(() => {
  let rows = allRuns.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    rows = rows.filter((r) => r.output_item_name.toLowerCase().includes(q))
  }
  if (activeStatus.value) {
    rows = rows.filter((r) => r.status === activeStatus.value)
  }
  return rows
})

// ── Stats ──────────────────────────────────────────────────────────────────────

const stats = computed(() => {
  const runs = allRuns.value
  const totalRuns = totalCount.value
  const totalUnits = runs.reduce((s, r) => s + Number(r.quantity_to_produce ?? 0), 0)
  const totalCost = runs.reduce((s, r) => s + Number(r.total_cost ?? 0), 0)
  const avgCost = totalUnits ? totalCost / totalUnits : 0
  return { totalRuns, totalUnits, totalCost, avgCost }
})

const formatNaira = (n: number) => {
  if (n >= 1000) return `₦${(n / 1000).toFixed(1)}K`
  return `₦${n.toLocaleString()}`
}

const formatNairaFull = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

// ── Status chip ────────────────────────────────────────────────────────────────

const statusClass = (status: ProdRunStatus) => {
  if (status === "completed") return "border-green-200 bg-green-50 text-green-700"
  if (status === "in_progress") return "border-yellow-200 bg-yellow-50 text-yellow-700"
  return "border-gray-200 bg-gray-100 text-gray-500"
}

const statusLabel = (status: ProdRunStatus) => {
  if (status === "completed") return "Completed"
  if (status === "in_progress") return "In Progress"
  return "Draft"
}

// ── Actions ────────────────────────────────────────────────────────────────────

const getActionItems = (item: TProdRun) => [
  { label: "View run", icon: "eye", action: () => viewRun(item) },
  { label: "Edit run", icon: "edit", action: () => openEditRun(item) },
]
</script>

<template>
  <div class="px-3 pb-6">
    <PageHeader v-if="isMobile" title="Production Run" :count="totalCount" />
    <SectionHeader
      v-else
      title="Production Run"
      subtitle="Track and manage all production activity and costing."
    />

    <div class="mt-6" />

    <!-- ── Empty state ── -->
    <div
      v-if="!isLoading && !allRuns.length"
      class="overflow-hidden rounded-2xl border border-gray-200 bg-white"
    >
      <div class="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div class="relative mb-6 flex h-28 w-28 items-center justify-center">
          <div class="absolute inset-0 rounded-full bg-gray-50" />
          <div class="relative z-10 flex h-20 w-20 items-center justify-center">
            <Icon name="empty-production-run" size="16" />
          </div>
        </div>
        <p class="mb-1 text-sm font-semibold text-gray-800">
          You don't have any production runs yet!
        </p>
        <p class="mb-6 max-w-[280px] text-xs leading-relaxed text-gray-500">
          When you complete a run, it will appear here along with your full cost breakdown.
        </p>
        <button
          type="button"
          class="bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-50/50 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition active:opacity-80"
          @click="showCreateDrawer = true"
        >
          <Icon name="add" size="16" class="text-primary-700" />
          Add a production run
        </button>
      </div>
    </div>

    <!-- ── Populated state ── -->
    <div v-else class="flex flex-col gap-5">
      <!-- Stats cards -->
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="rounded-2xl border border-gray-200 bg-white px-4 py-4">
          <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <Icon name="bag" size="18" class="text-gray-600" />
          </div>
          <p class="mb-1 text-xs text-gray-500">Total Runs</p>
          <p class="text-2xl font-bold text-gray-900">{{ stats.totalRuns }}</p>
        </div>
        <div class="rounded-2xl border border-gray-200 bg-white px-4 py-4">
          <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <Icon name="bag" size="18" class="text-gray-600" />
          </div>
          <p class="mb-1 text-xs text-gray-500">Total Units Produced</p>
          <p class="text-2xl font-bold text-gray-900">{{ stats.totalUnits }}</p>
        </div>
        <div class="rounded-2xl border border-gray-200 bg-white px-4 py-4">
          <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <Icon name="bag" size="18" class="text-gray-600" />
          </div>
          <p class="mb-1 text-xs text-gray-500">Total Production Cost</p>
          <p class="text-2xl font-bold text-gray-900">{{ formatNaira(stats.totalCost) }}</p>
        </div>
        <div class="rounded-2xl border border-gray-200 bg-white px-4 py-4">
          <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <Icon name="bag" size="18" class="text-gray-600" />
          </div>
          <p class="mb-1 text-xs text-gray-500">Avg Cost per Unit</p>
          <p class="text-2xl font-bold text-gray-900">{{ formatNaira(stats.avgCost) }}</p>
        </div>
      </div>

      <!-- Table card -->
      <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div
          class="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 md:flex-row md:items-center md:justify-between"
        >
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold text-gray-900">All runs</h3>
            <span
              class="border-primary-200 bg-primary-50 text-primary-700 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
            >
              {{ filteredRuns.length }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <TextField
              left-icon="search-lg"
              size="sm"
              class="w-full md:min-w-64"
              placeholder="Search by item name"
              v-model="searchQuery"
            />

            <div class="relative flex-shrink-0">
              <button
                type="button"
                class="relative inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors"
                :class="
                  hasActiveFilters
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                "
                @click="showFilter = !showFilter"
              >
                <Icon name="filter-lines" size="16" />
                <span v-if="!isMobile">Filter</span>
                <span
                  v-if="hasActiveFilters"
                  class="bg-primary-500 absolute -top-1 -right-1 size-2.5 rounded-full"
                />
              </button>

              <div
                v-if="showFilter"
                class="absolute top-full right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                <p class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-gray-400 uppercase">
                  Status
                </p>
                <div class="p-1">
                  <button
                    v-for="opt in filterOptions"
                    :key="opt.value"
                    type="button"
                    class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors"
                    :class="
                      activeStatus === opt.value
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    "
                    @click="selectFilter(opt.value)"
                  >
                    <div class="flex items-center gap-2">
                      <span
                        class="size-2 rounded-full"
                        :class="
                          opt.value === 'completed'
                            ? 'bg-green-500'
                            : opt.value === 'in_progress'
                              ? 'bg-yellow-400'
                              : 'bg-gray-400'
                        "
                      />
                      {{ opt.label }}
                    </div>
                    <Icon
                      v-if="activeStatus === opt.value"
                      name="check"
                      size="14"
                      class="text-primary-500"
                    />
                  </button>
                </div>
                <div v-if="hasActiveFilters" class="border-t border-gray-100 p-1">
                  <button
                    type="button"
                    class="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-500 hover:bg-gray-50"
                    @click="clearFilters"
                  >
                    Clear filter
                  </button>
                </div>
              </div>
            </div>

            <AppButton
              icon="add"
              size="sm"
              class="bg-primary-600 flex-shrink-0"
              :label="isMobile ? '' : 'Add Run'"
              @click="showCreateDrawer = true"
            />
          </div>
        </div>

        <DataTable
          :data="filteredRuns"
          :columns="PROD_RUNS_COLUMN"
          :loading="isLoading"
          @row-click="viewRun"
        >
          <template #cell:output_item_name="{ item }">
            <span class="text-sm font-semibold text-gray-900">{{ item.output_item_name }}</span>
          </template>
          <template #cell:damaged_quantity="{ item }">
            <div v-if="Number(item.damaged_quantity) > 0">
              <span class="text-primary-600 text-sm font-semibold">
                {{ item.damaged_quantity }}
              </span>
              <Icon name="warning-2" size="14" class="text-primary-500" />
            </div>
            <span v-else>--</span>
          </template>

          <template #cell:output_quantity="{ item }">
            <span class="text-sm text-gray-700">{{ item.quantity_to_produce }}</span>
          </template>

          <template #cell:usable_quantity="{ item }">
            <span class="text-sm text-gray-700">{{ item.usable_quantity }}</span>
          </template>

          <template #cell:total_cost="{ item }">
            <span class="text-sm text-gray-700">{{
              formatNairaFull(Number(item.total_cost))
            }}</span>
          </template>

          <template #cell:status="{ item }">
            <span
              class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
              :class="statusClass(item.status)"
            >
              {{ statusLabel(item.status) }}
            </span>
          </template>

          <template #cell:date_created="{ item }">
            <span class="text-sm text-gray-500">{{ item.created_at?.slice(0, 10) ?? "—" }}</span>
          </template>

          <template #cell:last_cost="{ item }">
            <span class="text-sm text-gray-700">{{
              item.cost_per_unit ? formatNairaFull(Number(item.cost_per_unit)) : "—"
            }}</span>
          </template>

          <template #cell:actions="{ item }">
            <div data-no-row-click @click.stop @mousedown.stop @pointerdown.stop>
              <DropdownMenu :items="getActionItems(item)" />
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- ── Create Run Drawer ── -->
    <CreateRunDrawer v-model:open="showCreateDrawer" @close="showCreateDrawer = false" />

    <!-- ── Edit Run Drawer ── -->
    <CreateRunDrawer
      v-model:open="showEditDrawer"
      mode="edit"
      :run="runToEdit"
      @close="closeEditDrawer"
      @saved="closeEditDrawer"
    />
  </div>
</template>
