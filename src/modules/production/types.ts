// ====== Raw materials ==========

export type TSupplier = {
  uid: string
  name: string
  notes: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TBatch = {
  uid: string
  date_added: string
  quantity: string
  remaining_quantity: string
  unit_cost: string
  total_cost: number
  source_type: string
  source_id: string | null
  notes?: string
}

export type TMovement = {
  uid: string
  created_at: string
  movement_type: string
  quantity: string
  unit_cost: string
  total_cost: string
  reason: string
  notes: string
  source_type: string
  source_id: string | null
  breakdown: {
    quantity: string
    batch_uid: string
  }
  performed_by?: string
}

export type TConversion = {
  uid: string
  from_unit: string
  to_unit: string
  rate: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TRawMaterial = {
  uid: string
  name: string
  unit: string
  default_cost?: string
  is_sub_assembly: boolean
  expiry_date?: string | null
  reorder_threshold?: number | null
  notes?: string
  current_stock: number
  avg_cost: number
  last_cost: number
  last_cost_date?: string
  low_stock: boolean
  created_at: string
  updated_at?: string
  suppliers?: TSupplier[]
  conversions?: TConversion[]
  batches?: TBatch[]
  movements?: TMovement[]
}

export interface RawMaterialPayload {
  date: string
  amount: string
  currency: string
  category: string
  sub_category: string
  vendor?: string
  notes?: string
  attachment_url: File | string | null
  status: string
}

export interface RawMaterialStats {
  total_materials: number
  low_stock: number
  expiring_soon: number
  inventory_value: number
}

export type TUsageHistory = {
  date: string
  type: string
  reason: string
  quantity: number
  unit: string
  total_cost: number
  performed_by: string
}

export type TLinkedRecipe = {
  item: string
  type: string
  quantity_per_batch: number
  unit: string
}

export interface IConversionPayload {
  from_unit: string
  to_unit: string
  rate: string
  name: string
  is_active: boolean
}

export interface ICreateMaterialPayload {
  name: string
  unit: string
  qty_in_stock: string
  default_cost?: string | number
  is_sub_assembly: boolean
  suppliers?: string[]
  expiry_date?: string
  reorder_threshold?: string
  notes?: string
  conversion?: IConversionPayload
}

export interface IAdjustStockPayload {
  movement_type: "add" | "remove"
  quantity: number
  reason: string
  notes?: string
}

// ======= Recipes submodule ========

export type TRecipe = {
  uid: string
  output_product?: string | null
  output_raw_material?: string | null
  output_item_name: string
  output_unit: string
  item_type: "sub_assembly" | "product"
  output_quantity: string
  notes?: string
  ingredient_count: number
  process_cost_count: number
  producible_quantity: number
  estimated_cost_per_batch?: number
  last_cost: number
  average_cost: number
  ingredients?: TRecipeIngredient[]
  process_costs?: TRecipeProcessCost[]
  is_active: boolean
  created_at: string
  updated_at: string
  // not in api yet
  last_used_in_production?: string
}

export type TRecipeIngredient = {
  uid: string
  material_uid: string
  material_name: string
  quantity: number
  unit: string
  unit_cost: number
  estimated_cost: number
}

export type TRecipeProcessCost = {
  uid: string
  name: string
  cost_per_batch: number
  notes: string
}

export interface IRecipePayload {
  output_item_type: "product" | "sub_assembly"
  output_item_uid: string
  output_quantity: string | number
  output_unit: string
  notes?: string
  ingredients?: {
    material_uid: string
    quantity: string | number
  }[]
  process_costs?: {
    name: string
    cost_per_batch: string | number
    notes?: string
  }[]
  is_active?: boolean
}

export interface IRecipeStats {
  total_recipes: number
  active_recipes: number
  producible_now: number
}

// ======= Prod run submodule ========

export type TProdRunFifoBreakdown = {
  quantity: string
  batch_uid: string
  unit_cost: string
}

export type TProdRunIngredientUsed = {
  uid: string
  material_uid: string
  material_name: string
  quantity_required: string
  unit: string
  available_inventory: number
  is_sufficient_inventory: boolean
  missing_quantity: number
  estimated_cost: string
  actual_total_cost: string
  actual_unit_cost: string
  fifo_breakdown: TProdRunFifoBreakdown[]
  is_adjusted: boolean
}

export type TProdRunProcessCostUsed = {
  uid: string
  name: string
  cost_per_batch: string
  total_cost: number
  is_adjusted: boolean
}

export type TProdRunAdditionalExpense = {
  uid: string
  name: string
  cost_type: string
  amount: string
  notes: string
}

export type TProdRun = {
  uid: string
  recipe: string
  output_product: string | null
  output_raw_material: string | null
  output_variant: string | null
  output_item_name: string
  output_unit: string
  item_type: "product" | "sub_assembly"
  quantity_to_produce: string
  damaged_quantity: string
  usable_quantity: string
  material_cost_total: string
  process_cost_total: string
  extra_cost_total: string
  total_cost: string
  cost_per_unit: string
  selling_price_per_unit: string
  expected_profit_per_unit: string
  expected_profit_per_batch: string
  status: "draft" | "finalized"
  notes: string
  created_at: string
  finalized_at: string | null
  // detail fields — available when fetching a single prod run
  ingredients_used?: TProdRunIngredientUsed[]
  process_costs_used?: TProdRunProcessCostUsed[]
  additional_expenses?: TProdRunAdditionalExpense[]
}

export interface IProdRunStats {
  total_runs: number
  total_units_produced: number
  total_production_cost: number
  avg_cost_per_unit: number
}

export type ProdRunStatus = "draft" | "in_progress" | "completed" | "finalized"

export interface ProductionRunData {
  uid?: string
  output_item_name?: string
  recipe_uid?: string
  quantity_produced?: number
  quantity_damaged?: number
  selling_price?: string
}

export interface IProdRunPayload {
  recipe_uid: string
  output_variant_uid?: string
  quantity_to_produce: string
  damaged_quantity?: string
  selling_price_per_unit?: string
  notes?: string
  ingredients?: {
    material_uid: string
    quantity_required: string
  }[]
  process_costs?: {
    recipe_process_cost_uid: string
    name: string
    cost_per_batch: string
  }[]
  additional_expenses?: {
    name: string
    cost_type: string
    amount: string
    notes?: string
  }[]
  status?: string
}
