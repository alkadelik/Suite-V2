export interface SmartDateLabelOptions {
  inputDate: string | number | Date
}

export const getSmartDateLabel = (inputDate: SmartDateLabelOptions["inputDate"]): string => {
  const date = new Date(inputDate)
  const now = new Date()

  const oneDay = 1000 * 60 * 60 * 24
  const diffInTime = now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)
  const diffInDays = Math.floor(diffInTime / oneDay)

  if (diffInDays === 0) return "Today"
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays <= 6) return date.toLocaleString("en-US", { weekday: "long" })

  // Fallback: format as "Apr 1, 2025"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export interface FormatDateOptions {
  inputDate: string | number | Date
}

export const formatDate = (inputDate: FormatDateOptions["inputDate"]): string => {
  const date = new Date(inputDate)

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export interface FormatEventDateRangeParams {
  start: string | number | Date
  end: string | number | Date
}

export function formatEventDateRange(
  start: FormatEventDateRangeParams["start"],
  end: FormatEventDateRangeParams["end"],
): string {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const sameMonth = startDate.getMonth() === endDate.getMonth()
  const sameYear = startDate.getFullYear() === endDate.getFullYear()

  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }

  const startFormatted = startDate.toLocaleDateString("en-US", options)
  const endDay = endDate.getDate()

  let result = ""

  if (sameMonth && sameYear) {
    result = `${startFormatted.split(" ")[0]} ${startDate.getDate()} - ${endDay}, ${startDate.getFullYear()}`
  } else {
    const endFormatted = endDate.toLocaleDateString("en-US", options)
    result = `${startFormatted} - ${endFormatted}, ${endDate.getFullYear()}`
  }

  return result
}

export interface CheckIfDateIsPastParams {
  date: string | number | Date
}

export const checkIfDateIsPast = (date: CheckIfDateIsPastParams["date"]): boolean => {
  const today = new Date()
  return new Date(date) < today
}

/**
 * Turns an hour count into a coarse countdown label — "6 days", "23 hours",
 * "45 mins". Rounds down so an "expires in" label never over-promises.
 */
export const formatHoursRemaining = (hours: number | string | null | undefined): string => {
  const value = Number(hours)
  if (!Number.isFinite(value) || value <= 0) return ""

  if (value >= 24) {
    const days = Math.floor(value / 24)
    return `${days} ${days === 1 ? "day" : "days"}`
  }
  if (value >= 1) {
    const whole = Math.floor(value)
    return `${whole} ${whole === 1 ? "hour" : "hours"}`
  }
  const mins = Math.max(1, Math.floor(value * 60))
  return `${mins} ${mins === 1 ? "min" : "mins"}`
}

export type DateRangeType =
  | "last_7_days"
  | "this_month"
  | "last_month"
  | "year_to_date"
  | "all_time"

export interface DateRangeResult {
  start_date: string
  end_date: string
}

/**
 * Calculate start and end dates based on the selected date range
 * @param rangeType - The type of date range to calculate
 * @returns Object with range="custom", start_date, and end_date in YYYY-MM-DD format
 */
export function calculateDateRange(rangeType: DateRangeType): DateRangeResult {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let startDate: Date
  let endDate: Date = today

  switch (rangeType) {
    case "last_7_days":
      startDate = new Date(today)
      startDate.setDate(startDate.getDate() - 7)
      break

    case "this_month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break

    case "last_month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0) // Last day of previous month
      break

    case "year_to_date":
      startDate = new Date(now.getFullYear(), 0, 1) // January 1st of current year
      break

    case "all_time":
      // For all_time, we set a very early start date (e.g., 10 years ago)
      startDate = new Date(now.getFullYear() - 10, 0, 1)
      break

    default:
      startDate = new Date(today)
      startDate.setDate(startDate.getDate() - 7)
  }

  return {
    start_date: formatDateToYYYYMMDD(startDate),
    end_date: formatDateToYYYYMMDD(endDate),
  }
}

/**
 * Format date to YYYY-MM-DD format
 */
function formatDateToYYYYMMDD(date: Date): string {
  return date.toLocaleDateString("en-CA") // Format as YYYY-MM-DD
}

/**
 * Compact relative time label, e.g. "today", "1d ago", "6d ago", "3w ago"
 * Falls back to an absolute date beyond a month.
 */
export const getRelativeTimeLabel = (inputDate: string | number | Date): string => {
  const date = new Date(inputDate)
  if (isNaN(date.getTime())) return ""

  const oneDay = 1000 * 60 * 60 * 24
  const diffInDays = Math.floor(
    (new Date().setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / oneDay,
  )

  if (diffInDays <= 0) return "today"
  if (diffInDays < 7) return `${diffInDays}d ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`

  return formatDate(date)
}
