<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { formatDate } from "@/utils/formatDate"
import AppButton from "@components/AppButton.vue"
import BackButton from "@components/BackButton.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import PageHeader from "@components/PageHeader.vue"
import StatCard from "@components/StatCard.vue"
import Tabs from "@components/Tabs.vue"
import RMBatchesTable from "@modules/production/components/details/RMBatchesTable.vue"
import RMLinkedRecipesTable from "@modules/production/components/details/RMLinkedRecipesTable.vue"
import RMUsageHistoryTable from "@modules/production/components/details/RMUsageHistoryTable.vue"
import { useProductionStore } from "@modules/production/store"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"

const materialTabs = [
  { title: "Batches", key: "batches" },
  { title: "Usage History", key: "usage" },
  { title: "Linked Recipes", key: "recipes" },
]

const activeTab = ref("batches")
const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)
const selectedComponent = computed(() => useProductionStore().selectedComponentOption)

const actionMenus = computed(() => [
  {
    label: `Edit ${selectedComponent.value?.value || "material"}`,
    icon: "edit",
    action: () => {},
  },
  {
    label: "Adjust stock",
    icon: "box",
    action: () => {},
  },
])

const materialStats = computed(() => [
  {
    label: "Current Stock",
    value: `45kg`,
    icon: "bag",
  },
  {
    label: "Avg Cost per Unit",
    value: `${formatCurrency(4800)}/kg`,
    icon: "bag",
  },
  {
    label: "Last Purchase Cost",
    value: `${formatCurrency(4800)}/kg`,
    icon: "bag",
    chip: isMobile.value ? undefined : formatDate(new Date()),
    chipColor: "blue",
  },
  {
    label: "Stock Level",
    value: undefined,
    icon: "bag",
    chip: "Good",
    chipColor: "success",
  },
])
</script>

<template>
  <div class="px-3 lg:px-6 lg:pt-8">
    <PageHeader v-if="isMobile" :title="`${selectedComponent?.label} Details`" inner />

    <BackButton v-else :label="`Back to ${selectedComponent?.label}`" to="/raw-materials" />

    <div class="mt-4" />

    <section class="mb-6 flex justify-between gap-4">
      <div>
        <h2 class="mb-4 text-2xl font-semibold">Shea Butter</h2>
        <div class="flex gap-1">
          <Chip label="Sub-assembly" color="purple" />
          <Chip label="Unit - kg" color="success" />
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
          <RMBatchesTable />
        </template>

        <template #usage>
          <RMUsageHistoryTable />
        </template>

        <template #recipes>
          <RMLinkedRecipesTable />
        </template>
      </Tabs>
    </section>
  </div>
</template>
