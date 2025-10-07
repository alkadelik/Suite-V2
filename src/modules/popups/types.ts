export type PopupEvent = {
  uid: string
  name: string
  description: string
  event_address: string
  start_date: string
  end_date: string
  is_active: boolean
  is_live: boolean
  status: string
  banner_image: string | null
  qr_code: string | null
  event_ref: string
  slug: string
  location: string
  location_name: string
  store: string
  store_name: string
  store_slug: string
  customer_count: number
  items_sold_count: number
  products_count: number
  total_orders: number
  total_sales_amount: number
  participant_fee: number | null
  created_at: string
  updated_at: string
}

export interface PopupEventResponse {
  results: PopupEvent[]
  count: number
  next: string | null
  previous: string | null
}

export interface PopupPayload {
  name: string
  description: string
  event_address: string
  start_date: string
  end_date: string
  participant_fee: number | null
  banner_image?: File | null
}
