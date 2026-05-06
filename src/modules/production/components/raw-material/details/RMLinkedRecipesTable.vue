<script setup lang="ts">
import Chip from "@components/Chip.vue"
import DataTable from "@components/DataTable.vue"
import RMTableCard from "./RMTableCard.vue"
import { TRawMaterial } from "@modules/production/types"
import { LINKED_RECIPES_COLUMN } from "@modules/production/constant"

defineProps<{ material: TRawMaterial }>()
</script>

<template>
  <div>
    <div class="space-y-4 overflow-hidden rounded-xl border-gray-200 md:border md:bg-white">
      <DataTable
        :data="material.linked_recipes ?? []"
        :columns="LINKED_RECIPES_COLUMN"
        :loading="false"
        :enable-row-selection="false"
        :empty-state="{
          title: `No Linked Recipes Available`,
          description: `Start tracking your linked recipes by adding them to the system.`,
        }"
        :show-pagination="false"
      >
        <template #cell:output_item_name="{ item }">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-700">{{ item.output_item_name }}</span>
            <Chip :label="`${parseInt(item.output_quantity)} ${item.output_unit}`" />
          </div>
        </template>
        <template #cell:item_type="{ item }">
          <Chip
            :label="item.item_type"
            class="capitalize"
            :color="item.item_type === 'product' ? 'blue' : 'purple'"
          />
        </template>
        <template #cell:actions="{ item }">
          <router-link
            :to="`/production/recipes/${item.uid}`"
            class="text-primary-600 text-sm font-medium underline"
          >
            View recipe
          </router-link>
        </template>
        <template #mobile="{ item }">
          <RMTableCard
            @click="$router.push(`/production/recipes/${item.uid}`)"
            :title="item.output_item_name"
            icon="beaker"
          >
            <template #append>
              <Chip :label="`${parseInt(item.output_quantity)} ${item.output_unit}`" />
            </template>
            <template #body>
              <div>
                <p class="text-sm font-medium">--</p>
                <p class="text-core-600 text-xs">Qty per batch</p>
              </div>

              <Chip
                :label="item.item_type"
                class="capitalize"
                :color="item.item_type === 'product' ? 'blue' : 'purple'"
              />
            </template>
          </RMTableCard>
        </template>
      </DataTable>
    </div>
  </div>
</template>
