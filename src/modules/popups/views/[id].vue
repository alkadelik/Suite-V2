<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { startCase } from "@/utils/format-strings"
import { formatDate } from "@/utils/formatDate"
import PageHeader from "@components/PageHeader.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import Icon from "@components/Icon.vue"
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useGetPopupEventById } from "../api"
import Tabs from "@components/Tabs.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import CreatePopupEventModal from "../components/CreatePopupEventModal.vue"
import DeletePopupEvent from "../components/DeletePopupEvent.vue"
import PopupSalesTab from "../components/popup-tabs/PopupSalesTab.vue"
import PopupInventoryTab from "../components/popup-tabs/PopupInventoryTab.vue"
import { clipboardCopy } from "@/utils/others"
import { useMediaQuery } from "@vueuse/core"
import Collapsible from "@components/Collapsible.vue"
import { useSettingsStore } from "@modules/settings/store"
import ClosePopupModal from "../components/ClosePopupModal.vue"
import BackButton from "@components/BackButton.vue"
import AppButton from "@components/AppButton.vue"
import StatCard from "@components/StatCard.vue"

const route = useRoute()
const router = useRouter()
const openDelete = ref(false)
const openEdit = ref(false)
const openClose = ref(false)
const activeTab = ref((route.query.tab as string) || "overview")

watch(
  () => route.query.tab,
  (tab) => {
    if (tab) activeTab.value = tab as string
  },
)

const { format } = useFormatCurrency()
const storefrontUrl = computed(() => useSettingsStore().displayDomain)
const isMobile = useMediaQuery("(max-width: 768px)")

const { data: popupEvt, isPending, refetch } = useGetPopupEventById(route.params.id as string)

const overviewInfo = computed(() => {
  return {
    Date: `${formatDate(popupEvt.value?.start_date || "")} - ${formatDate(popupEvt.value?.end_date || "")}`,
    "Participation Fee": Number(popupEvt.value?.participation_fee)
      ? format(popupEvt.value?.participation_fee || 0)
      : "Free",
    Description: popupEvt.value?.description || "N/A",
  }
})

const popupUrl = computed(() => `${storefrontUrl.value}/events/${popupEvt.value?.slug}`)

const statusColor = computed(() => {
  if (popupEvt.value?.status === "upcoming") return "primary"
  if (popupEvt.value?.status === "active") return "success"
  if (popupEvt.value?.status === "closed") return "error"
  return "alt"
})

// Popup summary metrics
const metrics = computed(() => {
  const evt = popupEvt.value
  const revenue = evt?.total_sales_amount || 0
  const totalOrders = evt?.total_orders || 0
  const totalUnits = evt?.total_items_count || 0
  const unitsSold = evt?.items_sold_count || 0

  return [
    {
      label: "Total Revenue",
      value: format(revenue),
      icon: "moneys-solid",
      iconClass: "lg:text-green-700",
      chip: totalOrders ? `${totalOrders} orders` : undefined,
    },
    {
      label: "Avg Order Value",
      value: format(totalOrders ? revenue / totalOrders : 0),
      icon: "trend-up",
      iconClass: "lg:text-blue-700",
    },
    {
      label: "Total Products",
      value: String(evt?.products_count || 0),
      icon: "box",
      iconClass: "lg:text-purple-700",
      chip: totalUnits ? `${totalUnits} units` : undefined,
    },
    {
      label: "Total Units Sold",
      value: String(unitsSold),
      icon: "bag-2",
      iconClass: "lg:text-orange-700",
      chip: totalUnits ? `${Math.round((unitsSold / totalUnits) * 100)}% of stock sold` : undefined,
    },
    {
      label: "Total Customers",
      value: String(evt?.customer_count || 0),
      icon: "people",
      iconClass: "lg:text-pink-700",
    },
  ]
})

// Mobile shows the first two metrics until "See More" expands the rest
const showAllMetrics = ref(false)
const visibleMetrics = computed(() =>
  isMobile.value && !showAllMetrics.value ? metrics.value.slice(0, 2) : metrics.value,
)

const canRecordActions = computed(() =>
  ["upcoming", "active"].includes(popupEvt.value?.status || ""),
)

const goToAddProduct = () => {
  router.replace({ query: { ...route.query, tab: "overview", action: "add-products" } })
}
const goToRecordSales = () => {
  router.replace({ query: { ...route.query, tab: "sales", action: "add-sale" } })
}

const actionMenu = computed(() => {
  const actions = []
  if (popupEvt.value?.status !== "past") {
    actions.push({
      label: "Edit Event",
      icon: "edit",
      action: () => (openEdit.value = true),
    })
  }
  if (popupEvt.value?.status === "active") {
    actions.push({ divider: true })
    actions.push({
      label: "Add Products",
      icon: "box-add",
      action: () =>
        router.replace({ query: { ...route.query, tab: "overview", action: "add-products" } }),
    })
    actions.push({
      label: "Add Sales",
      icon: "shopping-cart-outline",
      action: () => router.replace({ query: { ...route.query, tab: "sales", action: "add-sale" } }),
    })
  }
  if (!popupEvt.value?.total_orders && !["past", "closed"].includes(popupEvt.value?.status || "")) {
    actions.push({ divider: true })
  }
  if (popupEvt.value?.status !== "closed") {
    actions.push({
      label: "Close Event",
      icon: "close-circle",
      iconClass: "text-red-500",
      class: "text-red-500",
      action: () => (openClose.value = true),
    })
  }
  if (!popupEvt.value?.total_orders) {
    actions.push({
      label: "Delete Event",
      icon: "trash",
      iconClass: "text-red-500",
      class: "text-red-500",
      action: () => (openDelete.value = true),
    })
  }
  return actions
})

