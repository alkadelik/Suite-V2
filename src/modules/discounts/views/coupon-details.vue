<template>
  <PageHeader inner title="Coupon Details" back-link="/discounts" :show-tutorial="true" />

  <div class="px-4 pt-2 pb-4 md:p-6">
    <!-- Loading -->
    <div v-if="isLoading" class="space-y-4">
      <div class="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="h-80 animate-pulse rounded-2xl bg-gray-100" />
        <div class="h-80 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>

    <!-- Error / empty -->
    <EmptyState
      v-else-if="!coupon"
      title="Coupon not found"
      description="This coupon may have been deleted or the link is invalid."
      action-label="Back to Discounts"
      action-icon="arrow-left"
      @action="router.push('/discounts')"
    />

    <template v-else>
      <!-- Desktop back button -->
      <BackButton
        to="/discounts"
        label="Back"
        icon="arrow-left"
        class="mb-2 hidden md:inline-flex"
      />

      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h1 class="font-serif text-xl font-semibold text-gray-900 md:text-2xl">
            {{ coupon.name }}
          </h1>

          <!-- Code + copy -->
          <div class="mt-1 flex items-center gap-2">
            <span class="font-mono text-sm text-gray-500">{{ coupon.code }}</span>
            <button
              type="button"
              class="text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Copy coupon code"
              @click="copyCode"
            >
              <Icon name="copy" size="16" />
            </button>
          </div>

          <!-- Chips -->
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Chip :label="scopeLabel" color="purple" />
            <Chip :label="statusMeta.label" :color="statusMeta.color" show-dot />
          </div>
        </div>

        <!-- Manage Coupon -->
        <div class="shrink-0">
          <DropdownMenu
            :items="manageItems"
            placement="bottom-end"
            menu-width="auto"
            trigger-class="inline-flex items-center justify-center p-1.5 text-gray-600 md:gap-2 md:rounded-lg md:border md:border-primary-600 md:bg-primary-50 md:px-3 md:py-2 md:text-sm md:font-medium md:text-primary-600 md:hover:bg-primary-100"
          >
            <template #trigger>
              <Icon name="setting" size="18" class="hidden md:inline-block" />
              <span class="hidden md:inline">Manage Coupon</span>
              <Icon name="dots-vertical" size="20" class="md:hidden" />
            </template>
          </DropdownMenu>
        </div>
      </div>

      <!-- Body -->
      <!-- Order scope: gauge + settings -->
      <div v-if="scope === 'order'" class="mt-5 grid items-stretch gap-4 lg:grid-cols-2">
        <CouponUsageGauge :coupon="coupon" :usage="usage" />
        <CouponSettingsCard :coupon="coupon" />
      </div>

      <!-- Products / category scope: usage bar + target + settings -->
      <div v-else class="mt-5 grid gap-4 lg:grid-cols-2">
        <div class="space-y-4">
          <!-- Usage progress bar -->
          <!-- outer light-grey frame (mobile), no frame on desktop -->
          <div class="rounded-[20px] bg-gray-100 p-1.5 md:rounded-2xl md:bg-transparent md:p-0">
            <div class="rounded-2xl bg-white px-4 py-4 md:border md:border-gray-200 md:px-5">
              <div class="flex items-center gap-3">
                <span
                  class="bg-primary-50 text-primary-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                >
                  <Icon name="tag-2" size="18" />
                </span>
                <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    class="bg-primary-600 h-full rounded-full"
                    :style="{ width: `${usagePercent}%` }"
                  />
                </div>
                <span class="shrink-0 text-xs font-medium text-gray-600">
                  {{ usedCount }}/{{ usageLimitLabel }} Coupon Used
                </span>
              </div>
            </div>
          </div>

          <CouponTargetCard :coupon="coupon" />
        </div>

        <CouponSettingsCard :coupon="coupon" />
      </div>
    </template>
  </div>

  <!-- Edit / Duplicate drawer -->
  <CreateCouponDrawer
    :open="showDrawer"
    :mode="drawerMode"
    :coupon="coupon"
    @close="showDrawer = false"
    @saved="onSaved"
  />

  <!-- Delete confirmation -->
  <DeleteConfirmationModal
    v-model="showDelete"
    header="Delete Coupon"
    :paragraph="`Are you sure you want to delete the coupon '${coupon?.name ?? ''}'?`"
    :loading="isDeleting"
    action-label="Delete Coupon"
    @delete="confirmDelete"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import PageHeader from "@components/PageHeader.vue"
