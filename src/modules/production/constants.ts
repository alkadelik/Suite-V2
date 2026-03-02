import { TableColumn } from "@components/DataTable.vue"
import { formatCurrency } from "@/utils/format-currency"
import { TRawMaterial, TLinkedRecipe, TBatch, TMovement } from "./types"
import componentPng from "@/assets/images/components.png"
import ingredientPng from "@/assets/images/ingredients.png"
import materialPng from "@/assets/images/materials.png"
import { formatDate } from "@/utils/formatDate"

export const RAW_MATERIALS_COLUMN: TableColumn<TRawMaterial>[] = [
  { header: "Name", accessor: "name" },
  {
    header: "Stock",
    accessor: "stock",
    cell: ({ item }) => Number(item.current_stock).toLocaleString() + item.unit,
  },
  {
    header: "Last Cost",
    accessor: "last_cost",
    cell: ({ item }) =>
      Number(item.last_cost) ? `${formatCurrency(Number(item.last_cost))}/${item.unit}` : "-",
  },
  {
    header: "Avg. Cost",
    accessor: "average_cost",
    cell: ({ item }) =>
      Number(item.last_cost) ? `${formatCurrency(Number(item.avg_cost))}/${item.unit}` : "-",
  },
  { header: "", accessor: "actions" },
]

export const BATCHES_COLUMN: TableColumn<TBatch>[] = [
  {
    header: "Date Added",
    accessor: "date_added",
    cell: ({ value }) => formatDate(String(value)),
  },
  // { header: "Batch ID", accessor: "batch_number", class: "font-semibold" },
  { header: "Quantity Added", accessor: "quantity_added" },
  { header: "Quantity Left", accessor: "quantity_left" },
  { header: "Unit Cost", accessor: "unit_cost" },
  {
    header: "Total Cost",
    accessor: "total_cost",
    cell: ({ item }) => formatCurrency(Number(item.total_cost)),
  },
  { header: "Source", accessor: "source" },
]

export const USAGE_HISTORY_COLUMN: TableColumn<TMovement>[] = [
  { header: "Date", accessor: "created_at", cell: ({ value }) => formatDate(String(value)) },
  { header: "Type", accessor: "movement_type" },
  { header: "Reason", accessor: "reason" },
  { header: "Quantity", accessor: "quantity" },
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

export const componentOptions = [
  {
    label: "Ingredients",
    value: "ingredients",
    desc: "Common for food, beverages & cosmetics",
    examples: "e.g., flour, sugar, cooking oil",
    class: "border-warning-200 bg-warning-50",
    image: ingredientPng,
  },
  {
    label: "Raw Materials",
    value: "raw_materials",
    desc: "Common for manufacturing & retail",
    examples: "e.g. fabric, plastic bottles, packaging",
    class: "border-blue-200 bg-blue-50",
    image: materialPng,
  },
  {
    label: "Components",
    value: "components",
    desc: "Common for assembly & electronics",
    examples: "e.g., screws, circuit boards, casings",
    class: "border-purple-200 bg-purple-50",
    image: componentPng,
  },
]

export const recipeNameOptions = [
  {
    label: "Recipe",
    value: "recipe",
    desc: "Common for food, beverages & craft production",
    // examples: "e.g., flour, sugar, cooking oil",
    class: "border-warning-200 bg-warning-50",
    image: ingredientPng,
  },
  {
    label: "BOM (Bill of Materials)",
    value: "bom",
    desc: "Common for manufacturing & assembly",
    // examples: "e.g. fabric, plastic bottles, packaging",
    class: "border-blue-200 bg-blue-50",
    image: materialPng,
  },
  {
    label: "Formula",
    value: "formula",
    desc: "Common for chemicals & blends",
    // examples: "e.g., screws, circuit boards, casings",
    class: "border-purple-200 bg-purple-50",
    image: componentPng,
  },
]
