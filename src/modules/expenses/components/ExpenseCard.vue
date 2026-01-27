<script setup lang="ts">
import { computed } from "vue"
import Chip from "@/components/Chip.vue"
import { formatCurrency } from "@/utils/format-currency"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import type { TExpense } from "../types"
import { formatDate } from "@/utils/formatDate"
import { EXPENSE_CATEGORY_ICON, getExpenseStatusColor } from "../constants"

const props = withDefaults(
  defineProps<{
    expense: TExpense
    showActions?: boolean
    customActions?: Array<{
      label?: string
      icon?: string
      action?: () => void
      class?: string
      iconClass?: string
      divider?: boolean
    }>
    class?: string
  }>(),
  {
    expense: () => ({}) as TExpense,
    showActions: true,
  },
)

const emit = defineEmits(["click", "toggle", "edit", "delete", "void"])

const menuItems = computed(() => {
  return props.customActions?.length
    ? props.customActions
    : [
        { label: "Edit expense", icon: "edit", action: () => emit("edit") },
        { divider: true },
        {
          label: "Void expense",
          icon: "close-circle",
          class: "text-orange-600 hover:bg-orange-50",
          iconClass: "text-orange-600",
          action: () => emit("void"),
        },
        ...(props.expense.entry_type === "manual"
          ? [
              {
                label: "Delete expense",
                icon: "trash",
                class: "text-red-600 hover:bg-red-50",
                iconClass: "text-red-600",
                action: () => emit("delete"),
              },
            ]
          : []),
      ]
})
</script>

<template>
  <div
    :class="[
      'cursor-pointer bg-transparent py-2.5',
      { 'bg-gray-100! opacity-60 grayscale': expense.status === 'void' },
      props.class,
    ]"
    @click="emit('click')"
  >
    <div>
      <div class="flex items-center gap-3">
        <span class="bg-core-200 relative flex size-12 items-center justify-center rounded-xl">
          <Icon :name="EXPENSE_CATEGORY_ICON[expense.category_name] || 'receipt-text'" :size="24" />

          <Icon
            v-if="expense.entry_type === 'auto'"
            name="flash"
            class="text-primary-600 absolute -right-1 -bottom-1"
          />
        </span>

        <div class="flex flex-1 flex-col gap-2 truncate">
          <div class="flex justify-between">
            <h4 class="truncate text-left text-sm font-semibold capitalize">
              {{ expense.name || expense.category_name }}
            </h4>

            <div class="flex items-center justify-end gap-2">
              <span class="text-error-600 text-sm font-semibold">
                {{ formatCurrency(expense.amount) }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <!-- status -->
            <Chip
              :color="getExpenseStatusColor(expense.status)"
              :label="expense.status"
              class="!w-full max-w-max capitalize"
              show-dot
            />
            <!-- type -->
            <Chip
              v-if="expense.sub_category_name"
              icon="tag"
              color="pink"
              :label="expense.sub_category_name || ''"
              class="truncate"
            />
            <!-- date -->
            <p class="ml-auto pl-4 text-xs font-medium">
              {{ formatDate(expense.date) }}
            </p>
          </div>
        </div>

        <div class="self-start">
          <DropdownMenu
            v-if="showActions && expense.status !== 'void'"
            @toggle="emit('toggle')"
            :items="menuItems"
          />
          <div class="w-4" v-if="expense.status === 'void'" />
        </div>
      </div>
    </div>
  </div>
</template>
