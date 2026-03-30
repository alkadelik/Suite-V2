<script setup lang="ts">
import DataTable from "@components/DataTable.vue"
import type { TableColumn } from "@components/DataTable.vue"

type LinkedRow = {
  uid?: string
  item: string
  type: string
  quantity_per_batch: number
  unit: string
}

const props = defineProps<{ rows: LinkedRow[] }>()

const columns: TableColumn<LinkedRow>[] = [
  { header: "Item", accessor: "item" },
  { header: "Type", accessor: "type" },
  {
    header: "Quantity per Batch",
    accessor: "quantity_per_batch",
    cell: ({ item }) => `${item.quantity_per_batch}/${item.unit}`,
  },
]
</script>

<template>
  <DataTable
    :data="props.rows"
    :columns="columns"
    :enable-row-selection="false"
    :show-pagination="false"
  />
</template>
