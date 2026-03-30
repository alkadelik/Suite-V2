<script setup lang="ts">
import DataTable from "@components/DataTable.vue"
import type { TableColumn } from "@components/DataTable.vue"
import { formatCurrency } from "@/utils/format-currency"

type UsageRow = {
  date: string
  type: string
  reason: string
  quantity: number
  unit: string
  total_cost: number
  performed_by: string
}

const props = defineProps<{ rows: UsageRow[] }>()

const columns: TableColumn<UsageRow>[] = [
  { header: "Date", accessor: "date" },
  { header: "Type", accessor: "type" },
  { header: "Reason", accessor: "reason" },
  {
    header: "Quantity",
    accessor: "quantity",
    cell: ({ item }) => `${item.quantity}/${item.unit}`,
  },
  {
    header: "Total Cost",
    accessor: "total_cost",
    cell: ({ item }) => formatCurrency(Number(item.total_cost)),
  },
  { header: "Performed By", accessor: "performed_by" },
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
