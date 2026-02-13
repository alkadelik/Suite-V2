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
  // expiring_soon_amount: number // NOT IN API RESPONSE
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
}
