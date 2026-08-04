<template>
  <div class="space-y-4 rounded-xl border-gray-200 bg-white pt-3 md:border">
    <!-- header strip -->
    <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center md:px-4">
      <h3 class="flex items-center gap-1 text-lg font-semibold">
        All Discounts <Chip :label="String(count)" />
      </h3>
      <div class="flex items-center gap-2">
        <TextField
          :model-value="search"
          left-icon="search-lg"
          size="sm"
          class="flex-1"
          placeholder="Search by item name"
          @update:model-value="(v: string) => (search = v)"
        />
        <AppButton
          icon="filter-lines"
          size="sm"
          label="Filter"
          :color="filterCount ? 'primary' : 'alt'"
          :variant="filterCount ? 'outlined' : 'filled'"
          :badge="filterCount || undefined"
          class="!hidden md:!inline-flex"
          @click="showFilter = true"
        />
        <AppButton
          icon="filter-lines"
          size="sm"
          label=""
          :color="filterCount ? 'primary' : 'alt'"
          :variant="filterCount ? 'outlined' : 'filled'"
          :badge="filterCount || undefined"
          class="md:hidden"
          @click="showFilter = true"
        />
        <AppButton
          icon="add"
          size="sm"
          label="Add Discount"
          class="!hidden md:!inline-flex"
          data-walkthrough="discount-add"
          @click="emit('add')"
        />
        <AppButton
          icon="add"
          size="sm"
          label=""
          class="md:hidden"
          data-walkthrough="discount-add"
          aria-label="Add Discount"
          @click="emit('add')"
        />
      </div>
    </div>

    <DataTable
      :data="rows"
      :columns="DISCOUNT_COLUMNS"
      :loading="isFetching"
      :show-pagination="count > itemsPerPage"
      :items-per-page="itemsPerPage"
      :total-items-count="count"
      :total-page-count="Math.ceil(count / itemsPerPage) || 1"
      :server-pagination="true"
      :row-attrs="rowAttributes"
      @pagination-change="(d) => (page = d.currentPage)"
      @row-click="handleRowClick"
    >
      <template #cell:type="{ item }">
        <span class="text-sm">{{ typeLabel(item) }}</span>
      </template>

      <template #cell:value="{ item }">
        {{ valueLabel(item) }}
      </template>

      <template #cell:scope="{ item }">
        <Chip
          :label="DISCOUNT_SCOPE_META[item.scope].label"
          :color="DISCOUNT_SCOPE_META[item.scope].color"
          size="sm"
        />
      </template>

      <template #cell:status="{ item }">
        <Chip
          :label="statusMeta(item.status).label"
          :color="statusMeta(item.status).color"
          size="sm"
          showDot
        />
      </template>

      <template #cell:end_at="{ value }">
        {{ value ? formatCouponDate(value as string) : "--" }}
      </template>

      <template #cell:action="{ item }">
        <DropdownMenu
          :items="getActionItems(item)"
          placement="bottom-end"
          :show-chevron="false"
          size="sm"
          trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0"
          @click.stop
        >
          <template #trigger>
            <Icon name="dots-vertical" />
          </template>
        </DropdownMenu>
      </template>

      <template #mobile="{ item }">
        <DiscountCard
          :discount="item"
          :action-items="getActionItems(item)"
          @click="handleRowClick(item)"
        />
      </template>
    </DataTable>

    <DeleteConfirmationModal
      v-model="showDelete"
      :loading="isDeleting"
      header="Delete Discount"
      paragraph="Are you sure you want to delete this discount? This action cannot be undone."
      action-label="Delete Discount"
      @delete="confirmDelete"
    />

    <DiscountFilterDrawer v-model="showFilter" @apply="onApplyFilters" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import DataTable from "@components/DataTable.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import DiscountCard from "./discount/DiscountCard.vue"
import DiscountFilterDrawer from "./DiscountFilterDrawer.vue"
import { DISCOUNT_COLUMNS, DISCOUNT_STATUS_META, DISCOUNT_SCOPE_META } from "../constants"
import {
  deriveDiscountScope,
  discountValueLabel,
  formatCouponDate,
  normalizeDiscountList,
} from "../utils"
import { useGetDiscounts, useDeleteDiscount, useSetDiscountEnabled } from "../api"
import type { TDiscount, TDiscountRow } from "../types"
import { toast } from "@/composables/useToast"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { useWalkthroughStore } from "@modules/announcements/store"
import { buildDiscountTourRow, DISCOUNT_TOUR_UID } from "./discountTourDemo"

const emit = defineEmits<{
  add: []
  edit: [TDiscount]
  duplicate: [TDiscount]
  empty: [boolean]
}>()

const router = useRouter()
const walkthrough = useWalkthroughStore()
const { format } = useFormatCurrency()

// search + filters + pagination state
const search = ref("")
const debouncedSearch = useDebouncedRef(search, 750)
const page = ref(1)
const itemsPerPage = ref(10)

const showFilter = ref(false)
const activeFilters = ref<{ status: string | null; scope: string | null; type: string | null }>({
  status: null,
  scope: null,
  type: null,
})
const filterCount = computed(
  () => Object.values(activeFilters.value).filter((v) => v !== null).length,
)

watch(debouncedSearch, () => {
  page.value = 1
})

