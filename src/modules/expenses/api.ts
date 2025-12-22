import { useMutation } from "@tanstack/vue-query"
import {
  ExpenseCategory,
  ExpenseDashboardStats,
  ExpensePayload,
  ExpenseSubCategory,
  TExpense,
  TExpenseResponse,
} from "./types"
import baseApi, { TApiPromise, useApiQuery } from "@/composables/baseApi"
import { MaybeRefOrGetter } from "vue"

/** Create expense api request */
export function useCreateExpense() {
  return useMutation({
    mutationFn: (body: FormData) => baseApi.post("/expenses/", body),
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

/** Fetch expense statistics */
export function useGetExpenseCategories() {
  return useApiQuery<ExpenseCategory[]>({
    url: `/expenses/categories/`,
    key: `expenses-categories`,
    selectData: true,
  })
}

/** Fetch expense statistics */
export function useGetExpenseSubCategories() {
  return useApiQuery<ExpenseSubCategory[]>({
    url: `/expenses/sub-categories/`,
    key: `expenses-sub-categories`,
    selectData: true,
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
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ExpensePayload> }) =>
      baseApi.patch(`/expenses/${id}/`, payload),
  })
}

/** Delete expense api request */
export function useDeleteExpense() {
  return useMutation({
    mutationFn: (id: string) => baseApi.delete(`/expenses/${id}/`),
  })
}
