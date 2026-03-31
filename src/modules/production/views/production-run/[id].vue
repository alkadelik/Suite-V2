<script setup lang="ts">
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useMediaQuery } from "@vueuse/core"
import Icon from "@components/Icon.vue"
import { ref } from "vue"
import { useGetProductionRunDetail } from "@modules/production/api"
import type {
  ProdRunIngredientUsed,
  ProdRunProcessCostUsed,
  ProdRunAdditionalExpenseUsed,
} from "@modules/production/types"

const route = useRoute()
const router = useRouter()
const isMobile = useMediaQuery("(max-width: 1024px)")

const uid = computed(() => String(route.params.uid ?? route.params.id ?? ""))

const { data: run, isLoading } = useGetProductionRunDetail(uid)

const emit = defineEmits<{
  (e: "duplicate"): void
  (e: "edit"): void
}>()

// ── Menu ───────────────────────────────────────────────────────────────────────

const menuOpen = ref(false)

// ── Expandable ingredient rows ─────────────────────────────────────────────────

const expandedIngredients = ref<Set<string>>(new Set())

const toggleIngredient = (uid: string) => {
  if (expandedIngredients.value.has(uid)) {
    expandedIngredients.value.delete(uid)
  } else {
    expandedIngredients.value.add(uid)
  }
}

// ── Cost breakdown toggle (mobile) ─────────────────────────────────────────────

const breakdownExpanded = ref(false)

// ── Formatting ─────────────────────────────────────────────────────────────────

const formatNaira = (v: string | number | null | undefined) => {
  const n = Number(v ?? 0)
  if (!Number.isFinite(n)) return "—"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)
}

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// ── Computed totals ────────────────────────────────────────────────────────────

const materialsCost = computed(() => Number(run.value?.material_cost_total ?? 0))
const processCostTotal = computed(() => Number(run.value?.process_cost_total ?? 0))
const additionalExpensesTotal = computed(() => Number(run.value?.extra_cost_total ?? 0))
const totalCost = computed(() => Number(run.value?.total_cost ?? 0))
const usableUnits = computed(() => Number(run.value?.usable_quantity ?? 0))
const costPerUnit = computed(() => Number(run.value?.cost_per_unit ?? 0))
const qtyProduced = computed(() => Number(run.value?.quantity_to_produce ?? 0))
const qtyDamaged = computed(() => Number(run.value?.damaged_quantity ?? 0))

