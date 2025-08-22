import { AxiosError } from "axios"
import { toast } from "vue3-toastify"

interface ErrorResponse {
  errors?: Record<string, unknown>
  message?: string
  [key: string]: unknown
}

export const formatError = (error: unknown): string => {
  console.error("API Error:", error)

  const { code, response } = error as AxiosError
  const data = (response?.data as ErrorResponse) ?? {}
  const errors = data.errors || data.error || data // fallback to root-level fields if `errors` is missing
  const message = data.message

  let nestedVal: string | null = null

  if (typeof errors === "object" && errors !== null) {
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
