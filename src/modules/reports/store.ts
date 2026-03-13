import { defineStore } from "pinia"
import { ref } from "vue"

type GeneratingMonthlyReport = {
  uid: string
  year: number
  month: number
  status: "generating"
  generatedAt: string | null
}

type GeneratingEODReport = {
  uid: string
  date: string
  status: "generating"
  generatedAt: string | null
}

export const useReportsStore = defineStore("reports", () => {
  // Track which months are currently generating reports
  const generatingReports = ref<Map<string, GeneratingMonthlyReport>>(new Map())
  // Track which dates are currently generating EOD reports
  const generatingEODReports = ref<Map<string, GeneratingEODReport>>(new Map())

  const getReportKey = (year: number, month: number) => `${year}-${String(month).padStart(2, "0")}`

  const setGeneratingReport = (report: GeneratingMonthlyReport) => {
    const key = getReportKey(report.year, report.month)
    generatingReports.value.set(key, report)
  }

  const getGeneratingReport = (year: number, month: number) => {
    const key = getReportKey(year, month)
    return generatingReports.value.get(key)
  }

  const removeGeneratingReport = (year: number, month: number) => {
    const key = getReportKey(year, month)
    generatingReports.value.delete(key)
  }

  const isReportGenerating = (year: number, month: number) => {
    const key = getReportKey(year, month)
    return generatingReports.value.has(key)
  }

  const parseMonthYearFromMessage = (message: string): { year: number; month: number } | null => {
    // Parse message like "Your monthly report for August, 2025 is ready."
    const match = message.match(
      /(January|February|March|April|May|June|July|August|September|October|November|December),?\s+(\d{4})/i,
    )
    if (!match) return null

    const monthName = match[1]
    const year = parseInt(match[2], 10)
    const monthMap: Record<string, number> = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
    }
    const month = monthMap[monthName.toLowerCase()]
    return month ? { year, month } : null
  }

  // EOD Report methods
  const setGeneratingEODReport = (report: GeneratingEODReport) => {
    generatingEODReports.value.set(report.date, report)
  }

  const getGeneratingEODReport = (date: string) => {
    return generatingEODReports.value.get(date)
  }

  const removeGeneratingEODReport = (date: string) => {
    generatingEODReports.value.delete(date)
  }

  const isEODReportGenerating = (date: string) => {
    return generatingEODReports.value.has(date)
  }

  const parseDateFromMessage = (message: string): string | null => {
    // Parse message like "Your end of day report for March 10, 2026 is ready."
    const match = message.match(
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
    )
    if (!match) return null

    const monthName = match[1]
    const day = parseInt(match[2], 10)
    const year = parseInt(match[3], 10)
    const monthMap: Record<string, number> = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
    }
    const month = monthMap[monthName.toLowerCase()]
    if (!month) return null

    // Format as YYYY-MM-DD to avoid timezone issues
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  return {
    generatingReports,
    setGeneratingReport,
    getGeneratingReport,
    removeGeneratingReport,
    isReportGenerating,
    parseMonthYearFromMessage,
    generatingEODReports,
    setGeneratingEODReport,
    getGeneratingEODReport,
    removeGeneratingEODReport,
    isEODReportGenerating,
    parseDateFromMessage,
  }
})
