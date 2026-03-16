import { useApiQuery } from "@/composables/baseApi"

export function useGetHighlights() {
  return useApiQuery<unknown>({
    url: "/reports/highlights/",
    key: "report-highlights",
    selectData: true,
  })
}
