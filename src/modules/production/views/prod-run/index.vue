<script setup lang="ts">
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import DataTable from "@components/DataTable.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import StatCard from "@components/StatCard.vue"
import { useFinaliseProdRun, useGetProdRuns, useGetProdRunsStats } from "@modules/production/api"
import CreateProdRunDrawer from "@modules/production/components/prod-run/CreateProdRunDrawer.vue"
import ProdRunCard from "@modules/production/components/prod-run/ProdRunCard.vue"
import { PROD_RUNS_COLUMN } from "@modules/production/constant"
import { TProdRun } from "@modules/production/types"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

const page = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 750)
const selectedProdRun = ref<TProdRun | null>(null)
const showCreateModal = ref<"create" | "edit" | "duplicate" | null>(null)
const showFinaliseModal = ref(false)

const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)
const router = useRouter()
const { format } = useFormatCurrency()

const computedParams = computed(() => {
  const params: Record<string, string> = {}
  if (debouncedSearch.value) params.search = debouncedSearch.value
  params.offset = ((page.value - 1) * itemsPerPage.value).toString()
  params.limit = itemsPerPage.value.toString()
  return params
})

const { data: prodRuns, isPending, isFetching, refetch } = useGetProdRuns(computedParams)
const { data: stats, isLoading: isLoadingStats } = useGetProdRunsStats()

const prodRunStats = computed(() => [
  {
    label: "Total Runs",
    value: stats.value?.total_runs || 0,
    icon: "bag",
    iconClass: "lg:text-gray-700",
  },
  ...(isMobile.value
    ? []
    : [
        {
          label: "Total Units Produced",
          value: stats.value?.total_units_produced || 0,
          icon: "bag",
          iconClass: "lg:text-gray-700",
        },
      ]),
  {
    label: "Total Production Cost",
    value: stats.value?.total_production_cost || 0,
    icon: "bag",
    iconClass: "lg:text-gray-700",
    chip:
      isMobile.value && stats.value?.avg_cost_per_unit
        ? `${format(stats.value?.avg_cost_per_unit)} avg`
        : undefined,
    chipColor: "purple",
  },
  ...(isMobile.value
    ? []
    : [
        {
          label: "Avg Cost per Unit",
          value: format(stats.value?.avg_cost_per_unit || 0),
          icon: "bag",
          iconClass: "lg:text-gray-700",
        },
      ]),
])

const getActionItems = (item: TProdRun) => [
  {
    label: `View run`,
    icon: "eye",
    action: () => router.push(`/production/runs/${item.uid}`),
  },
  {
    label: `Duplicate run`,
    icon: "copy",
    action: () => (showCreateModal.value = "duplicate"),
  },
  ...(item.status === "draft"
    ? [
        {
          label: `Edit run`,
          icon: "edit",
          action: () => (showCreateModal.value = "edit"),
        },
        {
          label: `Finalise run`,
          icon: "circle-check",
          action: () => (showFinaliseModal.value = true),
        },
      ]
    : []),
]

const { mutate: finaliseProdRun, isPending: isFinalising } = useFinaliseProdRun()

const onFinaliseRun = () => {
  if (!selectedProdRun.value) return
  finaliseProdRun(selectedProdRun.value.uid, {
    onSuccess: () => {
      toast.success(`Production run finalised successfully`)
      showFinaliseModal.value = false
      selectedProdRun.value = null
      refetch()
    },
    onError: displayError,
  })
}
</script>

<template>
  <div class="px-3 pb-6 lg:pt-6">
    <PageHeader v-if="isMobile" title="Production Runs" :count="prodRuns?.count || 0" />
    <SectionHeader
      v-else
      title="Production Runs"
      :subtitle="`Track and manage all production activity and costing.`"
    />

    <div class="mt-6" />

    <div class="flex flex-col gap-8">
      <EmptyState
        v-if="!prodRuns?.count && !searchQuery"
        :title="`You don't have any production runs yet!`"
        :description="`When you complete a run, it will appear here along with your full cost breakdown.`"
        :action-label="`Add production run`"
        :loading="isPending"
        action-icon="add"
        @action="showCreateModal = 'create'"
      >
        <template #image>
          <img src="@/assets/images/empty-material.svg?url" class="mx-auto mb-4" />
        </template>
      </EmptyState>

      <section v-else class="flex flex-col gap-5 lg:gap-8">
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            v-for="item in prodRunStats"
            :key="item.label"
            :stat="item"
            :loading="isLoadingStats"
          />
        </div>

        <div
          class="space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white"
        >
          <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
            <h3 class="mb-2 hidden items-center gap-1 text-lg font-semibold md:mb-0 lg:flex">
              All Runs
              <Chip v-if="prodRuns?.count" :label="prodRuns?.count" />
            </h3>

            <div class="flex items-center gap-2">
              <TextField
                left-icon="search-lg"
                size="sm"
                class="w-full md:min-w-64"
                placeholder="Search by recipe or item name"
                v-model="searchQuery"
              />

              <AppButton
                icon="filter-lines"
                size="sm"
                color="alt"
                class="relative flex-shrink-0"
                :label="isMobile ? '' : 'Filter'"
              />

              <AppButton
                icon="add"
                size="sm"
                class="flex-shrink-0"
                :label="isMobile ? '' : `Add Run`"
                @click="showCreateModal = 'create'"
              />
            </div>
          </div>

          <DataTable
            :data="prodRuns?.results ?? []"
            :columns="PROD_RUNS_COLUMN"
            :loading="isFetching"
            @row-click="(row) => $router.push(`/production/runs/${row.uid}`)"
          >
            <template #cell:damaged_quantity="{ item }">
              <span
                v-if="item.damaged_quantity"
                class="text-error-600 inline-flex items-center gap-1 font-medium"
              >
                {{ parseInt(item.damaged_quantity) }}
                <Icon name="danger" />
              </span>
              <span v-else>-</span>
            </template>

            <template #cell:status="{ item }">
              <Chip
                :label="item.status"
                class="capitalize!"
                :color="item.status === 'draft' ? 'warning' : 'success'"
              />
            </template>

            <template #cell:actions="{ item }">
              <DropdownMenu :items="getActionItems(item)" @toggle="selectedProdRun = item" />
            </template>

            <template #mobile="{ item }">
              <ProdRunCard :item="item" @click="$router.push(`/production/runs/${item.uid}`)" />
            </template>
          </DataTable>
        </div>
      </section>
    </div>

    <CreateProdRunDrawer
      :open="!!showCreateModal"
      :mode="showCreateModal"
      :run="selectedProdRun"
      @close="showCreateModal = null"
      @refresh="refetch"
    />

    <ConfirmationModal
      v-model="showFinaliseModal"
      :loading="isFinalising"
      :header="`Finalise production run`"
      :paragraph="`Are you sure you want to finalise this production run?`"
      action-label="Finalise"
      variant="success"
      @confirm="onFinaliseRun"
    />
  </div>
</template>