// Server-side filtering: status / target_type / discount_type are real query params.
const params = computed<Record<string, string | number>>(() => {
  const p: Record<string, string | number> = {
    offset: (page.value - 1) * itemsPerPage.value,
    limit: itemsPerPage.value,
  }
  if (debouncedSearch.value) p.search = debouncedSearch.value
  const f = activeFilters.value
  if (f.status) p.status = f.status
  if (f.scope) p.target_type = f.scope
  if (f.type) p.discount_type = f.type === "fixed" ? "fixed_amount" : "percentage"
  return p
})

const { data, isFetching, refetch } = useGetDiscounts(params)

const normalized = computed(() => normalizeDiscountList(data.value))
const baseRows = computed<TDiscountRow[]>(() =>
  normalized.value.results.map((d) => ({
    ...d,
    scope: deriveDiscountScope(d),
    status: d.status,
  })),
)

// --- Discounts walkthrough (non-persisting preview) ---
// The tour runs on a demo discount, so nothing is ever created on the merchant's
// store. Prepending the demo row keeps the "open a discount" step anchored even
// when the merchant has no discounts of their own yet.
const isDiscountTour = computed(() => walkthrough.activeId === "discounts")
const rows = computed<TDiscountRow[]>(() =>
  isDiscountTour.value ? [buildDiscountTourRow(), ...baseRows.value] : baseRows.value,
)
const count = computed(() => normalized.value.count)

const onApplyFilters = (f: Record<string, string | null>) => {
  activeFilters.value = {
    status: f.status ?? null,
    scope: f.scope ?? null,
    type: f.type ?? null,
  }
  page.value = 1
}

const valueLabel = (d: TDiscount) => discountValueLabel(d, format)
const typeLabel = (d: TDiscount) =>
  d.discount_type === "fixed_amount" ? "Fixed Amount" : "Percentage Off"
const statusMeta = (s: string) =>
  DISCOUNT_STATUS_META[s] ?? { label: s || "—", color: "alt" as const }

const isEmpty = computed(
  () =>
    !isFetching.value &&
    rows.value.length === 0 &&
    !debouncedSearch.value &&
    filterCount.value === 0,
)
watch(isEmpty, (v) => emit("empty", v), { immediate: true })

const handleRowClick = (d: TDiscountRow) => {
  // Any row click during the tour lands on the demo discount, never a real one.
  const uid = isDiscountTour.value ? DISCOUNT_TOUR_UID : d.uid
  walkthrough.report("discount-row-opened")
  router.push(`/discounts/discount/${uid}`)
}

// Tour "Next" on the list step opens the demo discount from earlier in the tour.
watch(
  () => walkthrough.commandNonce,
  () => {
    if (walkthrough.command !== "discount-open-row") return
    walkthrough.clearCommand()
    const uid = walkthrough.activeProgress?.context?.createdDiscountUid ?? DISCOUNT_TOUR_UID
    walkthrough.report("discount-row-opened")
    router.push(`/discounts/discount/${uid}`)
  },
)

// During the tour only the demo row carries the anchor, so the coachmark can't
// latch onto one of the merchant's real discounts.
const rowAttributes = (discount: TDiscountRow) =>
  isDiscountTour.value && discount.uid !== DISCOUNT_TOUR_UID
    ? { "data-walkthrough-discount-row": discount.uid, tabindex: 0 }
    : {
        "data-walkthrough": "discount-row",
        "data-walkthrough-discount-row": discount.uid,
        tabindex: 0,
      }

// Toggle through the documented endpoint; DiscountUpdate requires the current name.
const { mutateAsync: setDiscountEnabled } = useSetDiscountEnabled()
const toggleInFlight = ref(false)
const handleToggle = (d: TDiscountRow) => {
  if (toggleInFlight.value) return
  void (async () => {
    toggleInFlight.value = true
    const next = !d.is_enabled
    try {
      await setDiscountEnabled({ uid: d.uid, name: d.name, is_enabled: next })
      toast.success(next ? "Discount enabled" : "Discount disabled")
      await refetch()
    } catch {
      toast.error("Could not update discount status")
    } finally {
      toggleInFlight.value = false
    }
  })()
}

// delete
const { mutate: deleteDiscount, isPending: isDeleting } = useDeleteDiscount()
const showDelete = ref(false)
const deleteTarget = ref<TDiscountRow | null>(null)
const askDelete = (d: TDiscountRow) => {
  deleteTarget.value = d
  showDelete.value = true
}
const confirmDelete = () => {
  if (!deleteTarget.value) return
  deleteDiscount(deleteTarget.value.uid, {
    onSuccess: () => {
      toast.success("Discount deleted")
      showDelete.value = false
      deleteTarget.value = null
      refetch()
    },
    onError: () => toast.error("Could not delete discount"),
  })
}

// row action menu
const getActionItems = (d: TDiscountRow) => [
  {
    id: "view",
    label: "View Discount",
    icon: "eye-outline",
    action: () => router.push(`/discounts/discount/${d.uid}`),
  },
  {
    id: "edit",
    label: "Edit Discount",
    icon: "edit",
    action: () => emit("edit", d),
  },
  {
    id: "duplicate",
    label: "Duplicate Discount",
    icon: "copy",
    action: () => emit("duplicate", d),
  },
  {
    id: "toggle",
    label: d.is_enabled ? "Disable Discount" : "Enable Discount",
    icon: d.is_enabled ? "disable" : "check-circle",
    action: () => handleToggle(d),
  },
  { divider: true },
  {
    id: "delete",
    label: "Delete Discount",
    icon: "trash",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
    action: () => askDelete(d),
  },
]

defineExpose({ refetch })
</script>
