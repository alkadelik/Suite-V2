// src/modules/orders/utils/shipmentFormatters.ts
export type UnknownRecord = Record<string, unknown>

export const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v)

export const toText = (v: unknown, fallback = ""): string => {
  if (v === null || v === undefined) return fallback
  if (typeof v === "string") return v.trim() || fallback
  if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint") return String(v)
  if (v instanceof Date) return v.toISOString()
  return fallback
}

export const pickFirst = (obj: UnknownRecord, keys: string[]): unknown => {
  for (const k of keys) {
    const val = obj[k]
    const s = toText(val, "")
    if (s) return val
  }
  return undefined
}

export const getShipmentId = (row: UnknownRecord): string => {
  const uid = row["uid"]
  const uidStr = toText(uid, "")
  if (uidStr) return uidStr

  const id = row["id"]
  const idStr = toText(id, "")
  return idStr
}

export const getStatus = (row: UnknownRecord): string => {
  const raw = pickFirst(row, ["status", "state", "fulfilment_status"])
  return toText(raw, "").toLowerCase()
}

export const formatMoney = (v: unknown): string => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : Number.NaN

  if (!Number.isFinite(n)) return "--"
  return `₦${n.toLocaleString()}`
}
