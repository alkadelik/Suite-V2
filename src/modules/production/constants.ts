import { TableColumn } from "@components/DataTable.vue"
import { formatCurrency } from "@/utils/format-currency"
import { TRawMaterial, TBatch, TUsageHistory, TLinkedRecipe } from "./types"

export const RAW_MATERIALS_COLUMN: TableColumn<TRawMaterial>[] = [
  { header: "Name", accessor: "name" },
  { header: "Stock", accessor: "stock", cell: ({ item }) => item.stock + " " + item.unit },
  {
    header: "Last Cost",
    accessor: "last_cost",
    cell: ({ item }) => `${formatCurrency(Number(item.last_cost))}/${item.unit}`,
  },
  {
    header: "Avg. Cost",
    accessor: "average_cost",
    cell: ({ item }) => `${formatCurrency(Number(item.average_cost))}/${item.unit}`,
  },
  { header: "", accessor: "actions" },
]

export const MOCK_MATERIALS: TRawMaterial[] = [
  {
    uid: "mat-001",
    name: "Aluminum Sheets",
    stock: 150,
    unit: "sheets",
    category: "Metals",
    last_cost: 3000,
    average_cost: 2800,
    subassembly: false,
    low_stock: false,
    expired: false,
    expiration_date: "2025-12-31",
    created_at: "2023-01-15T10:00:00Z",
    updated_at: "2023-06-20T14:30:00Z",
  },
  {
    uid: "mat-002",
    name: "Plastic Pellets",
    stock: 500,
    unit: "kg",
    category: "Polymers",
    last_cost: 1500,
    average_cost: 1400,
    subassembly: false,
    low_stock: true,
    expired: false,
    expiration_date: "2024-11-30",
    created_at: "2023-02-10T11:15:00Z",
    updated_at: "2023-06-18T09:45:00Z",
  },
  {
    uid: "mat-003",
    name: "Copper Wires",
    stock: 200,
    unit: "meters",
    category: "Metals",
    last_cost: 5000,
    average_cost: 4800,
    subassembly: true,
    low_stock: false,
    expired: true,
    expiration_date: "2023-05-01",
    created_at: "2023-03-05T08:30:00Z",
    updated_at: "2023-06-15T12:20:00Z",
  },
]

export const BATCHES_COLUMN: TableColumn<TBatch>[] = [
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

export const USAGE_HISTORY_COLUMN: TableColumn<TUsageHistory>[] = [
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

export const LINKED_RECIPES_COLUMN: TableColumn<TLinkedRecipe>[] = [
  { header: "Item", accessor: "item" },
  { header: "Type", accessor: "type" },
  {
    header: "Quantity per Batch",
    accessor: "quantity_per_batch",
    cell: ({ item }) => `${item.quantity_per_batch}/${item.unit}`,
  },
]

export const MOCK_BATCHES = [
  {
    date_added: "2024-01-10",
    batch_number: "BATCH-001",
    quantity_added: 100,
    quantity_left: 75,
    unit_cost: 2800,
    unit: "sheets",
    total_cost: 280000,
    source: "Supplier A",
  },
  {
    date_added: "2024-01-15",
    batch_number: "BATCH-002",
    quantity_added: 200,
    quantity_left: 150,
    unit_cost: 1400,
    unit: "kg",
    total_cost: 280000,
    source: "Supplier B",
  },
  {
    date_added: "2024-01-20",
    batch_number: "BATCH-003",
    quantity_added: 50,
    quantity_left: 10,
    unit_cost: 4800,
    unit: "meters",
    total_cost: 240000,
    source: "Purchase Order #1234",
  },
]

export const MOCK_USAGE_HISTORY = [
  {
    date: "2024-01-12",
    type: "IN",
    reason: "Manufacturing Order #MO-001",
    quantity: 25,
    unit: "sheets",
    total_cost: 70000,
    performed_by: "John Doe",
  },
  {
    date: "2024-01-16",
    type: "OUT",
    reason: "Inventory Correction",
    quantity: -10,
    unit: "kg",
    total_cost: -14000,
    performed_by: "Jane Smith",
  },
  {
    date: "2024-01-22",
    type: "IN",
    reason: "Manufacturing Order #MO-002",
    quantity: 40,
    unit: "meters",
    total_cost: 192000,
    performed_by: "Mike Johnson",
  },
  {
    date: "2024-01-25",
    type: "OUT",
    reason: "Quality Control Failure",
    quantity: 5,
    unit: "sheets",
    total_cost: 14000,
    performed_by: "Sarah Williams",
  },
]

export const MOCK_LINKED_RECIPES = [
  {
    item: "Product A",
    type: "Finished Good",
    quantity_per_batch: 2.5,
    unit: "sheets",
  },
  {
    item: "Product B",
    type: "Finished Good",
    quantity_per_batch: 15,
    unit: "kg",
  },
  {
    item: "Sub-Assembly X",
    type: "Sub-Assembly",
    quantity_per_batch: 5,
    unit: "meters",
  },
  {
    item: "Product C",
    type: "Finished Good",
    quantity_per_batch: 1,
    unit: "sheets",
  },
]