import BackButton from "@components/BackButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import EmptyState from "@components/EmptyState.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import CreateCouponDrawer from "../components/CreateCouponDrawer.vue"
import CouponUsageGauge from "../components/coupon/CouponUsageGauge.vue"
import CouponSettingsCard from "../components/coupon/CouponSettingsCard.vue"
import CouponTargetCard from "../components/coupon/CouponTargetCard.vue"
import { useGetCoupon, useGetCouponUsage, useToggleCoupon, useDeleteCoupon } from "../api"
import { deriveScope, deriveStatus } from "../utils"
import { COUPON_STATUS_META, couponScopeHeaderLabel } from "../constants"
import { toast } from "@/composables/useToast"
import type { TCoupon, TCouponUsageStats } from "../types"

const route = useRoute()
const router = useRouter()

const uid = computed(() => String(route.params.uid))

// --- Data ---
const { data, isLoading, refetch } = useGetCoupon(uid)
const { data: usageData, refetch: refetchUsage } = useGetCouponUsage(uid)

/** Normalize the single coupon (handles wrapped + direct shapes), typed. */
const coupon = computed<TCoupon | null>(() => {
  const raw = data.value as { data?: TCoupon } | TCoupon | undefined
  if (!raw) return null
  if ("uid" in raw) return raw
  return raw.data ?? null
})

const usage = computed<TCouponUsageStats | null>(() => usageData.value ?? null)

// --- Derived ---
const scope = computed(() => (coupon.value ? deriveScope(coupon.value) : "order"))
const statusMeta = computed(() => {
  const s = coupon.value ? deriveStatus(coupon.value) : "active"
  return COUPON_STATUS_META[s]
})

const scopeLabel = computed(() => {
  if (!coupon.value) return ""
  if ((coupon.value.applicable_categories?.length ?? 0) > 0) return "Category"
  const kind = coupon.value.discount_type === "flat" ? "fixed" : "percentage"
  return couponScopeHeaderLabel(scope.value, kind)
})

// Usage (products/category top bar)
const usedCount = computed(() => usage.value?.total_usage ?? 0)
const usageLimit = computed(() => coupon.value?.max_usage ?? null)
const usageLimitLabel = computed(() => (usageLimit.value != null ? String(usageLimit.value) : "∞"))
const usagePercent = computed(() => {
  if (usageLimit.value == null || usageLimit.value <= 0) return 0
  return Math.min(100, Math.round((usedCount.value / usageLimit.value) * 100))
})

// --- Copy code ---
async function copyCode() {
  if (!coupon.value) return
  try {
    await navigator.clipboard.writeText(coupon.value.code)
    toast.success("Code copied")
  } catch {
    toast.error("Could not copy code")
  }
}

// --- Manage actions ---
const showDrawer = ref(false)
const drawerMode = ref<"edit" | "duplicate">("edit")

function openEdit() {
  drawerMode.value = "edit"
  showDrawer.value = true
}
function openDuplicate() {
  drawerMode.value = "duplicate"
  showDrawer.value = true
}

function onSaved() {
  showDrawer.value = false
  toast.success(drawerMode.value === "edit" ? "Coupon updated!" : "Coupon duplicated!")
  void refetch()
  void refetchUsage()
}

// Toggle (disable / enable)
const { mutate: toggleCoupon } = useToggleCoupon()
function toggleActive() {
  if (!coupon.value) return
  const next = !coupon.value.is_active
  toggleCoupon(
    { uid: uid.value, is_active: next },
    {
      onSuccess: () => {
        toast.success(next ? "Coupon enabled" : "Coupon disabled")
        void refetch()
      },
      onError: () => toast.error("Could not update coupon status"),
    },
  )
}

// Delete
const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCoupon()
const showDelete = ref(false)
function confirmDelete() {
  deleteCoupon(uid.value, {
    onSuccess: () => {
      toast.success("Coupon deleted")
      showDelete.value = false
      void router.push("/discounts")
    },
    onError: () => toast.error("Could not delete coupon"),
  })
}

const manageItems = computed(() => {
  const isActive = coupon.value?.is_active ?? false
  return [
    { id: "edit", label: "Edit Coupon", icon: "edit", action: openEdit },
    { id: "duplicate", label: "Duplicate Coupon", icon: "copy", action: openDuplicate },
    {
      id: "toggle",
      label: isActive ? "Disable Coupon" : "Enable Coupon",
      icon: isActive ? "disable" : "check-circle",
      action: toggleActive,
    },
    { divider: true },
    {
      id: "delete",
      label: "Delete Coupon",
      icon: "trash",
      class: "text-red-600 hover:bg-red-50",
      iconClass: "text-red-600",
      action: () => (showDelete.value = true),
    },
  ]
})
</script>
