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
  value: number = 0,
  { currency = "NGN", kobo = false }: { currency?: string; kobo?: boolean } = {},
): string {
  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: kobo ? 2 : 0,
    maximumFractionDigits: kobo ? 2 : 0,
  }).format(value)
}
