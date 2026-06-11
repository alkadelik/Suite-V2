import { AxiosError } from "axios"
import { toast } from "@/composables/useToast"

interface ErrorResponse {
  errors?: Record<string, unknown>
  message?: string
  [key: string]: unknown
}

// Depth-first search for the first non-empty leaf string in an arbitrarily
// nested error value. Handles DRF nested-serializer shapes the explicit
// branches below don't, e.g.
//   "transfers": { "0": { "quantity": ["Insufficient stock. Available: 80"] } }
//   "transfers": [ { "quantity": ["..."] } ]
const extractLeafString = (val: unknown, depth = 0): string | null => {
  if (depth > 6) return null
  if (typeof val === "string") return val.trim() || null
  if (Array.isArray(val)) {
    for (const item of val) {
      const leaf = extractLeafString(item, depth + 1)
      if (leaf) return leaf
    }
    return null
  }
  if (typeof val === "object" && val !== null) {
    for (const v of Object.values(val as Record<string, unknown>)) {
      const leaf = extractLeafString(v, depth + 1)
      if (leaf) return leaf
    }
    return null
  }
  return null
}

export const formatError = (error: unknown): string => {
  console.error("API Error:", error)

  const { code, response } = error as AxiosError
  const data = (response?.data as ErrorResponse) ?? {}
  const errors = data.errors || data.error || data // fallback to root-level fields if `errors` is missing
  const message = data.message

  let nestedVal: string | null = null

  if (typeof errors === "object" && errors !== null) {
    if ("message" in errors && typeof errors.message === "string") {
      nestedVal = errors.message
    } else {
      const entries = Object.entries(errors)

      if (entries.length) {
        const [key, value] = entries[0]

        // Handle: "field": ["This field may not be null."]
        if (Array.isArray(value) && typeof value[0] === "string") {
          nestedVal = value[0].includes("required") ? `${key}: ${value[0]}` : value[0]
        }

        // Handle: "field": "Some error"
        else if (typeof value === "string") {
          nestedVal = value.includes("required") ? `${key}: ${value}` : value
        }

        // Handle: nested object error like [ {}, { field: "error" } ]
        else if (
          Array.isArray(value) &&
          value.length > 1 &&
          typeof value[1] === "object" &&
          value[1] !== null
        ) {
          const nestedObj = value[1] as Record<string, unknown>
          const nestedEntries = Object.entries(nestedObj)
          if (nestedEntries.length) {
            const [nestedKey, nestedValue] = nestedEntries[0]
            nestedVal = `${nestedKey}: ${String(nestedValue)}`
          }
        }

        // Handle deeply-nested DRF serializer errors the branches above miss,
        // e.g. "transfers": { "0": { "quantity": ["Insufficient stock. Available: 80"] } }
        else if (typeof value === "object" && value !== null) {
          nestedVal = extractLeafString(value)
        }
      }
    }
  }

  const errMsg =
    code === "ERR_NETWORK"
      ? "Network Error: Unable to reach the server"
      : nestedVal || message || "Oops! Something went wrong."

  return errMsg
}

export const displayError = (error: unknown): void => {
  const errMsg = formatError(error)
  toast.error(errMsg)
}
