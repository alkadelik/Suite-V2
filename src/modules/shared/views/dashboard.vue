<template>
  <div class="px-4 py-4 md:p-4">
    <SectionHeader
      size="lg"
      :title="`${greetings}, ${user?.first_name} 👋`"
      subtitle="What would you like to do today?"
    />

    <div class="my-4 rounded-xl bg-white px-0 pb-2 md:my-6 md:p-4">
      <!-- <h2 class="md:text-md mb-3 text-sm font-semibold">Quick Actions</h2> -->

      <div class="grid grid-cols-3 gap-3 md:gap-4 xl:grid-cols-5">
        <div
          v-for="action in quickActions.slice(0, isMobile ? 3 : 5)"
          :key="action.label"
          class="cursor-pointer rounded-2xl border px-2 py-3 text-center md:border-0 md:p-4 md:text-left"
          :class="action.color"
          @click="action.action && action.action()"
        >
          <div class="mb-1 flex items-center justify-between md:mb-4">
            <div
              class="border-core-200 mx-auto flex size-10 items-center justify-center rounded-xl border bg-white p-2 md:mx-0"
            >
              <Icon :name="action.icon" size="28" />
            </div>

            <Icon v-if="!isMobile" name="arrow-right" />
          </div>
          <span class="text-xs font-medium md:text-base">{{ action.label }}</span>
        </div>
      </div>
    </div>

    <SectionHeader
      size="md"
      title="Your store at a glance"
      subtitle="Here’s what’s happening in your store this week."
      class="mb-4"
    />

    <div
      v-if="orders?.results?.length"
      class="space-y-4 overflow-hidden rounded-xl border-gray-200 md:border md:bg-white"
    >
      <DataTable
        :data="orders?.results ?? []"
        :columns="ORDER_COLUMNS.filter((col) => col.accessor !== 'actions')"
        :loading="isPending"
        :show-pagination="false"
        :enable-row-selection="false"
        :empty-state="{
          title: 'You don’t have any sales data yet!',
          description: `Once you start adding products and recording orders, your performance will show up here.`,
        }"
        @row-click="
          (row) => {
            selectedOrder = row
            openDetails = true
          }
        "
      >
        <template #cell:items="{ item }">
          <ProductAvatar
            :name="item.items?.[0].product_name"
            :url="undefined"
            :variants-count="item.items.length > 1 ? item.items.length : undefined"
            :variants-count-text="`+ ${item.items.length - 1}`"
            shape="rounded"
            class="!gap-2 capitalize"
            max-width="100px"
          />
        </template>
        <template #cell:fulfilment_status="{ item }">
          <Chip
            :color="item.fulfilment_status === 'fulfilled' ? 'success' : 'primary'"
            :label="item.fulfilment_status === 'fulfilled' ? 'Yes' : 'No'"
          />
        </template>
        <!--  -->
        <template #cell:payment_status="{ item }">
          <Chip
            :icon="item.payment_status === 'paid' ? 'card-tick' : 'card-pos'"
            :label="startCase(item.payment_status)"
            :color="
              item.payment_status === 'paid'
                ? 'success'
                : item.payment_status === 'partially_paid'
                  ? 'warning'
                  : 'error'
            "
          />
        </template>
        <!--  -->
        <template #cell:customer_info="{ item }">
          <span>
            {{ item.customer_name || anonymousCustomer.full_name }}
          </span>
        </template>
        <template #mobile="{ item }">
          <OrderCard
            :order="item"
            @click="
              () => {
                selectedOrder = item
                openDetails = true
              }
            "
            :show-actions="false"
          />
        </template>
      </DataTable>
    </div>

    <EmptyState
      v-else
      title="You don’t have any sales data yet!"
      description="Once you start adding products and recording orders, your performance will show up here."
      class="!min-h-[50vh]"
      :loading="isPending"
    />

    <!--  -->
    <WelcomeToTeamModal v-model="openModal" />

    <OrderDetailsDrawer
      v-if="selectedOrder"
      :open="openDetails"
      @close="openDetails = false"
      :order="selectedOrder"
    />
  </div>
</template>

<script setup lang="ts">
import SectionHeader from "@components/SectionHeader.vue"
import { useAuthStore } from "@modules/auth/store"
import { useSettingsStore } from "@modules/settings/store"
import WelcomeToTeamModal from "../components/WelcomeToTeamModal.vue"
import { computed, ref, watch } from "vue"
import Icon from "@components/Icon.vue"
import EmptyState from "@components/EmptyState.vue"
import { useMediaQuery } from "@vueuse/core"
import { useRouter } from "vue-router"
import { usePremiumAccess } from "@/composables/usePremiumAccess"
import { useGetOrders } from "@modules/orders/api"
import { startCase } from "@/utils/format-strings"
import Chip from "@components/Chip.vue"
import { anonymousCustomer, ORDER_COLUMNS } from "@modules/orders/constants"
import DataTable from "@components/DataTable.vue"
import OrderCard from "@modules/orders/components/OrderCard.vue"
import { formatError } from "@/utils/error-handler"
import OrderDetailsDrawer from "@modules/orders/components/OrderDetailsDrawer.vue"
import { TOrder } from "@modules/orders/types"
import ProductAvatar from "@components/ProductAvatar.vue"

const { user } = useAuthStore()
const openModal = ref(false)
const router = useRouter()
const { checkPremiumAccess } = usePremiumAccess()

const isMobile = useMediaQuery("(max-width: 768px)")
const openDetails = ref(false)
const selectedOrder = ref<TOrder | null>(null)

const greetings = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
})

const isHQ = computed(() => useSettingsStore().activeLocation?.is_hq ?? true)
const { data: orders, isPending, isError, error } = useGetOrders()

// Reload page if location ID error occurs
// This can happen if the user switches to a location but state still has the previous location ID
watch(isError, (newVal) => {
  if (newVal) {
    const errMsg = formatError(error.value)?.toLowerCase()
    if (errMsg?.includes("location") && errMsg?.includes("id")) {
      window.location.reload()
    }
  }
})

const quickActions = computed(() => {
  const allActions = [
    {
      label: "Add a product",
      icon: "box",
      color: "bg-blue-50 text-blue-700",
      action: () => {
        if (!checkPremiumAccess()) return
        router.push("/inventory?create=true")
      },
      hqOnly: true,
    },
    {
      label: "Record a sale",
      icon: "bag",
      color: "bg-green-50 text-green-700",
      action: () => {
        if (!checkPremiumAccess()) return
        router.push("/orders?create=true")
      },
    },
    {
      label: "Create popup",
      icon: "calendar-tick",
      color: "bg-purple-50 text-purple-700",
      action: () => {
        if (!checkPremiumAccess()) return
        router.push("/popups?create=true")
      },
      hqOnly: true,
    },
    {
      label: "Add a customer",
      icon: "profile-add",
      color: "bg-primary-50 text-primary-700",
      action: () => {
        if (!checkPremiumAccess()) return
        router.push("/customers?create=true")
      },
    },
    {
      label: "Record expense",
      icon: "receipt-add",
      color: "bg-pink-50 text-pink-700",
      action: () => {
        if (!checkPremiumAccess()) return
        router.push("/expenses?create=true")
      },
    },
  ]

  return allActions.filter((action) => !action.hqOnly || isHQ.value)
})
</script>
