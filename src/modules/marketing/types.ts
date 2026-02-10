export interface ISubscriber {
  uid: string
  email: string
  source: "newsletter" | "waitlist"
  created_at: string
  [key: string]: unknown
}

export interface ISubscriberResponse {
  count: number
  next: string | null
  previous: string | null
  results: ISubscriber[]
}

export interface ISubscriberExportPayload {
  export_fields: string[]
  source: string
  period: string
  start_date?: string
  end_date?: string
}
