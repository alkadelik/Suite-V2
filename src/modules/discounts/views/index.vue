<template>
  <PageHeader title="Discounts" />

  <div class="p-4 md:p-6">
    <!-- desktop header -->
    <SectionHeader
      title="Discounts"
      subtitle="Manage all your discounts and promos"
      class="hidden md:flex"
    />

    <Tabs
      :tabs="[
        { key: 'discounts', title: 'Discounts' },
        { key: 'coupons', title: 'Coupons' },
      ]"
      v-model="activeTab"
      class="mt-4"
      header-class="md:w-1/2"
    >
      <template #discounts>
        <EmptyState
          v-if="discountsEmpty"
          title="You don't have any discount or promo yet!"
          description="Add a new discount type for your orders by clicking the button below."
        >
          <template #action>
            <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <AppButton
                label="Add a discount"
                icon="add"
                variant="outlined"
                @click="openCreateDiscount"
              />
              <AppButton label="Add a Coupon" icon="add" variant="outlined" @click="openCreate" />
            </div>
          </template>
        </EmptyState>

        <DiscountsTab
          v-show="!discountsEmpty"
          ref="discountsTabRef"
          @add="openCreateDiscount"
          @edit="openEditDiscount"
          @duplicate="openDuplicateDiscount"
          @empty="(v) => (discountsEmpty = v)"
        />
      </template>

      <template #coupons>
        <EmptyState
          v-if="couponsEmpty"
          title="You don't have any discount or promo yet!"
          description="Add a new discount type for your orders by clicking the button below."
        >
          <template #action>
            <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <AppButton
                label="Add a discount"
                icon="add"
                variant="outlined"
                @click="openCreateDiscount"
              />
              <AppButton label="Add a Coupon" icon="add" variant="outlined" @click="openCreate" />
            </div>
          </template>
        </EmptyState>

        <CouponsTab
          v-show="!couponsEmpty"
          ref="couponsTabRef"
          @add="openCreate"
          @edit="openEdit"
          @duplicate="openDuplicate"
          @empty="(v) => (couponsEmpty = v)"
        />
      </template>
    </Tabs>

    <CreateCouponDrawer
      :open="showCreateDrawer"
      :mode="drawerMode"
      :coupon="editTarget"
      @close="showCreateDrawer = false"
      @saved="onSaved"
    />

    <CreateDiscountDrawer
      :open="showDiscountDrawer"
      :mode="discountDrawerMode"
      :discount="discountEditTarget"
      @close="showDiscountDrawer = false"
      @saved="onDiscountSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { storeToRefs } from "pinia"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import Tabs from "@components/Tabs.vue"
import EmptyState from "@components/EmptyState.vue"
import AppButton from "@components/AppButton.vue"
import DiscountsTab from "../components/DiscountsTab.vue"
import CouponsTab from "../components/CouponsTab.vue"
import CreateCouponDrawer from "../components/CreateCouponDrawer.vue"
import CreateDiscountDrawer from "../components/CreateDiscountDrawer.vue"
import { useDiscountsStore } from "../store"
import { toast } from "@/composables/useToast"
import type { TCoupon, TDiscount } from "../types"

const store = useDiscountsStore()
const { activeTab } = storeToRefs(store)

// --- Coupons ---
const couponsEmpty = ref(false)
const couponsTabRef = ref<InstanceType<typeof CouponsTab> | null>(null)
const showCreateDrawer = ref(false)
const drawerMode = ref<"create" | "edit" | "duplicate">("create")
const editTarget = ref<TCoupon | null>(null)

const openCreate = () => {
  drawerMode.value = "create"
  editTarget.value = null
  showCreateDrawer.value = true
}
const openEdit = (coupon: TCoupon) => {
  drawerMode.value = "edit"
  editTarget.value = coupon
  showCreateDrawer.value = true
}
const openDuplicate = (coupon: TCoupon) => {
  drawerMode.value = "duplicate"
  editTarget.value = coupon
  showCreateDrawer.value = true
}
const onSaved = () => {
  showCreateDrawer.value = false
  toast.success(drawerMode.value === "edit" ? "Coupon updated!" : "Success! New coupon created!")
  store.setActiveTab("coupons")
  couponsTabRef.value?.refetch?.()
}

// --- Discounts ---
const discountsEmpty = ref(false)
const discountsTabRef = ref<InstanceType<typeof DiscountsTab> | null>(null)
const showDiscountDrawer = ref(false)
const discountDrawerMode = ref<"create" | "edit" | "duplicate">("create")
const discountEditTarget = ref<TDiscount | null>(null)

const openCreateDiscount = () => {
  discountDrawerMode.value = "create"
  discountEditTarget.value = null
  showDiscountDrawer.value = true
}
const openEditDiscount = (discount: TDiscount) => {
  discountDrawerMode.value = "edit"
  discountEditTarget.value = discount
  showDiscountDrawer.value = true
}
const openDuplicateDiscount = (discount: TDiscount) => {
  discountDrawerMode.value = "duplicate"
  discountEditTarget.value = discount
  showDiscountDrawer.value = true
}
const onDiscountSaved = () => {
  showDiscountDrawer.value = false
  toast.success(
    discountDrawerMode.value === "edit" ? "Discount updated!" : "Success! New discount created!",
  )
  store.setActiveTab("discounts")
  discountsTabRef.value?.refetch?.()
}
</script>
