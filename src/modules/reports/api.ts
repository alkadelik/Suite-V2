import baseApi, { useApiQuery } from "@/composables/baseApi"
import { useMutation } from "@tanstack/vue-query"

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
    mutationFn: (payload: { year: number; month: number }) =>
      baseApi.post(`/reports/monthly/generate/`, payload),
  })
}

/** Get latest Monthly report */
export function useGetLatestMonthlyReport() {
  return useApiQuery({
    key: "latestMonthlyReport",
    url: `/reports/monthly/latest/`,
  })
}
