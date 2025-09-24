import baseApi from "@/composables/baseApi"
import { useMutation, useQuery } from "@tanstack/vue-query"
import { IProductCategoryFormPayload } from "./types"

/** Get categories api request */
export function useGetCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await baseApi.get("/categories/")
      return data
    },
  })
}

/** Create category api request */
export function useCreateCategory() {
  return useMutation({
    mutationFn: (body: IProductCategoryFormPayload) => baseApi.post("/categories/", body),
  })
}
