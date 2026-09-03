import baseApi, { TApiPromise, useApiQuery } from "@/composables/baseApi"
import { useMutation } from "@tanstack/vue-query"
import {
  IHighlightsResponse,
  IMonthlyReport,
  IReportGenerationStatus,
  IEODReport,
  IEODReportGenerationStatus,
} from "./types"
import { MaybeRefOrGetter, computed, toValue } from "vue"

export function useGetHighlights() {
  return useApiQuery<IHighlightsResponse>({
    url: "/reports/highlights/",
    key: "report-highlights",
    selectData: true,
  })
}

/** Generate End of Day (EOD) report */
export function useGenerateEODReport() {
  return useMutation({
    mutationFn: (payload: { date: string }): TApiPromise<{ data: IEODReportGenerationStatus }> =>
      baseApi.post(`/reports/eod/generate/`, payload),
  })
}

/**
 * Get latest End of Day (EOD) report.
 * `refetchInterval` lets the view poll while a report is generating, so the screen
 * still fills in if the websocket "ready" notification never lands.
 */
export function useGetLatestEODReport(
  date?: MaybeRefOrGetter<string>,
  options?: {
    refetchInterval?: MaybeRefOrGetter<number | false>
    enabled?: MaybeRefOrGetter<boolean>
  },
) {
  return useApiQuery<IEODReport | null>({
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled,
    key: computed(() => {
      const d = toValue(date)
      return d ? `latestEODReport-${d}` : "latestEODReport"
    }),
    url: computed(() => {
      const d = toValue(date)
      const queryParams = d ? `?date=${d}` : ""
      return `/reports/eod/latest/${queryParams}`
    }),
    selectData: true,
  })
}

/**
 * Get a specific End of Day (EOD) report by its uid.
 * Used when the route carries an `id` (e.g. a link from a notification), where the
 * report's date is not known up front.
 */
export function useGetEODReportById(uid: MaybeRefOrGetter<string | undefined>) {
  return useApiQuery<IEODReport | null>({
    key: computed(() => `eodReport-${toValue(uid) ?? ""}`),
    url: computed(() => `/reports/eod/${toValue(uid)}/`),
    enabled: computed(() => Boolean(toValue(uid))),
    selectData: true,
  })
}

/** Generate Monthly report */
export function useGenerateMonthlyReport() {
  return useMutation({
    mutationFn: (payload: {
      year: number
      month: number
    }): TApiPromise<{ data: IReportGenerationStatus }> =>
      baseApi.post(`/reports/monthly/generate/`, payload),
  })
}

/** Get latest Monthly report */
export function useGetLatestMonthlyReport(
  params?: MaybeRefOrGetter<{ year?: number; month?: number }>,
  options?: {
    refetchInterval?: MaybeRefOrGetter<number | false>
    enabled?: MaybeRefOrGetter<boolean>
  },
) {
  return useApiQuery<IMonthlyReport | null>({
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled,
    key: computed(() => {
      const p = toValue(params)
      return p?.year && p?.month
        ? `latestMonthlyReport-${p.year}-${p.month}`
        : "latestMonthlyReport"
    }),
    url: computed(() => {
      const p = toValue(params)
      const queryParams = p?.year && p?.month ? `?year=${p.year}&month=${p.month}` : ""
      return `/reports/monthly/latest/${queryParams}`
    }),
    selectData: true,
  })
}

/**
 * Get a specific Monthly report by its uid.
 * Used when the route carries an `id` (e.g. a link from a notification), where the
 * report's month is not known up front.
 */
export function useGetMonthlyReportById(uid: MaybeRefOrGetter<string | undefined>) {
  return useApiQuery<IMonthlyReport | null>({
    key: computed(() => `monthlyReport-${toValue(uid) ?? ""}`),
    url: computed(() => `/reports/monthly/${toValue(uid)}/`),
    enabled: computed(() => Boolean(toValue(uid))),
    selectData: true,
  })
}
