<script setup lang="ts">
import Chip from "@components/Chip.vue"
import DataTable from "@components/DataTable.vue"
import { LINKED_RECIPES_COLUMN, MOCK_LINKED_RECIPES } from "@modules/production/constants"
import RMTableCard from "./RMTableCard.vue"
</script>

<template>
  <div>
    <div class="space-y-4 overflow-hidden rounded-xl border-gray-200 md:border md:bg-white">
      <DataTable
        :data="MOCK_LINKED_RECIPES ?? []"
        :columns="LINKED_RECIPES_COLUMN"
        :loading="false"
        :enable-row-selection="false"
        :empty-state="{
          title: `No Linked Recipes Available`,
          description: `Start tracking your linked recipes by adding them to the system.`,
        }"
        :show-pagination="false"
      >
        <template #cell:type="{ item }">
          <Chip :label="item.type" color="blue" />
        </template>
        <template #mobile="{ item }">
          <RMTableCard :title="item.item" icon="beaker">
            <template #body>
              <div>
                <p class="text-sm font-medium">{{ item.quantity_per_batch }} {{ item.unit }}</p>
                <p class="text-core-600 text-xs">Qty per batch</p>
              </div>

              <Chip :label="item.type" color="blue" />
            </template>
          </RMTableCard>
        </template>
      </DataTable>
    </div>
  </div>
</template>
