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
  batches?: TBatch[]
  movements?: TMovement[]
}

export type TProdRun = {
  uid: string
  run_id?: string
  recipe?: string
  output_item_name: string
  output_unit?: string
  output_quantity?: number
  quantity_to_produce?: string | number
  damaged_quantity: number | string
  usable_quantity?: number | string
  total_cost: number | string
  cost_per_unit?: string | number
  selling_price_per_unit?: string | number
  status: ProdRunStatus
  date_created?: string
  created_at?: string
  updated_at?: string
  ingredient_count?: number
  last_cost?: number | string
  finalized_at?: string
}

export type TRecipes = {
  uid: string
  output_product?: string | null
  output_raw_material?: string | null
  output_item_name: string
  output_unit?: string
  item_type: "product" | "sub_assembly"
  output_quantity: string | number
  producible_quantity: string | number
  ingredient_count: string | number
  process_cost_count: string | number
  last_cost?: string | number
  average_cost?: string | number
  is_active: boolean
  updated_at: string
}

export type TRecipesRow = TRecipes & {
  output_qty?: string | number
  outputQuantity?: string | number
  is_duplicate?: boolean
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
  default_cost: string
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

// ─── Shared API Types ─────────────────────────────────────────────────────────

export type ItemType = "product" | "sub_assembly" | "item"

export type OutputItemOption = {
  label: string
  value: string
  type: ItemType
  unit?: string
}

export type IngredientKind = "raw_material" | "sub_assembly"

export type IngredientOption = {
  label: string
  value: string
  unit?: string
  cost_per_unit: number
  kind: IngredientKind
}

export type IngredientEntityDetail = {
  name: string
  unit: string
}

export type RecipesQuery = {
  search?: string
  ordering?: string
  limit?: number
  offset?: number
  is_active?: boolean
  item_type?: "product" | "sub_assembly"
}

export type RecipeIngredient = {
  material_uid: string
  quantity: number
}

export type RecipeProcessCost = {
  name: string
  cost_per_batch: number
  notes?: string
}

export type RecipeDetail = {
  uid: string
  output_product?: string
  output_raw_material?: string
  output_item?: string
  output_item_name?: string
  output_unit?: string
  unit?: string
  output_quantity: string | number
  item_type: ItemType
  notes?: string
  is_active: boolean
  estimated_cost_per_batch?: string | number
  last_cost?: string | number
  average_cost?: string | number
  total_cost?: string | number
  ingredients: RecipeIngredient[]
  process_costs: RecipeProcessCost[]
  created_at: string
  updated_at: string
}

export type RecipeCreatePayload = {
  output_item_type: ItemType
  output_item_uid: string
  output_quantity: number
  notes?: string
  ingredients: RecipeIngredient[]
  process_costs: RecipeProcessCost[]
}

export type RecipePatchPayload = Partial<RecipeCreatePayload> & {
  is_active?: boolean
}

export type InventoryProduct = {
  uid: string
  name: string
  price: string
  unit: string
  total_stock: string
  sellable_stock: string
  needs_reorder: boolean
  variants_count: string
  is_active: boolean
  amount_sold: string
  quantity_sold: string
  memo_count: string
  return_count: string
  popup_quantity_taken: number
  is_hidden_from_storefront: boolean
  category: string
  has_variants: boolean
  is_sub_assembly?: boolean
}

export type InventorySubAssembly = {
  uid: string
  name: string
  unit?: string
  is_active?: boolean
}

export type RawMaterial = {
  uid: string
  name: string
  unit?: string
  last_cost?: string | number
  average_cost?: string | number
  is_sub_assembly?: boolean
}

// ─── Production Run Types ─────────────────────────────────────────────────────

export type ProdRunStatus = "draft" | "completed" | "in_progress" | "pending" | "cancelled"

export type ProdRunIngredientPayload = {
  material_uid: string
  quantity_required: string | number
}

export type ProdRunProcessCostPayload = {
  recipe_process_cost_uid?: string
  name: string
  cost_per_batch: string | number
}

export type ProdRunAdditionalExpensePayload = {
  name: string
  cost_type: "fuel" | "labor" | "electricity" | "transport" | "other"
  amount: string | number
  notes?: string
}

export type ProdRunCreatePayload = {
  recipe_uid: string
  output_variant_uid?: string
  quantity_to_produce: string | number
  damaged_quantity?: string | number
  selling_price_per_unit?: string | number
  notes?: string
  ingredients: ProdRunIngredientPayload[]
  process_costs: ProdRunProcessCostPayload[]
  additional_expenses: ProdRunAdditionalExpensePayload[]
}

export type ProdRunFinalizePayload = {
  recipe?: string
  output_product?: string
  output_raw_material?: string
  output_variant?: string
  quantity_to_produce: string | number
  damaged_quantity?: string | number
  usable_quantity?: string | number
  material_cost_total?: string | number
  process_cost_total?: string | number
  extra_cost_total?: string | number
  total_cost?: string | number
  cost_per_unit?: string | number
  selling_price_per_unit?: string | number
  expected_profit_per_unit?: string | number
  expected_profit_per_batch?: string | number
  notes?: string
}

export type ProdRunIngredientUsed = {
  uid: string
  material_uid: string
  material_name: string
  quantity_required: string | number
  unit: string
  available_inventory: string
  is_sufficient_inventory: string
  missing_quantity: string
  estimated_cost: string
  actual_total_cost: string | number
  actual_unit_cost: string | number
  fifo_breakdown: string
  is_adjusted: boolean
}

export type ProdRunProcessCostUsed = {
  uid: string
  name: string
  cost_per_batch: string | number
  total_cost: string
  is_adjusted: boolean
}

export type ProdRunAdditionalExpenseUsed = {
  uid: string
  name: string
  cost_type: string
  amount: string | number
  notes?: string
}

export type TProdRunDetail = {
  uid: string
  recipe: string
  output_product?: string
  output_raw_material?: string
  output_variant?: string
  output_item_name: string
  output_unit: string
  item_type: string
  quantity_to_produce: string | number
  damaged_quantity: string | number
  usable_quantity: string | number
  material_cost_total: string | number
  process_cost_total: string | number
  extra_cost_total: string | number
  total_cost: string | number
  cost_per_unit: string | number
  selling_price_per_unit: string | number
  expected_profit_per_unit: string | number
  expected_profit_per_batch: string | number
  status: ProdRunStatus
  notes: string
  ingredients_used: ProdRunIngredientUsed[]
  process_costs_used: ProdRunProcessCostUsed[]
  additional_expenses: ProdRunAdditionalExpenseUsed[]
  created_at: string
  finalized_at?: string
}

export type TProdRunListItem = {
  uid: string
  recipe: string
  output_item_name: string
  output_unit: string
  quantity_to_produce: string | number
  damaged_quantity: string | number
  usable_quantity: string | number
  total_cost: string | number
  cost_per_unit: string | number
  selling_price_per_unit: string | number
  status: ProdRunStatus
  created_at: string
  finalized_at?: string
}

// ─── Production Run Drawer ────────────────────────────────────────────────────

export type ProductionRunData = {
  uid?: string
  output_item_uid?: string
  output_item_name?: string
  recipe_uid?: string
  quantity_produced?: number
  quantity_damaged?: number
  selling_price?: string
}
