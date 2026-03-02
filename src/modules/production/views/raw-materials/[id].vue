<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { formatDate } from "@/utils/formatDate"
import AppButton from "@components/AppButton.vue"
import BackButton from "@components/BackButton.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import EmptyState from "@components/EmptyState.vue"
import PageHeader from "@components/PageHeader.vue"
import StatCard from "@components/StatCard.vue"
import Tabs from "@components/Tabs.vue"
import { useGetSingleRawMaterial } from "@modules/production/api"
import AddRawMaterialDrawer from "@modules/production/components/AddRawMaterialDrawer.vue"
import AdjustMaterialStockModal from "@modules/production/components/AdjustMaterialStockModal.vue"
import RMBatchesTable from "@modules/production/components/details/RMBatchesTable.vue"
import RMLinkedRecipesTable from "@modules/production/components/details/RMLinkedRecipesTable.vue"
import RMUsageHistoryTable from "@modules/production/components/details/RMUsageHistoryTable.vue"
import { useProductionStore } from "@modules/production/store"
import { useMediaQuery } from "@vueuse/core"
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"

const materialTabs = [
  { title: "Batches", key: "batches" },
  { title: "Usage History", key: "usage" },
  { title: "Linked Recipes", key: "recipes" },
]

const route = useRoute()
const showEdit = ref(false)
const showAdjust = ref(false)
const activeTab = ref("batches")
const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)
const selectedComponent = computed(() => useProductionStore().selectedComponentOption)

const { data: material, isPending, refetch } = useGetSingleRawMaterial(route.params.id as string)

const actionMenus = computed(() => [
  {
    label: `Edit ${selectedComponent.value?.value || "material"}`,
    icon: "edit",
    action: () => (showEdit.value = true),
  },
  { label: "Adjust stock", icon: "box", action: () => (showAdjust.value = true) },
])

const materialStats = computed(() => [
  {
    label: "Current Stock",
    value: `${material.value?.current_stock?.toLocaleString() ?? 0} ${material.value?.unit || ""}`,
    icon: "bag",
  },
  {
    label: "Avg Cost per Unit",
    value: `${formatCurrency(material.value?.avg_cost || 0)}/kg`,
    icon: "bag",
  },
  {
    label: "Last Purchase Cost",
    value: `${formatCurrency(material.value?.last_cost || 0)}/kg`,
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
    <PageHeader v-if="isMobile" :title="`${selectedComponent?.label} Details`" inner />

    <BackButton v-else :label="`Back to ${selectedComponent?.label}`" to="/raw-materials" />

    <div class="mt-4" />

    <EmptyState
      v-if="isPending || !material"
      :loading="isPending"
      icon="box"
      title="Loading material details..."
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
                :label="!isMobile ? `Manage ${selectedComponent?.value}` : ''"
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
    </div>
  </div>
</template>
