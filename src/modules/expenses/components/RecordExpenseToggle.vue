<script setup lang="ts">
import Switch from "@components/form/Switch.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"

withDefaults(
  defineProps<{
    /** Expense amount shown in parentheses after the intro text; omit to hide it */
    amount?: number
    title?: string
    description?: string
  }>(),
  {
    title: "Record this purchase as an expense",
    description: "in your expense records for reporting and profit tracking.",
  },
)

/** Whether the expense should be recorded (bound to the switch) */
const enabled = defineModel<boolean>({ required: true })

const { format } = useFormatCurrency()
</script>

<template>
  <div class="border-primary-300 bg-primary-25 space-y-3 rounded-xl border p-4">
    <div class="flex items-start gap-2">
      <div class="flex-1 text-sm">
        <p class="text-primary-700 font-semibold">{{ title }}</p>
        <p class="text-core-600 mt-0.5 text-xs">
          Include this purchase
          <span v-if="amount !== undefined" class="text-primary-700 font-semibold">
            ({{ format(amount, { kobo: true }) }})
          </span>
          {{ description }}
        </p>
      </div>
      <Switch v-model="enabled" size="sm" />
    </div>
  </div>
</template>
