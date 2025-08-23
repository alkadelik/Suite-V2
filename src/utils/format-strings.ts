/**
 * Converts strings like:
 * - "first_name" → "First Name"
 * - "camelCaseInput" → "Camel Case Input"
 * - "some-mixed_stringInput" → "Some Mixed String Input"
 */
export function startCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to space
    .replace(/[_-]+/g, " ") // snake_case / kebab-case to space
    .replace(/\s+/g, " ") // normalize spaces
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase()) // capitalize first letter of each word
}

/**
 * Generates initials from a name string.
 * - If the name has one part, returns the first letter capitalized.
 * - If the name has two parts, returns the first letters of both parts capitalized.
 * - Handles cases with no name or empty strings gracefully.
 *
 * @param name - The full name string
 * @returns The initials as a string
 */

export function getInitials(name: string): string {
  const parts = name.split(" ")
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
}

export type TNameObj = { first_name?: string; last_name?: string }
/** Constructs a full name from an object with optional first_name and last_name properties.
 *  - If both names are missing, returns a fallback string (default: "Unknown User").
 * @param nameObj - Object containing optional first_name and last_name
 * @param fallback - Fallback string if both names are missing (default: "Unknown User")
 * @returns The full name as a string.
 */
export function getFullName(obj: TNameObj = {}, fallback: string = "Unknown User"): string {
  const firstName = obj?.first_name ? obj.first_name : ""
  const lastName = obj?.last_name ? obj.last_name : ""
  return startCase(`${firstName} ${lastName}`.trim()) || fallback
}
