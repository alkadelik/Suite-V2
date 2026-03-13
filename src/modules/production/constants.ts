import { TableColumn } from "@components/DataTable.vue"
import { formatCurrency } from "@/utils/format-currency"
import { TRawMaterial, TLinkedRecipe, TBatch, TMovement, TRecipes } from "./types"
import componentPng from "@/assets/images/components.png"
import ingredientPng from "@/assets/images/ingredients.png"
import materialPng from "@/assets/images/materials.png"
import { formatDate } from "@/utils/formatDate"

const toDateOnly = (v: string) => (v ? v.slice(0, 10) : "--")

export const RECIPES_COLUMN: TableColumn<TRecipes>[] = [
  { header: "Output Item", accessor: "output_item_name" }, // output_item_name +

  // {
  //   header: "Output Quantity",
  //   accessor: "output_quantity",
  //   cell: ({ item }) => formatQty(item.output_quantity),
  // },

  {
    header: "Ingredient Count",
    accessor: "ingredient_count",
    cell: ({ item }) => String(item.ingredient_count ?? "—"),
  },

  {
    header: "Status",
    accessor: "is_active",
    cell: ({ item }) => (item.is_active ? "Active" : "Disabled"),
  },

  {
    header: "Last Edited",
    accessor: "updated_at",
    cell: ({ item }) => toDateOnly(item.updated_at as string),
  },

  // ✅ new accessors so we can render values via slots
  { header: "Last Cost", accessor: "last_cost" },
  { header: "Avg. Cost", accessor: "average_cost" },

  { header: "Actions", accessor: "actions" },
]
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

// You can keep RECIPE_MATERIALS, but make it match the new type exactly.

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
    created_at: "2023-01-15",
    updated_at: "2023-06-20",
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
    created_at: "2023-02-10",
    updated_at: "2023-06-18",
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
    created_at: "2023-03-05",
    updated_at: "2023-06-15",
  },
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
