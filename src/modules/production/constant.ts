import { TableColumn } from "@components/DataTable.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import {
  TRawMaterial,
  TLinkedRecipe,
  TBatch,
  TMovement,
  TRecipe,
  TProdRun,
  TProdRunIngredientUsed,
} from "./types"
import componentPng from "@/assets/images/components.png"
import ingredientPng from "@/assets/images/ingredients.png"
import materialPng from "@/assets/images/materials.png"
import { formatDate } from "@/utils/formatDate"
import { startCase } from "@/utils/format-strings"

// =================================================
// ================ RAW MATERIALS =========================

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
    cell: ({ item }) => {
      const { format } = useFormatCurrency()
      return Number(item.last_cost) ? `${format(Number(item.last_cost))}/${item.unit}` : "-"
    },
  },
  {
    header: "Avg. Cost",
    accessor: "average_cost",
    cell: ({ item }) => {
      const { format } = useFormatCurrency()
      return Number(item.last_cost) ? `${format(Number(item.avg_cost))}/${item.unit}` : "-"
    },
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
    cell: ({ item }) => {
      const { format } = useFormatCurrency()
      return format(Number(item.total_cost))
    },
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
    cell: ({ item }) => {
      const { format } = useFormatCurrency()
      return format(Number(item.total_cost))
    },
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

export const UNITS_OF_MEASURE = [
  { label: "Kilograms (kg)", value: "kg" },
  { label: "Grams (g)", value: "g" },
  { label: "Liters (L)", value: "L" },
  { label: "Milliliters (ml)", value: "ml" },
  { label: "Pieces (pcs)", value: "pcs" },
  { label: "Meters (m)", value: "m" },
  { label: "Sheets", value: "sheets" },
  { label: "Bags", value: "bags" },
  { label: "Boxes", value: "boxes" },
]

// =================================================
// ================ RECIPES =========================

export const RECIPES_COLUMN: TableColumn<TRecipe>[] = [
  { header: "Output Item", accessor: "output_item_name" },
  { header: "Ingredient Count", accessor: "ingredient_count" },
  { header: "Cost Processes", accessor: "process_cost_count" },
  {
    header: "Status",
    accessor: "is_active",
    cell: ({ item }) => (item.is_active ? "Active" : "Disabled"),
  },
  {
    header: "Last Edited",
    accessor: "updated_at",
    cell: ({ item }) => formatDate(item.updated_at as string),
  },
  // {
  //   header: "Avg. Cost",
  //   accessor: "average_cost",
  //   cell: ({ item }) => {
  //     const { format } = useFormatCurrency()
  //     return format(Number(item.average_cost)) + "/" + item.output_unit
  //   },
  // },
  { header: "Actions", accessor: "actions" },
]

export const recipeNameOptions = [
  {
    label: "Recipes",
    value: "recipe",
    desc: "Common for food, beverages & craft production",
    examples: "e.g., flour, sugar, cooking oil",
    class: "border-warning-200 bg-warning-50",
    image: ingredientPng,
  },
  {
    label: "BOM (Bill of Materials)",
    value: "bom",
    desc: "Common for manufacturing & assembly",
    examples: "e.g. fabric, plastic bottles, packaging",
    class: "border-blue-200 bg-blue-50",
    image: materialPng,
  },
  {
    label: "Formula",
    value: "formula",
    desc: "Common for chemicals & blends",
    examples: "e.g., screws, circuit boards, casings",
    class: "border-purple-200 bg-purple-50",
    image: componentPng,
  },
]

// =======================================
// ================ PRODUCTION RUNS =========================

export const PROD_RUNS_COLUMN: TableColumn<TProdRun>[] = [
  { header: "Run ID", accessor: "run_id" },
  { header: "Output Item", accessor: "output_item_name" },
  { header: "", accessor: "damaged_quantity" },
  {
    header: "Output Quantity",
    accessor: "quantity_to_produce",
    cell: ({ value }) => parseInt(value as string),
  },
  {
    header: "Usable Quantity",
    accessor: "usable_quantity",
    cell: ({ value }) => parseInt(value as string),
  },
  {
    header: "Total Cost",
    accessor: "last_cost",
    cell: ({ item }) => {
      const { format } = useFormatCurrency()
      return format(Number(item.total_cost), { kobo: true })
    },
  },
  {
    header: "Status",
    accessor: "status",
    cell: ({ item }) => startCase(item.status as string),
  },
  {
    header: "Date created",
    accessor: "date_created",
    cell: ({ item }) => formatDate(item.created_at as string),
  },
  { header: "", accessor: "actions" },
]

export const PROD_RUN_INGREDIENT_COLUMN: TableColumn<TProdRunIngredientUsed>[] = [
  { header: "Name", accessor: "material_name" },
  {
    header: "Quantity Used",
    accessor: "quantity_required",
    cell: ({ item }) => `${parseInt(String(item.quantity_required))} ${item.unit}`,
  },
  {
    header: "Average Cost",
    accessor: "actual_unit_cost",
    cell: ({ item }) => {
      const { format } = useFormatCurrency()
      return Number(item.actual_unit_cost)
        ? format(Number(item.actual_unit_cost)) + "/" + item.unit
        : "-"
    },
  },
  {
    header: "Total Cost",
    accessor: "actual_total_cost",
    cell: ({ item }) => {
      const { format } = useFormatCurrency()
      return Number(item.actual_total_cost) ? format(Number(item.actual_total_cost)) : "-"
    },
  },
]
