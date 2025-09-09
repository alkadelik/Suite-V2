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
