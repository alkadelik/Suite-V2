<script setup lang="ts">
import DataTable from "@components/DataTable.vue"
import type { TableColumn } from "@components/DataTable.vue"
import { formatCurrency } from "@/utils/format-currency"

type BatchRow = {
  date_added: string
  batch_number: string
  quantity_added: number
  quantity_left: number
  unit_cost: number
  unit: string
  total_cost: number
  source: string
}

const props = defineProps<{ rows: BatchRow[] }>()

const columns: TableColumn<BatchRow>[] = [
  { header: "Date Added", accessor: "date_added" },
  { header: "Batch ID", accessor: "batch_number", class: "font-semibold" },
  { header: "Quantity Added", accessor: "quantity_added" },
  { header: "Quantity Left", accessor: "quantity_left" },
  {
    header: "Unit Cost",
    accessor: "unit_cost",
    cell: ({ item }) => `${formatCurrency(Number(item.unit_cost))}/${item.unit}`,
  },
  {
    header: "Total Cost",
    accessor: "total_cost",
    cell: ({ item }) => formatCurrency(Number(item.total_cost)),
  },
  { header: "Source", accessor: "source" },
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
