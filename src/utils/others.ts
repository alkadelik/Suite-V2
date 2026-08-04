import { toast } from "@/composables/useToast"

/** Copy text to clipboard and show toast notification
 *
 * @param text The text to copy to clipboard
 */
export function clipboardCopy(text: string) {
  // Clipboard API not available
  if (!navigator.clipboard) return
  //   Use Clipboard API to copy text
  navigator.clipboard.writeText(text).then(
    () => toast.success("Copied to clipboard"),
    () => toast.error("Failed to copy to clipboard"),
  )
}

/**  Format phone numbers: keep an existing dial code, otherwise add +234 and remove leading 0 */
export const formatPhoneNumber = (phone: string) => {
  if (!phone) return ""
  const trimmed = phone.replace(/\s+/g, "")
  // Already carries an international dial code (e.g. emitted by PhoneInput) — keep as-is
  if (trimmed.startsWith("+")) return trimmed
  // Bare local number — strip leading zeros and default to the Nigerian dial code
  return `+234${trimmed.replace(/^0+/, "")}`
}

/** Checks whether app is in staging environment  */
export const isStaging = String(import.meta.env.VITE_API_BASE_URL).includes("bpi")

/**
 * Converts a value to x decimal places and floats it
 * @param value
 * @param fractionDigits
 * @returns
 */
export const floatDecimal = (value: number | string, fractionDigits: number = 2) => {
  return parseFloat(Number(value).toFixed(fractionDigits))
}
