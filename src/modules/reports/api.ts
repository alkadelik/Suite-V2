import baseApi, { TApiPromise, useApiQuery } from "@/composables/baseApi"
import { useMutation } from "@tanstack/vue-query"
import { IMonthlyReport, IReportGenerationStatus } from "./types"
import { MaybeRefOrGetter, toValue, computed } from "vue"

/** Generate End of Day (EOD) report */
export function useGenerateEODReport() {
  return useMutation({
    mutationFn: (payload: { date: string }) => baseApi.post(`/reports/eod/generate/`, payload),
  })
}

/** Get latest End of Day (EOD) report */
export function useGetLatestEODReport() {
  return useApiQuery({
    key: "latestEODReport",
    url: `/reports/eod/latest/`,
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
) {
  return useApiQuery<IMonthlyReport | null>({
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
