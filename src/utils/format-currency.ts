/**
 * Formats a number as a currency string using Intl.NumberFormat
 *
 * @param value - The numeric value to format
 * @param options - Configuration options for formatting
 * @param options.currency - The currency code (default: "NGN")
 * @param options.kobo - Whether to show decimal places (default: true)
 * @returns The formatted currency string
 *
 * @example
 * // Format USD with decimals
 * formatCurrency(1234.56)
 * // Returns: "$1,234.56"
 *
 * @example
 * // Format EUR without decimals
 * formatCurrency(1234.56, { currency: "EUR", kobo: false })
 * // Returns: "€1,235"
 *
 * @example
 * // Format NGN with decimals (kobo)
 * formatCurrency(1234.56, { currency: "NGN" })
 * // Returns: "₦1,234.56"
 */
export function formatCurrency(
  value: number | string = 0,
  { currency = "NGN", kobo = false }: { currency?: string; kobo?: boolean } = {},
): string {
  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: kobo ? 2 : 0,
    maximumFractionDigits: kobo ? 2 : 0,
  }).format(typeof value === "string" ? parseFloat(value) : value)
}

/**
 * Formats a number as a truncated currency string (e.g., N100K, N1.5M, N2.3B)
 *
 * @param value - The numeric value to format
 * @param options - Configuration options for formatting
 * @param options.currency - The currency code (default: "NGN")
 * @param options.decimals - Number of decimal places to show (default: auto - shows decimals only when needed)
 * @returns The formatted truncated currency string
 *
 * @example
 * truncateCurrency(100000)
 * // Returns: "₦100K"
 *
 * @example
 * truncateCurrency(1500000)
 * // Returns: "₦1.5M"
 *
 * @example
 * truncateCurrency(1020000000, { decimals: 2 })
 * // Returns: "₦1.02B"
 *
 * @example
 * truncateCurrency(2300000000, { decimals: 1 })
 * // Returns: "₦2.3B"
 */
export function truncateCurrency(
  value: number | string = 0,
  { currency = "NGN", decimals }: { currency?: string; decimals?: number } = {},
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value

  if (isNaN(numValue)) return "-"

  // Get currency symbol
  const currencySymbol = new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(0)
    .replace(/\d/g, "")
    .trim()

  const absValue = Math.abs(numValue)
  const sign = numValue < 0 ? "-" : ""

  // Determine suffix and divisor
  let suffix = ""
  let divisor = 1

  if (absValue >= 1_000_000_000) {
    suffix = "B"
    divisor = 1_000_000_000
  } else if (absValue >= 1_000_000) {
    suffix = "M"
    divisor = 1_000_000
  } else if (absValue >= 1_000) {
    suffix = "K"
    divisor = 1_000
  } else {
    // For values less than 1000, show full number
    return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue)
  }

  const truncatedValue = absValue / divisor

  // Determine decimal places
  let decimalPlaces: number
  if (decimals !== undefined) {
    decimalPlaces = decimals
  } else {
    // Auto mode: show decimals only if there's a meaningful fractional part
    decimalPlaces = truncatedValue % 1 === 0 ? 0 : 2
  }

  const formattedNumber = truncatedValue.toFixed(decimalPlaces)

  return `${sign}${currencySymbol}${formattedNumber}${suffix}`
}

// Format price range from API (e.g., "10000.00 - 20000.00" or "10000.00 - 10000.00")
export const formatPriceRange = (
  value: string | number | boolean | Record<string, unknown> | null | undefined,
): string => {
  if (!value || typeof value !== "string") return "-"

  // Split the price range string
  const parts = value.split(" - ")
  if (parts.length !== 2) return "-"

  const minPrice = parseFloat(parts[0])
  const maxPrice = parseFloat(parts[1])

  // If prices are invalid
  if (isNaN(minPrice) || isNaN(maxPrice)) return "-"

  // If min and max are the same, show single price
  if (minPrice === maxPrice) {
    return formatCurrency(minPrice)
  }

  // Otherwise, show price range
  return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
}
