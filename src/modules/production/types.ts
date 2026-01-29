export type TRawMaterial = {
  uid: string
  name: string
  stock: number
  unit: string
  category: string
  last_cost: number
  average_cost: number
  subassembly?: boolean
  low_stock?: boolean
  expired?: boolean
  expiration_date?: string
  created_at: string
  updated_at: string
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
  total: number
  low_stock: number
  expiring_soon: number
  expiring_soon_amount: number
  inventory_value: number
}

export type TBatch = {
  date_added: string
  batch_number: string
  quantity_added: number
  quantity_left: number
  unit_cost: number
  unit: string
  total_cost: number
  source: string
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
