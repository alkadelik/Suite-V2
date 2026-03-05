import baseApi from "@/composables/baseApi"
import { useMutation } from "@tanstack/vue-query"

/** Generate End of Day (EOD) report */
export function useGenerateEODReport() {
  return useMutation({
    mutationFn: (payload: { date: string }) => baseApi.post(`/reports/eod/generate/`, payload),
  })
}

/** Generate Monthly report */
export function useGenerateMonthlyReport() {
  return useMutation({
    mutationFn: (payload: { year: number; month: number }) =>
      baseApi.post(`/reports/monthly/generate/`, payload),
  })
}
