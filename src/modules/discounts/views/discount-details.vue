<template>
  <PageHeader inner title="Discount Details" back-link="/discounts" :show-tutorial="true" />

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
      v-else-if="!discount"
      title="Discount not found"
      description="This discount may have been deleted or the link is invalid."
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
            {{ discount.name }}
          </h1>

          <!-- Chips -->
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Chip :label="scopeLabel" :color="scopeChipColor" />
            <Chip :label="statusMeta.label" :color="statusMeta.color" show-dot />
          </div>
        </div>

        <!-- Manage Discount -->
        <div class="shrink-0">
          <DropdownMenu
            :items="manageItems"
            placement="bottom-end"
            menu-width="auto"
            trigger-class="inline-flex items-center justify-center rounded-xl bg-primary-50 p-2 text-gray-700 md:gap-2 md:rounded-lg md:border md:border-primary-600 md:px-3 md:py-2 md:text-sm md:font-medium md:text-primary-600 md:hover:bg-primary-100"
          >
            <template #trigger>
              <span class="hidden items-center gap-2 md:inline-flex">
                <Icon name="setting" size="18" />
                Manage Discount
              </span>
              <span class="inline-flex md:hidden">
                <Icon name="dots-vertical" size="20" />
              </span>
            </template>
          </DropdownMenu>
        </div>
      </div>

      <!-- Target products/categories + settings.
           Block-stack on mobile (grid items' min-width:auto overflows narrow
           screens); switch to 2-col grid at lg. -->
      <div class="mt-5 space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        <DiscountTargetCard :discount="discount" />
        <DiscountSettingsCard :discount="discount" />
      </div>
    </template>
  </div>

  <!-- Edit / Duplicate drawer -->
  <CreateDiscountDrawer
    :open="showDrawer"
    :mode="drawerMode"
    :discount="discount"
    @close="showDrawer = false"
    @saved="onSaved"
  />

  <!-- Delete confirmation -->
  <DeleteConfirmationModal
    v-model="showDelete"
    header="Delete Discount"
    :paragraph="`Are you sure you want to delete the discount '${discount?.name ?? ''}'?`"
    :loading="isDeleting"
    action-label="Delete Discount"
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
import CreateDiscountDrawer from "../components/CreateDiscountDrawer.vue"
import DiscountSettingsCard from "../components/discount/DiscountSettingsCard.vue"
import DiscountTargetCard from "../components/discount/DiscountTargetCard.vue"
import { useGetDiscount, useToggleDiscount, useDeleteDiscount } from "../api"
import { deriveDiscountScope } from "../utils"
import { DISCOUNT_STATUS_META, DISCOUNT_SCOPE_META, discountScopeHeaderLabel } from "../constants"
import { toast } from "@/composables/useToast"
import type { TDiscountDetail } from "../types"

const route = useRoute()
const router = useRouter()

const uid = computed(() => String(route.params.uid))

const { data, isLoading, refetch } = useGetDiscount(uid)

const discount = computed<TDiscountDetail | null>(() => {
  const raw = data.value as { data?: TDiscountDetail } | TDiscountDetail | undefined
  if (!raw) return null
  if ("uid" in raw) return raw
  return raw.data ?? null
})

const scope = computed(() => (discount.value ? deriveDiscountScope(discount.value) : "products"))
const statusMeta = computed(() => {
  const s = discount.value?.status ?? "active"
  return DISCOUNT_STATUS_META[s] ?? { label: s, color: "alt" as const }
})
const kind = computed(() =>
  discount.value?.discount_type === "fixed_amount" ? "fixed" : "percentage",
)
const scopeLabel = computed(() => discountScopeHeaderLabel(scope.value, kind.value))
const scopeChipColor = computed(() => DISCOUNT_SCOPE_META[scope.value].color)

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
  toast.success(drawerMode.value === "edit" ? "Discount updated!" : "Discount duplicated!")
  void refetch()
}

const { mutate: toggleDiscount } = useToggleDiscount()
function toggleActive() {
  if (!discount.value) return
  const next = !discount.value.is_enabled
  toggleDiscount(
    { uid: uid.value },
    {
      onSuccess: () => {
        toast.success(next ? "Discount enabled" : "Discount disabled")
        void refetch()
      },
      onError: () => toast.error("Could not update discount status"),
    },
  )
}

const { mutate: deleteDiscount, isPending: isDeleting } = useDeleteDiscount()
const showDelete = ref(false)
function confirmDelete() {
  deleteDiscount(uid.value, {
    onSuccess: () => {
      toast.success("Discount deleted")
      showDelete.value = false
      void router.push("/discounts")
    },
    onError: () => toast.error("Could not delete discount"),
  })
}

const manageItems = computed(() => {
  const isActive = discount.value?.is_enabled ?? false
  return [
    { id: "edit", label: "Edit Discount", icon: "edit", action: openEdit },
    { id: "duplicate", label: "Duplicate Discount", icon: "copy", action: openDuplicate },
    {
      id: "toggle",
      label: isActive ? "Disable Discount" : "Enable Discount",
      icon: isActive ? "disable" : "check-circle",
      action: toggleActive,
    },
    { divider: true },
    {
      id: "delete",
      label: "Delete Discount",
      icon: "trash",
      class: "text-red-600 hover:bg-red-50",
      iconClass: "text-red-600",
      action: () => (showDelete.value = true),
    },
  ]
})
</script>
