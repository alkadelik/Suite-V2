import { defineStore } from "pinia"
import { ref } from "vue"

type GeneratingReport = {
  uid: string
  year: number
  month: number
  status: "generating"
  generatedAt: string | null
}

export const useReportsStore = defineStore("reports", () => {
  // Track which months are currently generating reports
  const generatingReports = ref<Map<string, GeneratingReport>>(new Map())

  const getReportKey = (year: number, month: number) => `${year}-${String(month).padStart(2, "0")}`

  const setGeneratingReport = (report: GeneratingReport) => {
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

  return {
    generatingReports,
    setGeneratingReport,
    getGeneratingReport,
    removeGeneratingReport,
    isReportGenerating,
    parseMonthYearFromMessage,
  }
})