const downloadQrCode = async () => {
  if (!popupEvt.value?.qr_code) return
  try {
    // "https://res.cloudinary.com/do2uxmtsx/image/upload/v1781867095/blank-avatar_vgt0by.jpg",
    const res = await fetch(popupEvt.value.qr_code)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${popupEvt.value.slug || "popup"}-qr-code.png`
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.log("Error downloading image:", error)
    window.open(popupEvt.value.qr_code, "_blank")
  }
}
</script>

<template>
  <PageHeader title="Popup Details" inner back-link="/popups" />

  <div class="hidden p-4 pb-0 md:inline-block">
    <BackButton label="Back to Popups" to="/popups" />
  </div>

  <EmptyState
    v-if="isPending || !popupEvt"
    title="Event Details"
    description="Details for this event is currently not available."
    :loading="isPending"
  />

  <section v-else class="flex flex-col px-4 py-4 md:px-8 md:py-6">
    <section>
      <!-- Header: name, status, storefront link + actions -->
      <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h2 class="min-w-0 truncate text-xl font-semibold capitalize md:text-2xl">
              {{ popupEvt.name }}
            </h2>
            <Chip
              :label="popupEvt.status"
              size="sm"
              class="flex-shrink-0 capitalize"
              show-dot
              :color="statusColor"
            />
          </div>
          <p class="text-core-600 mt-1.5 flex items-center gap-2 text-xs md:text-sm">
            <span class="min-w-0 truncate">{{ popupUrl }}</span>
            <Icon
              name="copy"
              size="18"
              class="flex-shrink-0 cursor-pointer"
              @click="clipboardCopy(popupUrl)"
            />
          </p>
        </div>

        <div class="flex flex-shrink-0 items-center gap-3">
          <AppButton
            v-if="canRecordActions"
            label="Add Product"
            icon="box-add"
            color="alt"
            size="sm"
            class="flex-1 md:flex-none"
            @click="goToAddProduct"
          />
          <AppButton
            v-if="canRecordActions"
            label="Record Sales"
            icon="shopping-cart-outline"
            size="sm"
            class="flex-1 md:flex-none"
            @click="goToRecordSales"
          />
          <DropdownMenu v-if="popupEvt.status !== 'closed'" :items="actionMenu" />
        </div>
      </div>

      <!-- Popup summary metrics -->
      <div class="mb-6">
        <div class="mb-3 flex items-center justify-between md:hidden">
          <h3 class="text-base font-semibold">Metrics</h3>
          <button
            type="button"
            class="text-primary-700 flex cursor-pointer items-center gap-1 text-sm font-medium"
            @click="showAllMetrics = !showAllMetrics"
          >
            {{ showAllMetrics ? "See Less" : "See More" }}
            <Icon
              name="chevron-down"
              size="16"
              :class="['transition-transform', showAllMetrics ? 'rotate-180' : '']"
            />
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
          <StatCard v-for="metric in visibleMetrics" :key="metric.label" :stat="metric" />
        </div>
      </div>

      <Tabs
        v-model="activeTab"
        :tabs="[
          { title: 'Overview', key: 'overview' },
          { title: 'Sales', key: 'sales' },
        ]"
      >
        <template #overview>
          <div class="mb-6 flex flex-col gap-6 md:flex-row md:items-start">
            <div class="min-w-0 flex-1">
              <PopupInventoryTab :popup="popupEvt" />
            </div>

            <div class="md:sticky md:top-4 md:w-md md:flex-shrink-0">
              <Collapsible header="Popup Details" :default-open="true">
                <template #body>
                  <div class="divide-core-100 divide-y">
                    <div
                      v-for="(value, key) in overviewInfo"
                      :key="key"
                      class="flex flex-col gap-1 py-3 text-sm"
                    >
                      <p class="text-core-600 flex-1 font-semibold">{{ startCase(key) }}</p>
                      <p class="flex-2 font-medium">{{ value }}</p>
                    </div>
                    <div v-if="popupEvt.qr_code" class="flex flex-col gap-2 py-3 text-sm">
                      <p class="text-core-600 flex-1 font-semibold">QR Code</p>
                      <div class="flex items-end gap-3">
                        <img
                          :src="popupEvt.qr_code"
                          alt="Event QR code"
                          class="border-core-100 h-24 w-24 rounded-lg border p-1"
                        />
                        <AppButton
                          variant="outlined"
                          label="Download"
                          icon="download-cloud-02"
                          size="xs"
                          @click="downloadQrCode"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </Collapsible>
            </div>
          </div>
        </template>
        <template #sales>
          <PopupSalesTab
            :is-active="popupEvt.status === 'active'"
            :start-date="popupEvt?.start_date"
            :popup="popupEvt"
          />
        </template>
      </Tabs>
    </section>

    <!-- Create/Edit Popup Event Modal -->
    <CreatePopupEventModal
      :open="openEdit"
      @close="openEdit = false"
      :is-edit-mode="true"
      :event="popupEvt"
      @refresh="
        () => {
          refetch()
        }
      "
    />

    <DeletePopupEvent
      :open="openDelete"
      @close="openDelete = false"
      :event="popupEvt"
      @refresh="() => $router.push('/popups')"
    />

    <ClosePopupModal
      :open="openClose"
      @close="openClose = false"
      :event="popupEvt"
      @refresh="refetch"
    />
  </section>
</template>
