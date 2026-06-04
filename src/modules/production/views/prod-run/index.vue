<script setup lang="ts">
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import DataTable from "@components/DataTable.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useFinaliseProdRun, useGetProdRuns } from "@modules/production/api"
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

const computedParams = computed(() => {
  const params: Record<string, string> = {}
  if (debouncedSearch.value) params.search = debouncedSearch.value
  params.offset = (((debouncedSearch.value ? 0 : page.value) - 1) * itemsPerPage.value).toString()
  params.limit = itemsPerPage.value.toString()
  return params
})

const { data: prodRuns, isPending, isFetching, refetch } = useGetProdRuns(computedParams)

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

    <div class="flex flex-col gap-8">
      <EmptyState
        v-if="!prodRuns?.count && !searchQuery && page === 1"
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
        <div
          class="space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white lg:mt-6"
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
            :show-pagination="true"
            :items-per-page="itemsPerPage"
            :total-items-count="prodRuns?.count || 0"
            :total-page-count="Math.ceil((prodRuns?.count || 0) / itemsPerPage) || 1"
            :server-pagination="true"
            @pagination-change="(d) => (page = d.currentPage)"
            @row-click="(row) => $router.push(`/production/runs/${row.uid}`)"
          >
            <template #cell:status="{ item }">
              <Chip
                :label="item.status"
                class="capitalize!"
                :color="item.status === 'draft' ? 'warning' : 'success'"
              />
            </template>

            <template #cell:output_item_name="{ item }">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-700">{{ item.output_item_name }}</span>
                <Chip
                  v-if="item.output_variant"
                  :label="item.output_variant"
                  color="primary"
                  radius="md"
                />
              </div>
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
      :has-full-details="false"
      @close="showCreateModal = null"
      @refresh="refetch"
    />

    <ConfirmationModal
      v-model="showFinaliseModal"
      :loading="isFinalising"
      :header="`Finalise production run`"
      :paragraph="`Are you sure you want to finalise this production run? This will add ${parseInt(selectedProdRun?.quantity_to_produce!)} ${selectedProdRun?.output_unit} of ${
        selectedProdRun?.output_item_name
      } to your inventory.`"
      action-label="Finalise"
      variant="success"
      @confirm="onFinaliseRun"
    />
  </div>
</template>
