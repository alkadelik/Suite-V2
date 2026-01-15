<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import { useMediaQuery } from "@vueuse/core"
import { TExpense } from "../types"
import Chip from "@components/Chip.vue"
import { formatDate } from "@/utils/formatDate"
import { getExpenseStatusColor } from "../constants"

defineProps<{ open: boolean; expense: TExpense }>()
const emit = defineEmits(["close", "refresh"])

const isMobile = useMediaQuery("(max-width: 1028px)")
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    title="Expense Details"
    max-width="2xl"
    variant="fullscreen"
    @close="emit('close')"
  >
    <div class="space-y-6">
      <div class="flex flex-col items-center justify-center gap-2">
        <h4 class="text-3xl font-bold md:text-4xl">
          {{ formatCurrency(Number(expense.amount)) }}
        </h4>
        <p class="text-sm font-medium md:text-base">{{ expense.name }}</p>
        <Chip
          :label="expense.status"
          class="capitalize"
          :color="getExpenseStatusColor(expense.status)"
        />
      </div>
      <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Amount</span>
          <span class="font-medium">{{ formatCurrency(Number(expense.amount)) }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Expense</span>
          <span class="font-medium">{{ expense.name || "-" }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Category</span>
          <Chip :label="expense.category_name" color="purple" />
        </p>
        <p v-if="expense.sub_category_name" class="flex justify-between text-sm">
          <span class="text-core-600">Sub-category</span>
          <Chip :label="expense.sub_category_name" color="pink" />
        </p>
      </div>

      <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Entry Mode</span>
          <span class="font-medium capitalize">{{ expense.entry_type }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Vendor</span>
          <span class="font-medium">{{ expense.vendor_name || "-" }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Date</span>
          <span class="font-medium">{{ formatDate(expense.date) }}</span>
        </p>
      </div>

      <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
        <p class="flex flex-col text-sm">
          <span class="text-core-600">Notes</span>
          <span class="font-medium">{{ expense.notes || "-" }}</span>
        </p>
      </div>
    </div>
  </component>
</template>
