import { useMutation } from "@tanstack/vue-query"
import {
  ExpenseDashboardStats,
  ExpensePayload,
  TExpense,
  TExpenseCategoryResponse,
  TExpenseResponse,
} from "./types"
import baseApi, { TApiPromise, TPaginatedResponse, useApiQuery } from "@/composables/baseApi"
import { MaybeRefOrGetter } from "vue"

/** Create expense api request */
export function useCreateExpense() {
  return useMutation({
    mutationFn: (body: FormData) =>
      baseApi.post("/expenses/", body, { headers: { "Content-Type": "multipart/form-data" } }),
  })
}

/** Fetch expenses */
export function useGetExpenses(
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>,
) {
  return useApiQuery<TExpenseResponse>({
    url: "/expenses/",
    params,
    key: "expenses",
    selectData: true,
  })
}

/** Fetch expense statistics */
export function useGetExpenseDashboard() {
  return useApiQuery<ExpenseDashboardStats>({
    url: `/expenses/stats/`,
    key: `expenses-stats`,
    selectData: true,
  })
}

/** Fetch expense categories */
export function useGetExpenseCategories(enabled?: MaybeRefOrGetter<boolean>) {
  return useApiQuery<TExpenseCategoryResponse>({
    url: `/expenses/categories/`,
    key: `expenses-categories`,
    selectData: true,
    refetchOnWindowFocus: false,
    enabled,
  })
}

/** Fetch expense vendor */
export function useGetExpenseVendors() {
  return useApiQuery<TPaginatedResponse<{ uid: string; name: string }>>({
    url: `/expenses/vendors/`,
    key: `expenses-vendors`,
  })
}

/** Create expense vendor api request */
export function useCreateExpenseVendor() {
  return useMutation({
    mutationFn: (payload: { name: string }) => baseApi.post(`/expenses/vendors/`, payload),
  })
}

/** Fetch single expense by ID */
export function useGetExpensesById(id: string) {
  return useApiQuery<TApiPromise<TExpense>>({
    url: `/expenses/${id}/`,
    key: `expenses/${id}`,
    selectData: true,
  })
}

/** Edit expense api request */
export function useEditExpense() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData | Partial<ExpensePayload> }) =>
      baseApi.patch(`/expenses/${id}/`, payload, {
        headers:
          payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
      }),
  })
}

/** Delete expense api request */
export function useDeleteExpense() {
  return useMutation({
    mutationFn: (id: string) => baseApi.delete(`/expenses/${id}/`),
  })
}