const damageCostImpact = computed(() => {
  if (!qtyDamaged.value || !usableUnits.value || !qtyProduced.value) return 0
  return totalCost.value / usableUnits.value - totalCost.value / qtyProduced.value
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="mx-auto max-w-6xl space-y-4 px-6 py-8">
      <div v-for="n in 5" :key="n" class="h-16 w-full animate-pulse rounded-2xl bg-gray-200" />
    </div>

    <template v-else-if="run">
      <!-- ── Desktop layout ── -->
      <div v-if="!isMobile" class="mx-auto max-w-6xl px-6 py-8">
        <!-- Back + Duplicate Run -->
        <div class="mb-6 flex items-center justify-between">
          <button
            type="button"
            class="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            @click="router.back()"
          >
            <Icon name="arrow-left" size="16" />
            Back
          </button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-xl border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
            @click="emit('duplicate')"
          >
            Duplicate Run
          </button>
        </div>

        <!-- Header -->
        <div class="mb-6 rounded-2xl border border-gray-200 bg-white px-6 py-5">
          <div class="mb-3 flex items-center justify-between">
            <h1 class="text-xl font-bold text-gray-900">{{ run.uid.slice(0, 8).toUpperCase() }}</h1>
            <div class="relative">
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                @click="menuOpen = !menuOpen"
              >
                <Icon name="more" size="18" />
              </button>
              <div
                v-if="menuOpen"
                class="absolute top-full right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                <button
                  type="button"
                  class="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  @click="
                    emit('duplicate')
                    menuOpen = false
                  "
                >
                  <Icon name="copy" size="16" class="text-gray-400" />
                  Duplicate recipe
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700"
            >
              {{ run.output_item_name }}
            </span>
            <span
              class="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
            >
              {{
                run.status === "completed"
                  ? "Completed"
                  : run.status === "in_progress"
                    ? "In Progress"
                    : "Draft"
              }}
            </span>
            <span
              v-if="qtyDamaged > 0"
              class="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
            >
              <Icon name="warning-2" size="12" />
              {{ qtyDamaged }} unit{{ qtyDamaged !== 1 ? "s" : "" }} damaged
            </span>
          </div>

          <p class="mt-3 text-sm text-gray-500">
            Date completed:
            <span class="font-medium text-gray-700">{{
              formatDate(run.finalized_at ?? run.created_at)
            }}</span>
          </p>
        </div>

        <!-- Two-column body -->
        <div class="flex gap-6">
          <!-- Left column -->
          <div class="flex-1 space-y-5">
            <!-- Ingredients table -->
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100">
                    <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">Name</th>
                    <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-500">
                      Quantity Used
                    </th>
                    <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-500">
                      Average Cost
                    </th>
                    <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-500">
                      Total Cost
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="ing in run.ingredients_used as ProdRunIngredientUsed[]"
                    :key="ing.uid"
                    class="cursor-pointer hover:bg-gray-50"
                    @click="toggleIngredient(ing.uid)"
                  >
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-2">
                        <Icon
                          name="chevron-down"
                          size="14"
                          class="shrink-0 text-gray-400 transition-transform"
                          :class="expandedIngredients.has(ing.uid) ? 'rotate-180' : ''"
                        />
                        <span class="text-sm font-medium text-gray-800">{{
                          ing.material_name
                        }}</span>
                        <span
                          v-if="ing.is_adjusted"
                          class="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700"
                          >Adjusted</span
                        >
                      </div>
                    </td>
                    <td class="px-5 py-3.5 text-right text-sm text-gray-700">
                      {{ ing.quantity_required }} {{ ing.unit }}
                    </td>
                    <td class="px-5 py-3.5 text-right text-sm text-gray-700">
                      {{ formatNaira(ing.actual_unit_cost) }} / {{ ing.unit }}
                    </td>
                    <td class="px-5 py-3.5 text-right text-sm font-semibold text-gray-900">
                      {{ formatNaira(ing.actual_total_cost) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Process Cost/Expenses -->
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div class="flex items-center gap-2">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                    <Icon name="setting" size="16" class="text-gray-600" />
                  </div>
                  <span class="text-sm font-semibold text-gray-800">Process Cost/Expenses</span>
                </div>
              </div>
              <div class="divide-y divide-gray-100">
                <div
                  v-for="p in run.process_costs_used as ProdRunProcessCostUsed[]"
                  :key="p.uid"
                  class="flex items-center justify-between px-5 py-3.5"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-700">{{ p.name }}</span>
                    <span
                      v-if="p.is_adjusted"
                      class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600"
                      >Adjusted</span
                    >
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-900">{{
                      formatNaira(p.cost_per_batch)
                    }}</span>
                    <span class="text-lg">🪙</span>
                  </div>
                </div>
              </div>

              <!-- Additional Expenses sub-section -->
              <div v-if="run.additional_expenses?.length" class="border-t border-gray-100">
                <p class="px-5 py-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  Additional Expenses
                </p>
                <div class="divide-y divide-gray-100">
                  <div
                    v-for="e in run.additional_expenses as ProdRunAdditionalExpenseUsed[]"
                    :key="e.uid"
                    class="flex items-center justify-between px-5 py-3.5"
                  >
                    <span class="text-sm text-gray-700">{{ e.name }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-gray-900">{{
                        formatNaira(e.amount)
                      }}</span>
                      <span class="text-lg">🪙</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Damage & Losses -->
            <div
              v-if="qtyDamaged > 0"
              class="overflow-hidden rounded-2xl border border-orange-200 bg-white"
            >
              <div
                class="flex items-center justify-between border-b border-orange-100 bg-orange-50 px-5 py-4"
              >
                <div class="flex items-center gap-2">
                  <Icon name="warning-2" size="18" class="text-orange-500" />
                  <span class="text-sm font-semibold text-orange-800">Damage &amp; Losses</span>
                </div>
                <span
                  class="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                >
                  <Icon name="warning-2" size="11" />
                  {{ qtyDamaged }} units
                </span>
              </div>
              <div class="px-5 py-4">
                <div class="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p class="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                    Cost Impact
                  </p>
                  <p class="text-sm text-gray-600">
                    The cost of {{ qtyDamaged }} damaged unit{{ qtyDamaged !== 1 ? "s" : "" }} has
                    been distributed across {{ usableUnits }} usable unit{{
                      usableUnits !== 1 ? "s" : ""
                    }}, increasing cost per unit by
                    <span class="font-bold text-gray-900">{{ formatNaira(damageCostImpact) }}</span
                    >.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right sidebar -->
          <div class="w-72 shrink-0">
            <div class="sticky top-6 space-y-4">
              <div
                class="overflow-hidden rounded-2xl border border-amber-200"
                style="
                  background: repeating-linear-gradient(
                    135deg,
                    #fffbeb 0px,
                    #fffbeb 10px,
                    #fef3c7 10px,
                    #fef3c7 11px
                  );
                "
              >
                <div class="m-2 rounded-xl bg-white/90 px-4 py-4">
                  <p class="mb-4 text-sm font-bold text-gray-900">Cost Breakdown</p>
                  <div class="space-y-2.5">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-500">Materials</span>
                      <span class="font-semibold text-gray-900">{{
                        formatNaira(materialsCost)
                      }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-500">Process Costs</span>
                      <span class="font-semibold text-gray-900">{{
                        formatNaira(processCostTotal)
                      }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-500">Additional Expenses</span>
                      <span class="font-semibold text-gray-900">{{
                        additionalExpensesTotal > 0 ? formatNaira(additionalExpensesTotal) : "—"
                      }}</span>
                    </div>
                    <div class="border-t border-gray-200 pt-2.5">
                      <div
                        class="flex items-center justify-between text-sm font-bold text-gray-900"
                      >
                        <span>Total Cost</span>
                        <span>{{ formatNaira(totalCost) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="mt-4 border-t border-gray-200 pt-4">
                    <p class="mb-3 text-sm font-bold text-gray-900">Economics Breakdown</p>
                    <div class="space-y-2">
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-500">Produced Units</span>
                        <span class="font-semibold text-gray-900">{{ qtyProduced }}</span>
                      </div>
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-500">Usable Units</span>
                        <span class="font-semibold text-gray-900">{{ usableUnits }}</span>
                      </div>
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-500">Cost per Unit</span>
                        <span class="font-semibold text-gray-900">{{
                          formatNaira(costPerUnit)
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Mobile layout ── -->
      <div v-else class="pb-10">
        <div class="sticky top-0 z-10 border-b border-gray-100 bg-white px-5 pt-3 pb-4">
          <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />
          <div class="flex items-center justify-between">
            <h1 class="text-lg font-bold text-gray-900">{{ run.uid.slice(0, 8).toUpperCase() }}</h1>
            <div class="relative">
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                @click="menuOpen = !menuOpen"
              >
                <Icon name="more" size="18" />
              </button>
              <div
                v-if="menuOpen"
                class="absolute top-full right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                <button
                  type="button"
                  class="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  @click="
                    emit('duplicate')
                    menuOpen = false
                  "
                >
                  <Icon name="copy" size="16" class="text-gray-400" />
                  Duplicate recipe
                </button>
              </div>
            </div>
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700"
              >{{ run.output_item_name }}</span
            >
            <span
              class="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
            >
              {{
                run.status === "completed"
                  ? "Completed"
                  : run.status === "in_progress"
                    ? "In Progress"
                    : "Draft"
              }}
            </span>
            <span
              v-if="qtyDamaged > 0"
              class="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
            >
              <Icon name="warning-2" size="12" />
              {{ qtyDamaged }} unit{{ qtyDamaged !== 1 ? "s" : "" }} damaged
            </span>
          </div>
          <p class="mt-2 text-xs text-gray-500">
            Date completed:
            <span class="font-medium text-gray-700">{{
              formatDate(run.finalized_at ?? run.created_at)
            }}</span>
          </p>
        </div>

        <div class="space-y-4 px-4 pt-4">
          <!-- Ingredients accordion -->
          <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div class="border-b border-gray-100 px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                  <Icon name="bag" size="16" class="text-orange-500" />
                </div>
                <span class="text-sm font-semibold text-gray-800">Ingredients</span>
              </div>
            </div>
            <div class="divide-y divide-gray-100">
              <div v-for="ing in run.ingredients_used as ProdRunIngredientUsed[]" :key="ing.uid">
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-4 py-3.5 text-left"
                  @click="toggleIngredient(ing.uid)"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-800">{{ ing.material_name }}</span>
                    <span
                      v-if="ing.is_adjusted"
                      class="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700"
                      >Adjusted</span
                    >
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-900">{{
                      formatNaira(ing.actual_total_cost)
                    }}</span>
                    <Icon
                      name="chevron-down"
                      size="14"
                      class="text-gray-400 transition-transform"
                      :class="expandedIngredients.has(ing.uid) ? 'rotate-180' : ''"
                    />
                  </div>
                </button>
                <div
                  v-if="expandedIngredients.has(ing.uid)"
                  class="border-t border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p class="text-xs text-gray-400">Quantity Used</p>
                      <p class="font-medium text-gray-700">
                        {{ ing.quantity_required }} {{ ing.unit }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-400">Average Cost</p>
                      <p class="font-medium text-gray-700">
                        {{ formatNaira(ing.actual_unit_cost) }} / {{ ing.unit }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Process costs -->
          <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                <Icon name="setting" size="16" class="text-gray-600" />
              </div>
              <span class="text-sm font-semibold text-gray-800">Process Cost/Expenses</span>
            </div>
            <div class="divide-y divide-gray-100">
              <div
                v-for="p in run.process_costs_used as ProdRunProcessCostUsed[]"
                :key="p.uid"
                class="flex items-center justify-between px-4 py-3.5"
              >
                <span class="text-sm text-gray-700">{{ p.name }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-gray-900">{{
                    formatNaira(p.cost_per_batch)
                  }}</span>
                  <span class="text-base">🪙</span>
                </div>
              </div>
            </div>
            <div v-if="run.additional_expenses?.length" class="border-t border-gray-100">
              <p class="px-4 py-2.5 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Additional Expenses
              </p>
              <div class="divide-y divide-gray-100">
                <div
                  v-for="e in run.additional_expenses as ProdRunAdditionalExpenseUsed[]"
                  :key="e.uid"
                  class="flex items-center justify-between px-4 py-3.5"
                >
                  <span class="text-sm text-gray-700">{{ e.name }}</span>
                  <span class="text-sm font-semibold text-gray-900">{{
                    formatNaira(e.amount)
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Damage & Losses -->
          <div
            v-if="qtyDamaged > 0"
            class="overflow-hidden rounded-2xl border border-orange-200 bg-white"
          >
            <div
              class="flex items-center justify-between border-b border-orange-100 bg-orange-50 px-4 py-3"
            >
              <div class="flex items-center gap-2">
                <Icon name="warning-2" size="16" class="text-orange-500" />
                <span class="text-sm font-semibold text-orange-800">Damage &amp; Losses</span>
              </div>
              <span
                class="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600"
              >
                <Icon name="warning-2" size="11" />
                {{ qtyDamaged }} units
              </span>
            </div>
            <div class="px-4 py-4">
              <div class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p class="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  Cost Impact
                </p>
                <p class="text-sm text-gray-600">
                  The cost of {{ qtyDamaged }} damaged unit{{ qtyDamaged !== 1 ? "s" : "" }} has
                  been distributed across {{ usableUnits }} usable unit{{
                    usableUnits !== 1 ? "s" : ""
                  }}, increasing cost per unit by
                  <span class="font-bold text-gray-900">{{ formatNaira(damageCostImpact) }}</span
                  >.
                </p>
              </div>
            </div>
          </div>

          <!-- Cost Breakdown (mobile collapsible) -->
          <div
            class="overflow-hidden rounded-2xl border border-amber-200"
            style="
              background: repeating-linear-gradient(
                135deg,
                #fffbeb 0px,
                #fffbeb 10px,
                #fef3c7 10px,
                #fef3c7 11px
              );
            "
          >
            <div class="m-2 rounded-xl bg-white/90 px-4 py-4">
              <p class="mb-4 text-sm font-bold text-gray-900">Cost Breakdown</p>
              <div class="space-y-2.5">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Materials</span>
                  <span class="font-semibold text-gray-900">{{ formatNaira(materialsCost) }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Process Costs</span>
                  <span class="font-semibold text-gray-900">{{
                    formatNaira(processCostTotal)
                  }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Additional Expenses</span>
                  <span class="font-semibold text-gray-900">{{
                    additionalExpensesTotal > 0 ? formatNaira(additionalExpensesTotal) : "—"
                  }}</span>
                </div>
                <div class="border-t border-dashed border-gray-200 pt-2.5">
                  <div class="flex items-center justify-between text-sm font-bold text-gray-900">
                    <span>Total Cost</span>
                    <span>{{ formatNaira(totalCost) }}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="mt-4 flex w-full items-center justify-center gap-1.5 border-t border-gray-100 pt-4 text-sm font-semibold text-gray-600 hover:text-gray-800"
                @click="breakdownExpanded = !breakdownExpanded"
              >
                View full breakdown
                <Icon
                  name="chevron-down"
                  size="14"
                  class="transition-transform"
                  :class="breakdownExpanded ? 'rotate-180' : ''"
                />
              </button>
              <div v-if="breakdownExpanded" class="mt-4 border-t border-gray-100 pt-4">
                <p class="mb-3 text-sm font-bold text-gray-900">Economics Breakdown</p>
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">Produced Units</span>
                    <span class="font-semibold text-gray-900">{{ qtyProduced }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">Usable Units</span>
                    <span class="font-semibold text-gray-900">{{ usableUnits }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">Cost per Unit</span>
                    <span class="font-semibold text-gray-900">{{ formatNaira(costPerUnit) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Not found -->
    <div v-else class="flex items-center justify-center py-24 text-sm text-gray-400">
      Production run not found.
    </div>
  </div>
</template>
