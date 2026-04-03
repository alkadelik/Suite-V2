// utils/dateFormatter.ts
export function formatDate(value: string | number | boolean | Date | null | undefined): string {
  if (!value) return "-"

  if (typeof value === "boolean") return "-"

  const date = new Date(value)
  if (isNaN(date.getTime())) return "-" // invalid date

  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()

  if (isSameDay(date, today)) return "Today"
  if (isSameDay(date, yesterday)) return "Yesterday"

  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yyyy = date.getFullYear()

  return `${dd}-${mm}-${yyyy}`
}

// utils/dateFormatter.ts
export function formatDateLong(value: string | number | boolean | Date | null | undefined): string {
  if (!value) return "-"

  if (typeof value === "boolean") return "-"

  const date = new Date(value)
  if (isNaN(date.getTime())) return "-" // invalid date

  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()

  if (isSameDay(date, today)) return "Today"
  if (isSameDay(date, yesterday)) return "Yesterday"

  // Example: Aug 5, 2025
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
