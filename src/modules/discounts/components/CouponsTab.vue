<template>
  <div class="space-y-4 rounded-xl border-gray-200 bg-white pt-3 md:border">
    <!-- header strip -->
    <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center md:px-4">
      <h3 class="flex items-center gap-1 text-lg font-semibold">
        All Coupons <Chip :label="String(count)" />
      </h3>
      <div class="flex items-center gap-2">
        <TextField
          :model-value="search"
          @update:model-value="(v: string) => (search = v)"
          left-icon="search-lg"
          size="sm"
          class="flex-1"
          placeholder="Search by item name"
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
          label="Add Coupons"
          class="!hidden md:!inline-flex"
          @click="emit('add')"
        />
        <AppButton icon="add" size="sm" label="" class="md:hidden" @click="emit('add')" />
      </div>
    </div>

    <DataTable
      :data="filteredRows"
      :columns="COUPON_COLUMNS"
      :loading="isFetching"
      :show-pagination="count > itemsPerPage"
      :items-per-page="itemsPerPage"
      :total-items-count="count"
      :total-page-count="Math.ceil(count / itemsPerPage) || 1"
      :server-pagination="true"
      @pagination-change="(d) => (page = d.currentPage)"
      @row-click="handleRowClick"
    >
      <template #cell:code="{ value }">
        <span class="font-mono text-gray-500">{{ value }}</span>
      </template>

      <template #cell:scope="{ item }">
        <Chip
          :label="COUPON_SCOPE_META[item.scope].label"
          :color="COUPON_SCOPE_META[item.scope].color"
          size="sm"
        />
      </template>

      <template #cell:value="{ item }">
        {{ valueLabel(item) }}
      </template>

      <template #cell:usage="{ item }">
        <CouponUsageBar :used="0" :limit="item.max_usage" />
      </template>

      <template #cell:status="{ item }">
        <Chip
          :label="COUPON_STATUS_META[item.status].label"
          :color="COUPON_STATUS_META[item.status].color"
          size="sm"
          showDot
        />
      </template>

      <template #cell:valid_until="{ value }">
        {{ formatCouponDate(value as string) }}
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
        <CouponCard
          :coupon="item"
          :action-items="getActionItems(item)"
          @click="handleRowClick(item)"
        />
      </template>
    </DataTable>

    <DeleteConfirmationModal
      v-model="showDelete"
      :loading="isDeleting"
      header="Delete Coupon"
      paragraph="Are you sure you want to delete this coupon? This action cannot be undone."
      action-label="Delete Coupon"
      @delete="confirmDelete"
    />

    <CouponFilterDrawer v-model="showFilter" @apply="onApplyFilters" />
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
import CouponCard from "./coupon/CouponCard.vue"
import CouponUsageBar from "./coupon/CouponUsageBar.vue"
import CouponFilterDrawer from "./CouponFilterDrawer.vue"
import { COUPON_COLUMNS, COUPON_STATUS_META, COUPON_SCOPE_META } from "../constants"
import {
  deriveScope,
  deriveStatus,
  formatCouponDate,
  normalizeCouponList,
  couponValueLabel,
} from "../utils"
import { useGetCoupons, useDeleteCoupon, useToggleCoupon } from "../api"
import type { TCoupon, TCouponRow } from "../types"
import { toast } from "@/composables/useToast"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { useFormatCurrency } from "@/composables/useFormatCurrency"

const emit = defineEmits<{
  add: []
  edit: [TCoupon]
  duplicate: [TCoupon]
  empty: [boolean]
}>()

const router = useRouter()
const { format } = useFormatCurrency()

// search + pagination state
const search = ref("")
const debouncedSearch = useDebouncedRef(search, 750)
const page = ref(1)
const itemsPerPage = ref(10)

watch(debouncedSearch, () => {
  page.value = 1
})

