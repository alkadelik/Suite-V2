import { defineStore } from "pinia"
import { ref } from "vue"

/**
 * A generation flag is only trusted for this long. The websocket "ready" message can
 * be missed (tab closed, socket down), and without an expiry the checklist would
 * greet the user forever on a report that finished — or failed — hours ago.
 */
const MAX_GENERATING_AGE = 30 * 60 * 1000 // 30 minutes

type GeneratingMonthlyReport = {
  uid: string
  year: number
  month: number
  status: "generating"
  generatedAt: string | null
  /** Epoch ms the request was fired — drives the progress checklist across remounts. */
  startedAt: number
}

type GeneratingEODReport = {
  uid: string
  date: string
  status: "generating"
  generatedAt: string | null
  startedAt: number
}

const isFresh = (startedAt: number) => Date.now() - startedAt < MAX_GENERATING_AGE

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
]

const monthFromName = (name: string) => MONTH_NAMES.indexOf(name.toLowerCase()) + 1

export const useReportsStore = defineStore(
  "reports",
  () => {
    // Track which months are currently generating reports. Plain objects (not Maps)
    // so the state can be persisted and survive a page reload mid-generation.
    const generatingReports = ref<Record<string, GeneratingMonthlyReport>>({})
    // Track which dates are currently generating EOD reports
    const generatingEODReports = ref<Record<string, GeneratingEODReport>>({})

    const getReportKey = (year: number, month: number) =>
      `${year}-${String(month).padStart(2, "0")}`

    const setGeneratingReport = (
      report: Omit<GeneratingMonthlyReport, "startedAt"> & { startedAt?: number },
    ) => {
      const key = getReportKey(report.year, report.month)
      generatingReports.value[key] = { ...report, startedAt: report.startedAt ?? Date.now() }
    }

    const getGeneratingReport = (year: number, month: number) => {
      const entry = generatingReports.value[getReportKey(year, month)]
      return entry && isFresh(entry.startedAt) ? entry : undefined
    }

    const removeGeneratingReport = (year: number, month: number) => {
      delete generatingReports.value[getReportKey(year, month)]
    }

    const isReportGenerating = (year: number, month: number) =>
      Boolean(getGeneratingReport(year, month))

    const clearGeneratingReports = () => {
      generatingReports.value = {}
    }

    const parseMonthYearFromMessage = (message: string): { year: number; month: number } | null => {
      // Parse message like "Your monthly report for August, 2025 is ready."
      const match = message.match(
        /(January|February|March|April|May|June|July|August|September|October|November|December),?\s+(\d{4})/i,
      )
      if (!match) return null

      const month = monthFromName(match[1])
      return month ? { year: parseInt(match[2], 10), month } : null
    }

    // EOD Report methods
    const setGeneratingEODReport = (
      report: Omit<GeneratingEODReport, "startedAt"> & { startedAt?: number },
    ) => {
      generatingEODReports.value[report.date] = {
        ...report,
        startedAt: report.startedAt ?? Date.now(),
      }
    }

    const getGeneratingEODReport = (date: string) => {
      const entry = generatingEODReports.value[date]
      return entry && isFresh(entry.startedAt) ? entry : undefined
    }

    const removeGeneratingEODReport = (date: string) => {
      delete generatingEODReports.value[date]
    }

    const isEODReportGenerating = (date: string) => Boolean(getGeneratingEODReport(date))

    const clearGeneratingEODReports = () => {
      generatingEODReports.value = {}
    }

    const parseDateFromMessage = (message: string): string | null => {
      // Parse message like "Your end of day report for March 10, 2026 is ready."
      const match = message.match(
        /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
      )
      if (!match) return null

      const month = monthFromName(match[1])
      if (!month) return null

      const day = parseInt(match[2], 10)
      // Format as YYYY-MM-DD to avoid timezone issues
      return `${match[3]}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    }

    return {
      generatingReports,
      setGeneratingReport,
      getGeneratingReport,
      removeGeneratingReport,
      isReportGenerating,
      clearGeneratingReports,
      parseMonthYearFromMessage,
      generatingEODReports,
      setGeneratingEODReport,
      getGeneratingEODReport,
      removeGeneratingEODReport,
      isEODReportGenerating,
      clearGeneratingEODReports,
      parseDateFromMessage,
    }
  },
  { persist: true },
)
