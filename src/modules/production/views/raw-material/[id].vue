<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { formatDate } from "@/utils/formatDate"
import AppButton from "@components/AppButton.vue"
import BackButton from "@components/BackButton.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import EmptyState from "@components/EmptyState.vue"
import PageHeader from "@components/PageHeader.vue"
import StatCard from "@components/StatCard.vue"
import Tabs from "@components/Tabs.vue"
import { useGetSingleRawMaterial, useDeleteRawMaterial } from "@modules/production/api"
import AddRawMaterialDrawer from "@modules/production/components/raw-material/AddRawMaterialDrawer.vue"
import AdjustMaterialStockModal from "@modules/production/components/raw-material/AdjustMaterialStockModal.vue"
import RMBatchesTable from "@modules/production/components/raw-material/details/RMBatchesTable.vue"
import RMLinkedRecipesTable from "@modules/production/components/raw-material/details/RMLinkedRecipesTable.vue"
import RMUsageHistoryTable from "@modules/production/components/raw-material/details/RMUsageHistoryTable.vue"
import { useProductionStore } from "@modules/production/store"
import { useMediaQuery } from "@vueuse/core"
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"

const materialTabs = [
  { title: "Batches", key: "batches" },
  { title: "Usage History", key: "usage" },
  { title: "Linked Recipes", key: "recipes" },
]

const route = useRoute()
const router = useRouter()
const { format } = useFormatCurrency()
const showEdit = ref(false)
const showAdjust = ref(false)
const showDelete = ref(false)
const activeTab = ref("batches")
const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)
const materialLabel = computed(() => useProductionStore().componentLabel)
const materialValue = computed(() => useProductionStore().componentValue)

const { data: material, isPending, refetch } = useGetSingleRawMaterial(route.params.id as string)
const { mutate: deleteRawMaterial, isPending: isDeleting } = useDeleteRawMaterial()

const handleDelete = () => {
  if (!material.value) return
  deleteRawMaterial(material.value.uid, {
    onSuccess: () => {
      showDelete.value = false
      toast.success(`${materialLabel.value} deleted successfully`)
      router.replace("/production/raw-materials")
    },
    onError: displayError,
  })
}

const actionMenus = computed(() => [
  {
    label: `Edit ${materialValue.value}`,
    icon: "edit",
    action: () => (showEdit.value = true),
  },
  { label: "Adjust stock", icon: "box", action: () => (showAdjust.value = true) },
  {
    label: `Delete ${materialValue.value}`,
    icon: "trash",
    class: "!text-error-600",
    action: () => (showDelete.value = true),
  },
])

const materialStats = computed(() => [
  {
    label: "Current Stock",
    value: `${material.value?.current_stock?.toLocaleString() ?? 0} ${material.value?.unit || ""}`,
    icon: "bag",
  },
  {
    label: "Avg Cost per Unit",
    value: `${format(material.value?.avg_cost || 0)}/kg`,
    icon: "bag",
  },
  {
    label: "Last Purchase Cost",
    value: `${format(material.value?.last_cost || 0)}/kg`,
    icon: "bag",
    chip: isMobile.value
      ? undefined
      : material.value?.last_cost_date
        ? formatDate(new Date(material.value.last_cost_date))
        : undefined,
    chipColor: "blue",
  },
  {
    label: "Stock Level",
    value: undefined,
    icon: "bag",
    chip: material?.value?.low_stock ? "Low" : "Good",
    chipColor: material?.value?.low_stock ? "warning" : "success",
  },
])

onMounted(() => {
  activeTab.value = route.query.tab ? String(route.query.tab) : "batches"
})
</script>

<template>
  <div class="px-3 lg:px-6 lg:pt-8">
    <PageHeader
      v-if="isMobile"
      :title="`${materialLabel} Details`"
      inner
      backLink="/production/raw-materials"
    />

    <BackButton v-else :label="`Back to ${materialLabel}`" to="/production/raw-materials" />

    <div class="mt-4" />

    <EmptyState
      v-if="isPending || !material"
      :loading="isPending"
      icon="box"
      :title="`Loading ${materialValue} details...`"
    />

    <div v-else>
      <section class="mb-6 flex justify-between gap-4">
        <div>
          <h2 class="mb-4 text-2xl font-semibold capitalize">{{ material.name }}</h2>
          <div class="flex gap-1">
            <Chip v-if="material.is_sub_assembly" label="Sub-assembly" color="purple" />
            <Chip :label="`Unit - ${material.unit}`" color="success" />
          </div>
        </div>

        <div>
          <DropdownMenu :items="actionMenus">
            <template #trigger>
              <AppButton
                variant="outlined"
                icon="dots-vertical"
                class="!flex-row-reverse"
                :label="!isMobile ? `Manage ${materialValue}` : ''"
              />
            </template>
          </DropdownMenu>
        </div>
      </section>

      <section class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard v-for="item in materialStats" :key="item.label" :stat="item" />
      </section>

      <section class="mt-8">
        <Tabs :tabs="materialTabs" v-model="activeTab" header-class="mb-3 md:mb-0">
          <template #batches>
            <RMBatchesTable :batches="material?.batches ?? []" :material="material" />
          </template>

          <template #usage>
            <RMUsageHistoryTable :usage="material?.movements ?? []" :material="material" />
          </template>

          <template #recipes>
            <RMLinkedRecipesTable :recipes="[]" :material="material" />
          </template>
        </Tabs>
      </section>

      <AddRawMaterialDrawer
        :open="showEdit"
        :material="material"
        @close="showEdit = false"
        @refresh="refetch"
      />

      <AdjustMaterialStockModal
        :open="showAdjust"
        :material="material"
        @close="showAdjust = false"
        @refresh="refetch"
      />

      <ConfirmationModal
        :header="`Delete ${materialLabel}`"
        :paragraph="`Are you sure you want to delete '${material.name}'? This cannot be undone.`"
        v-model="showDelete"
        variant="error"
        :loading="isDeleting"
        @confirm="handleDelete"
      />
    </div>
  </div>
</template>