const params = computed<Record<string, string | number>>(() => {
  const p: Record<string, string | number> = {
    offset: (page.value - 1) * itemsPerPage.value,
    limit: itemsPerPage.value,
  }
  if (debouncedSearch.value) p.search = debouncedSearch.value
  return p
})

const { data, isFetching, refetch } = useGetCoupons(params)

const normalized = computed(() => normalizeCouponList(data.value))
const rows = computed<TCouponRow[]>(() =>
  normalized.value.results.map((c) => ({
    ...c,
    scope: deriveScope(c),
    status: deriveStatus(c),
  })),
)
const count = computed(() => normalized.value.count)

// client-side filtering (Task 4) — list API only supports search + ordering,
// so filters are applied over the current page only.
const showFilter = ref(false)
const activeFilters = ref<{ status: string | null; scope: string | null; type: string | null }>({
  status: null,
  scope: null,
  type: null,
})
const filterCount = computed(
  () => Object.values(activeFilters.value).filter((v) => v !== null).length,
)

const filteredRows = computed(() =>
  rows.value.filter((r) => {
    if (activeFilters.value.status && r.status !== activeFilters.value.status) return false
    if (activeFilters.value.scope && r.scope !== activeFilters.value.scope) return false
    if (activeFilters.value.type) {
      const kind = r.discount_type === "flat" ? "fixed" : "percentage"
      if (kind !== activeFilters.value.type) return false
    }
    return true
  }),
)

const onApplyFilters = (f: Record<string, string | null>) => {
  activeFilters.value = {
    status: f.status ?? null,
    scope: f.scope ?? null,
    type: f.type ?? null,
  }
  page.value = 1
}

const valueLabel = (c: TCoupon) => couponValueLabel(c, format)

const isEmpty = computed(
  () => !isFetching.value && rows.value.length === 0 && !debouncedSearch.value,
)
watch(isEmpty, (v) => emit("empty", v), { immediate: true })

// row click → details
const handleRowClick = (c: TCouponRow) => {
  router.push(`/discounts/coupons/${c.uid}`)
}

// toggle (disable/enable)
const { mutate: toggleCoupon } = useToggleCoupon()
const handleToggle = (c: TCouponRow) => {
  const next = !c.is_active
  toggleCoupon(
    { uid: c.uid, is_active: next },
    {
      onSuccess: () => {
        toast.success(next ? "Coupon enabled" : "Coupon disabled")
        refetch()
      },
      onError: () => toast.error("Could not update coupon status"),
    },
  )
}

// delete
const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCoupon()
const showDelete = ref(false)
const deleteTarget = ref<TCouponRow | null>(null)
const askDelete = (c: TCouponRow) => {
  deleteTarget.value = c
  showDelete.value = true
}
const confirmDelete = () => {
  if (!deleteTarget.value) return
  deleteCoupon(deleteTarget.value.uid, {
    onSuccess: () => {
      toast.success("Coupon deleted")
      showDelete.value = false
      deleteTarget.value = null
      refetch()
    },
    onError: () => toast.error("Could not delete coupon"),
  })
}

// row action menu
const getActionItems = (c: TCouponRow) => [
  {
    id: "view",
    label: "View Coupon",
    icon: "eye-outline",
    action: () => router.push(`/discounts/coupons/${c.uid}`),
  },
  {
    id: "edit",
    label: "Edit Coupon",
    icon: "edit",
    action: () => emit("edit", c),
  },
  {
    id: "duplicate",
    label: "Duplicate Coupon",
    icon: "copy",
    action: () => emit("duplicate", c),
  },
  {
    id: "toggle",
    label: c.is_active ? "Disable Coupon" : "Enable Coupon",
    icon: c.is_active ? "disable" : "check-circle",
    action: () => handleToggle(c),
  },
  { divider: true },
  {
    id: "delete",
    label: "Delete Coupon",
    icon: "trash",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
    action: () => askDelete(c),
  },
]

defineExpose({ refetch })
</script>
