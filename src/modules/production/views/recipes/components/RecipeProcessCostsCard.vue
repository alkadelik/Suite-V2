<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"
import { formatCurrency } from "@/utils/format-currency"

type CostRow = {
  name?: string | null
  cost?: number | string | null
  cost_per_batch?: number | string | null
  notes?: string | null
}

const props = defineProps<{
  processCosts: CostRow[] | string | null | undefined
  note?: string | null
}>()

const emit = defineEmits<{
  (e: "view-note", note?: string | null): void
}>()

const rows = computed<CostRow[]>(() =>
  Array.isArray(props.processCosts) ? props.processCosts : [],
)

const onViewNote = () => {
  emit("view-note", props.note)
}

// supports "4035", 4035, "4,035", null
const toNumberSafe = (val: unknown): number | null => {
  if (val == null) return null
  if (typeof val === "number") return Number.isFinite(val) ? val : null
  if (typeof val === "string") {
    const cleaned = val.replace(/,/g, "").trim()
    if (!cleaned) return null
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : null
  }
  return null
}

const formatNaira = (val: unknown) => {
  const n = toNumberSafe(val)
  if (n == null) return "—"
  return formatCurrency(n) // your app adds ₦ already
}

const rowHasNote = (r: CostRow) => Boolean(String(r.notes ?? "").trim())

const rowCostValue = (r: CostRow) => {
  // accept either key
  return r.cost_per_batch ?? r.cost ?? null
}
</script>

<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-5">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="flex size-10 items-center justify-center rounded-xl bg-[#FFF7ED]">
          <Icon name="setting" :size="18" class="text-[#9A3412]" />
        </span>
        <h3 class="text-sm font-semibold text-gray-900">Process Cost/Expenses</h3>
      </div>

      <button type="button" class="text-sm font-medium text-[#B45309]" @click="onViewNote">
        View Note
      </button>
    </div>

    <div class="overflow-hidden rounded-xl border border-gray-100">
      <div
        v-for="(r, idx) in rows"
        :key="idx"
        class="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 last:border-b-0"
      >
        <p class="min-w-0 flex-1 text-sm text-gray-800">
          {{ (r.name || "").trim() || "—" }}
        </p>

        <div class="grid grid-cols-[minmax(72px,auto)_20px] items-center gap-3">
          <p class="text-right text-sm font-medium text-gray-900 tabular-nums">
            {{ formatNaira(rowCostValue(r)) }}
          </p>

          <span class="flex h-4 w-5 items-center justify-center">
            <Icon v-if="rowHasNote(r)" name="note" :size="16" class="text-[#9A3412]" />
          </span>
        </div>
      </div>

      <div v-if="!rows.length" class="px-4 py-6 text-sm text-gray-500">No process costs yet.</div>
    </div>
  </div>
</template>
