/**
 * Color validation and normalization utilities
 */

const HEX_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/

/**
 * Validates if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return HEX_REGEX.test(color)
}

/**
 * Normalizes a hex color to uppercase 6-character format
 * @example normalizeHexColor("#fff") => "#FFFFFF"
 * @example normalizeHexColor("#aabbcc") => "#AABBCC"
 */
export function normalizeHexColor(color: string): string {
  if (!isValidHexColor(color)) {
    return "#000000"
  }

  const hex = color.toUpperCase()

  // Expand 3-character hex to 6-character
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }

  return hex
}

/**
 * Safely parses a color string, returning a default if invalid
 */
export function safeParseColor(color: string | undefined, fallback = "#000000"): string {
  if (!color) return fallback
  return isValidHexColor(color) ? normalizeHexColor(color) : fallback
}
